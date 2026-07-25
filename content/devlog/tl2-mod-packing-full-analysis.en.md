---
title: "What's Actually Inside a .MOD — Torchlight II's Packing Format, Fully Explained"
date: 2026-07-25T10:30:00+10:00
author: "Mikuro"
summary: "Everything that happens between a mod folder and a .MOD the game will actually load: how the container is assembled, what each of the five binary formats is, which single hash the game really validates, and how the pathing grid gets baked. Including the real mechanism behind those baffling failures — ticked in the launcher but does nothing / the portrait turned into some other image / players can't move after entering the dungeon."
aliases: ["/devlog/tl2-mod-packing-full-analysis/"]
---

> You tick a mod in the launcher, hit play, and the game has a new class, a new weapon, a new map.
> What *is* that `.MOD` file? How does it get built, and how does it get read back?
>
> This post takes the whole chain apart: **a mod folder → five binary formats → one container → the game loads it.**
> It's both a complete format specification (byte layouts, hash algorithms, function addresses) and an answer
> to questions like "why is my mod ticked but nothing happens" — those almost always trace back to one specific
> field in one of the sections below.
>
> **Sources**: IDA disassembly of `EditorGuts.dll` (the core of the official GUTS editor, 32-bit,
> imagebase `0x10000000`) and `Torchlight2.exe` (the reading side, imagebase `0x400000`); live frida probes
> hooked into a real bake to capture runtime ground truth; byte-for-byte comparison against shipped official
> data and native-packed output; full-corpus A/B regression. Every `sub_XXXXXXXX` is an absolute address.
>
> **How to read this**: if you only care about avoiding pitfalls, §0, §2.4, §2.5, §4, §8.2 and §8.6 are enough.
> If you're writing your own tooling, the format specs are in §2 and §5–§7, and Appendix A is an address lookup table.

---

## 0. The whole thing in ten sentences

1. **A `.MOD` is essentially a compressed archive with its own table of contents, plus an ID card.**
   Three parts: header (mod metadata), data section (every file as a zlib block), manifest (the file tree).
2. **Packing isn't just compression — it also compiles.** Five extensions of **text source** become binary:
   `.DAT`/`.TEMPLATE`/`.ANIMATION`/`.HIE` → BINDAT, `.LAYOUT` → BINLAYOUT. Everything else is packed as-is.
3. **Two more things get generated**: 7 RAW aggregate indices (the index cards the game uses at startup to
   find units/skills/affixes by type), and a `.mpp` pathing grid next to every level layout.
4. **The game validates exactly one hash — `rollingHash`.** Get it wrong and the entire mod is silently discarded.
   "Ticked in the launcher, does nothing in game" is usually this.
5. **Filenames in the manifest must be UPPERCASE.** The game uppercases the request path and then compares it
   against the stored name **as-is**. A lowercase `.dds` stored verbatim can never be found — and the symptom is
   a texture or icon silently turning into a different image.
6. **Activation is keyed on `MOD_ID`, not the filename.** `modlauncher.sch` in the save folder lists MODGUIDs;
   order is priority, and TL2 is **first-mount-wins** (not the more common last-wins).
7. **`.mpp` is the only thing that gets *baked*** — and the only thing not reproducible byte-for-byte offline.
   But measured the way players experience it (can I walk there?), the offline path is at **99.850%**
   with no player-trapping gaps left.
8. **The official `DATA.PAK` does not store text.** The entry `FOO.LAYOUT` holds **compiled** BINLAYOUT binary;
   the readable text in loose community MEDIA trees is **decompiled** by unpacking tools.
9. **GUTS silently strips 13 suffix classes at pack time** (`.XML`/`.MAX`/`.LOG`/thumbnails/project files…),
   so a dirty working tree produces different packages under the official editor and a third-party tool.
10. **The whole chain is now reproducible entirely offline**: no editor install, no D3D9 device —
    it even runs **in a browser** (the same Rust code compiled to WebAssembly).

---

## 1. The big picture: from a folder to a .MOD

A mod's source tree looks like this:

```
MyMod/
├─ MOD.DAT              ← the ID card: name, author, MOD_ID, version, dependencies, files to remove
└─ MEDIA/               ← the content tree, mirroring the game's own MEDIA/ structure
   ├─ UNITS/…*.DAT      ← unit / item / monster definitions (text)
   ├─ SKILLS/…*.DAT
   ├─ LAYOUTS/…*.LAYOUT ← level tiles, UI layouts, particle effects (text)
   ├─ MODELS/…*.MESH    ← models and skeletons (already binary)
   └─ …*.DDS/*.PNG/*.OGG/*.MATERIAL/…
```

Packing does four things, and the order matters:

```
① bake pathing   every .layout under MEDIA/LAYOUTS/**  →  a sibling .mpp (which cells are walkable)
② compile        5 text source types  →  BINDAT / BINLAYOUT
③ build indices  scan the whole tree  →  7 RAW aggregate indices
④ box it up      header + [zlib blocks for every file] + file-tree manifest  →  .MOD
```

The official GUTS editor takes exactly this route. Its exported `CreateMod` (`0x100DE830`) is only a guard shell;
the real orchestration lives in `sub_103FA610`:

```
CreateMod @0x100DE830  (guard shell)
└─ BuildMod_orchestrate @0x103FA610
   ├─ A. read MOD.DAT metadata → header slots
   │     NAME / MOD_ID / VERSION / MOD_FILE_NAME / DESCRIPTION / AUTHOR /
   │     WEBSITE / DOWNLOAD_URL / REQUIRED_MODS (validate + hash) / REMOVE_FILES
   │
   ├─ B. "Generating Path Nodes"  →  Pathing_RegenAll_worker @0x10018750
   │     scans <mod>/MEDIA/LAYOUTS/** only, bakes one .mpp per .layout
   │     ★ note it runs BEFORE compilation — §8.2 covers the classic puzzle this ordering causes
   │
   └─ C. "Compiling Mod" → CompileRawPack @0x103F5DA0
         ├─ PrePack @0x103F50D0
         │   ├─ compile dispatch @0x1029C9A0   5 source types → BINDAT / BINLAYOUT, then DeleteFileW the source
         │   ├─ RAW dispatch     @0x1029BFA0   7 aggregate indices, written only if the subtree is non-empty
         │   ├─ walk MEDIA "*.*" + PNG→DDS dedup + strip the "MEDIA/" prefix
         │   └─ pack-exclude blacklist @0x103F4340 (static table @0x11D44D40)  ← 13 suffixes
         ├─ build the dir tree @0x102A6430   (type code @0x102A1EA0 + final resolve @0x102A24F0)
         ├─ pack orchestration @0x1029BBB0
         └─ writer @0x102A7100   data section + zlib + rollingHash
         finally: splice 3 temp files into [header][pakdata][manifest], back-patch offsets,
                  move into <install>/mods/
```

That closure was extracted node-by-node via BFS from `CreateMod`, and every node was reconciled against an
offline implementation. A few details worth knowing up front:

- `sub_103F5DA0`'s **return polarity is inverted**: 0 = success, non-zero = error code (2 no path / 3 no files /
  4 open failed / 5 temp reopen failed / 6 required-mod load failed / 7 version or recursive dependency /
  8 can't read the `Torchlight2.exe` version). `CreateMod` then flips 0 into 1 for its caller.
- A `devbuild.txt` in the working directory flips manifest+88 and **stops stamping per-file mtime**.
  ftime is never validated, so it's harmless — but it's a hidden build mode that changes output bytes.
- GUTS compiles **incrementally** (`sub_1028FC00` skips when a fresh `.BIN*` already exists). That brings cache
  coherency risk; offline tooling instead compiles everything from text every run — the compilers are
  byte-verified, so the output is identical and it costs nothing.

---

## 2. Boxing it up: the `.MOD` container

### 2.1 Three parts

```
out = header (variable length)   # off_data = len(header)
    + PAK data section           # [off_data, off_man)
    + manifest file tree         # starts at off_man
```

By analogy with zip: the data section is the compressed data area, the manifest is the central directory, and the
header is the thing zip doesn't have — an ID card saying who this mod is, what version, and what it depends on.

`off_data` / `off_man` are written as 0 placeholders and back-patched with an fseek once the three parts are spliced.

### 2.2 Header: the mod's ID card

Writer `sub_103F5DA0`, reader `sub_103FA610`:

```
<HHQII>  ver(=4), modver, gamever, off_data, off_man
SS title; SS author; SS descr; SS website; SS download    # SS = u16 code-unit count + UTF-16LE
<QIQ>    modid, flags, reqHash
<H> reqs_count;  each: SS(name) <QH> mod_id, version
<H> dels_count;  each: SS(path)
```

`MOD.DAT` fields map into slots like this: `NAME`→title, `AUTHOR`, `DESCRIPTION`, `WEBSITE`, `DOWNLOAD_URL`,
`MOD_ID`→modid, `VERSION`→modver, `REQUIRED_MODS`→reqs, `REMOVE_FILES`→dels.

Three counter-intuitive points:

- **`MOD_FILE_NAME` is not a header field** — it's the **output filename**.
- **modver = VERSION + 1.** The publish path runs `++*(this+256)`, so writing 3 in MOD.DAT stores 4 in the package.
- **gamever does not come from MOD.DAT.** It is read at pack time from **`Torchlight2.exe`'s VS_FIXEDFILEINFO**
  (`sub_103F8CD0`, word order (minorMS, majorMS, privLS, buildLS)). 1.25.9.5 = `0x0005000900190001`,
  a constant for a given install. GUTS **overwrites** whatever you wrote with the value it reads.

And one for anyone writing a launcher: **`modid` is a signed i64 and can be negative.** Treating it as unsigned
computes the wrong GUID for some mods.

### 2.3 reqHash: a fingerprint of the dependency graph

If a mod declares `REQUIRED_MODS` in `MOD.DAT` (depending on other mods by GUID plus a minimum version),
the header carries an extra 8-byte fingerprint. The write site is in `sub_103F5DA0`:
`v48 = sub_103F5500(this, 0)` → stored at `this+248` → fwritten between `flags` and the REQUIRED_MODS count.

The algorithm in `sub_103F5500` is a fold chain:

```
acc = 34832                       # low-half seed; the empty set returns 0 early
for (guid, ver) in REQUIRED_MODS: # entry stride 40: guid u64 / ver u16 / name wstring @+12
    t1  = H(guid_le_u64,  seed=0x22D0)
    t2  = H(ver_le_u16,   seed=lo32(t1))
    acc = H(t2_le_u64,    seed=lo32(acc))
return acc
```

`H` = `sub_10285330` = **MurmurHash64B** (m = `0x5BD1E995`, r = 24). Three details are nailed down instruction
by instruction, and copying a stock MurmurHash64B off the internet will not match:

1. The seed is **32-bit**, so `h2` starts at 0 rather than the usual `seed >> 32`.
2. The chain passes only the **low 32 bits** of the previous result as the next seed, while the hash itself
   returns the **full 64 bits** from EDX:EAX.
3. The `name` field does **not** participate.

End-to-end: a mod with two REQUIRED_MODS entries produces the header value `0x42E3B27898608F92`.

**One boundary worth stating**: when GUTS resolves a dependency that is actually installed, it hashes the
**installed** version and recursively folds in that dependency's own reqHash. Offline tooling can't see what's
installed, so it can only use the version **declared** in MOD.DAT, without recursion. Flat dependencies
(declared == installed, and the dependency itself declares no REQUIRED_MODS) agree; deeper graphs don't.

Incidentally, `REQUIRED_MODS` sees less use than you'd expect — most mod series use **manual load order**
instead (their description says "put this above XX"), relying on the override rules in §2.7.

### 2.4 Manifest: the file tree, and that uppercase trap

Writer `sub_102A5860`:

```
<HI>  version(=2), mhash
SS    root("MEDIA/")
<II>  file_count, dir_count
per dir: SS(dirname) <I> rec_count
         per rec: <IB> crc32, type   SS(name)   <IIQ> off, size, filetime
```

- The tree: files go into a `std::map<wstring,…>` keyed by parent dir → directories are emitted in
  **UTF-16 path order**; each directory reserves a **type-7 placeholder** for each of its child directories.
  The root is `MEDIA/`.
- A record's `off` is **relative to the start of the data section**; `off_data + off` is the absolute file position.
- `filetime` is the source mtime as a Windows FILETIME. The game never validates it; pure metadata.

**⚠️ Filenames must be UPPERCASE — this causes the hardest-to-diagnose class of failure.**

GUTS uppercases names at collection time (`sub_103F50D0`). The game's PAK lookup uppercases the request path
and then compares it against the stored name **as-is** (assuming stored names are already upper). So a lowercase
`QLJX_F.dds` stored verbatim can never be matched by the query `QLJX_F.DDS`.

The symptom is thoroughly misleading: **the class itself works, its name works, its skills work — only the
portrait is some other image.** Classes and names go through case-insensitive lookups; only the texture step is
case-sensitive. The chain is `CLASS_XXX_F.DAT`'s `<STRING>ICON:` → an `.IMAGESET` →
`Imagefile="…/QLJX_F.dds"`, where the `.IMAGESET` happened to be uppercase on disk (matched) while the `.dds`
it references was lowercase (didn't).

`str.upper()` matches GUTS: ASCII uppercased, CJK and other non-ASCII unchanged.

**Another trap, this one only for tool authors**: the manifest records each file's mtime. So byte-comparing two
outputs requires packing **the same tree**; `cp -r` into two copies and packing each will always produce a byte
difference from mtime alone — that isn't a regression, it's a broken measurement.

### 2.5 The data section and rollingHash: the single most important number here

Writer `sub_102A7100`:

```
<II>  maxCompressedBlockSize, rollingHash          # 8-byte head
per file (manifest order): <II> uncompressed size, compressed size (0 = stored) + bytes
```

`maxCompressedBlockSize` is the largest compressed block, feeding the game's decompression read-buffer sizing.

Store or compress is decided by a table, `byte_11E94CD8[type]`: types 0..23 are all 1, and **only type 24
(`.JPG`) is 0**. Additionally any block ≥ `0x1900000` (26 MB) is stored — that constant appears 5 times inside
`sub_102A7100`. So the rule is one sentence: **everything is zlib except `.JPG` and oversized blocks**.

**Now `rollingHash`. This is the only hash the game validates, and it is the real culprit behind
"ticked but no effect."**

If it's wrong, the loader **silently** abandons the whole mod: no dialog, no player-visible error, the mod's
entire file table is dropped — so nothing appears in game, while the launcher still shows it happily ticked.

The writer (end of `sub_102A7100`) and the validator (`sub_102A2690`) are symmetric and deterministic:

```
N       = length of the data section
divisor = 25 + (695696193 * N  mod 2^32) mod 51
stride  = max(2, N // divisor)
h = N
for off in range(8, N, stride):     # offsets 0..7 (the head) don't participate
    h = (int8)data[off] + 33*h      # mod 2^32
h = (int8)data[N-1] + 33*h          # then fold in the last byte
rollingHash = h
```

There's a nice detail here. At first glance in the disassembly, `divisor` comes out of a random number
generator — so how can the hash be reproducible at all? It can. That LCG (`sub_10285B30`) is reseeded
**with N** by `sub_10285A50` immediately before the call (`sub_10285450` saves the old state and restores it
afterwards), so the "random" divisor is a **deterministic function of the data-section length**.
Verified byte-for-byte against 30 shipped / editor-produced `.MOD` files.

One more property worth remembering: it **samples only about 50 bytes** (stride is roughly N/25 to N/75).
That property later saved the browser build — see §10.2.

### 2.6 Three hash/count fields, and which one is real

The container has three fields that look like checksums, but only one is ever checked:

| Field | Location | Validated? | Notes |
|---|---|---|---|
| **PAK rollingHash** | 2nd u32 of the data-section head | **Yes** | wrong → the whole mod is silently discarded |
| manifest mhash | manifest head | No (read, never compared) | native derives it randomly (`sub_1028E6F0`); 0 works fine |
| manifest FileCount | manifest head | No (capacity hint) | native's own value (e.g. 862) ≠ its real record count (~618), and it loads fine |

The game iterates using DirCount plus each directory's own count; `fc` never bounds anything.
In other words, **mhash and FileCount can be wrong with zero consequence, while a wrong rollingHash loses
everything** — an asymmetry that catches everyone.

### 2.7 How the game loads and activates

The load chain: `sub_103FB240` (reports `"Unable to load mod.\nFailed because :"`) → `sub_103F8BC0` →
**`sub_103F83C0`** (the real validation), which does:

1. return early if already loaded;
2. **silent failure if the file table or offMan is empty** (note: no error);
3. resolve `REQUIRED_MODS` dependencies, logging anything missing or version-mismatched;
4. compare reqHash;
5. `sub_102A3320` reads the manifest version (rejects > 2), reads mhash (never compares it), then
   **`sub_102A2690` recomputes and compares rollingHash** — mismatch means `fclose; return 0`, silently again.

**Activation is keyed on `MOD_ID`, unrelated to filenames or hashes.** `modlauncher.sch` in the save folder
(UTF-16LE + BOM + CRLF) holds one `<INTEGER64>MODGUID:<modid>` per line, and the game loads the `.MOD` whose
header modid matches.

**Order is priority, and TL2 is first-mount-wins.** This is the opposite of most games and deserves emphasis:

- the engine mounts mod PAKs in scheme order first (`sub_7DEA10`), and only **afterwards** mounts the vanilla
  base PAKs;
- the path VFS (`sub_68F630`) appends file entries in mount order and, on lookup, **scans from the front and
  returns the first hit**.

⇒ Mods override vanilla; among mods, earlier in `.sch` overrides later.
**From the user's side: higher in the launcher list = higher priority.** Override granularity is
**whole-file replacement** — no field-level merging.

---

## 3. Which files packing silently throws away

While collecting files, GUTS strips 13 suffix classes (`sub_103F4340`, static table built at `sub_11D44D40`
@ `unk_13E51C50`):

| Class | Suffixes |
|---|---|
| Tooling and intermediates | `.CMP` `.THUMBNAIL.PNG` `.XLS` `.XML` `.MAX` `.MPD` `.LNK` `.LOG` |
| Compile sources | `.DAT` `.LAYOUT` `.ANIMATION` `.HIE` |
| Compiled-output alias | `.LAYOUT.BINDAT` |

The first class is intuitive: the artist's `.MAX` project, the designer's `.XLS` sheet, logs, shortcuts,
thumbnails — clutter that shouldn't ship. **If your tool doesn't strip them, your package comes out bigger than
the official one and carries a pile of source assets with it.**

The second class isn't thrown away — it's **renamed**. GUTS compiles, strips the text source, carries
`<sourcename>.BINDAT` around, and renames back to the source name when writing the manifest. So the final
manifest lists `FOO.DAT` — the **source name** — holding **compiled BINDAT bytes**.

**How do you confirm that?** Rather than reading decompilation alone, use **a real GUTS artifact as ground truth**.
`EDITORMOD.MOD` is the editor's default output name, so any mod folder ever opened in GUTS has one.
Count the UTF-16LE names in its manifest region:

```
.DAT       936 entries
.LAYOUT    160 entries
.ANIMATION   6 entries
.BINDAT      0 entries     ← compiled output never appears on its own
.BINLAYOUT   0 entries
.XLS / .XML / .MAX / .LOG / .THUMBNAIL / .CMP / .MPD / .LNK   all 0    ← the blacklist really does strip them
```

Settled — and more robust than reading decompiled code.

---

## 4. Which files get compiled

For each file, packing answers two questions: what type is it (the type code, written into the manifest), and
does it need compiling. Both answers come from the same table — `sub_102A1EA0` (raw code) plus `sub_102A24F0`
(final resolve + compiled-suffix append), 20 types in total:

| type | Extension | | type | Extension |
|---|---|---|---|---|
| **0** | `.DAT` `.TEMPLATE` → **BINDAT** | | 11 | `.IMAGESET` |
| **1** | `.LAYOUT` → **BINLAYOUT** | | 12 | `.TTF` `.TTC` |
| 2 | `.MESH` | | 13 | `.FONT` |
| 3 | `.SKELETON` | | **16** | `.ANIMATION` → **BINDAT** |
| 4 | `.DDS` | | **17** | `.HIE` → **BINDAT** |
| 5 | `.PNG` | | 18 | unknown / no extension |
| 6 | `.WAV` `.OGG` | | 19 | `.SCHEME` |
| 7 | directory (placeholder) | | 20 | `.LOOKNFEEL` |
| 8 | `.MATERIAL` | | 21 | `.MPP` |
| 9 | `.RAW` | | 23 | `.BIK` |
| 10 | `.UILAYOUT` | | 24 | `.JPG` (the only stored type) |

⇒ **Only 5 extensions ever get compiled.** Compilation happens in `sub_1029C9A0` (GUTS calls it
"convert text files to binary"), which `DeleteFileW`s the source text afterwards.

The rule looks simple and hurts when you get it wrong. Two real incidents:

**Incident one: `.TEMPLATE`/`.ANIMATION`/`.HIE` never compiled.** An early offline implementation only compiled
`.DAT`, but the type table already marked those three as BINDAT(0). The result: **raw text packed under a
BINDAT-typed manifest entry**, and the game reading text as a binary node tree. What found it was a full
native-DLL-vs-offline comparison harness: those three extensions showed up as "only-native" in every mod,
with exactly matching counts.

**Incident two: the entire UI vanished.** LAYOUT→BINLAYOUT compilation was once gated on "is there already a
sibling `.BINLAYOUT`." On a source-only repository (`.gitignore` excludes `*.BINLAYOUT`), it compiled **zero**
layouts, so the package shipped no UI layouts at all — and since the base game's UI directory is 61 `.LAYOUT`
paired with 61 `.LAYOUT.BINLAYOUT`, and the game reads the latter, **the in-game UI was simply gone**.

Both bugs share one lesson: **type classification and compile coverage must come from the same table.**
You can't look one up and guess the other.

One last special case: `.IMAGESET` looks like it should compile, but doesn't need to. The base game ships 55
`.IMAGESET` and **zero** `.BINIMAGESET`; the game reads the text directly, so packing it as-is is correct.

---

## 5. BINDAT: where all the game's numbers live

Items, monsters, skills, affixes, recipes, loot tables — nearly everything the game calls "data" lives in `.DAT`,
and compiles to BINDAT. It's a recursive node tree, each node carrying a set of properties.

### 5.1 Format

```
Header 12B: <III> version(=2), string_count, first_id
String table (ascending by id):
   entry0 = <H>len + wchar[]        # no id prefix (its id is first_id in the header)
   entryN = <I>id <H>len + wchar[]
Body = one recursive node:
   <II> name_hash(rg_hash), prop_count
   per prop: <II> key_hash(rg_hash), type + value (8B if type ∈ {3,7}, else 4B)
   <I> child_count + children…      # source text order
```

Type numbers: `INTEGER`→1, `FLOAT`→2, `UNSIGNED INT`→4, `STRING`→5, `BOOL`→6, `INTEGER64`→7, `TRANSLATE`→8.

### 5.2 Key names aren't stored — hashes are

This is BINDAT's most important design decision. Node names and property names (`[UNIT]`, `NAME`, `LEVEL`…)
**never enter the string table**. Instead they're run through **rg_hash** — GUTS's 32-bit string hash
(`sub_100CA9A0`; the game side is the same algorithm at `sub_4C9FE0`) — and written as a u32.

The upside: any key serializes, with no "dictionary completeness" risk. A mod inventing a brand-new property
name compiles just fine. Corpus proof: 901025 / 901028 keys equal `rg_hash(name)` (the 3 exceptions all live in
one file that was corrupt to begin with).

The cost: it's **irreversible** — see §5.5.

One encoding detail in passing: strings use **surrogatepass**, i.e. the editor reads and writes the wchar stream
verbatim without validating UTF-16 surrogate pairs. The official `TAGS.DAT` contains a float colour blob spliced
into a `<STRING>:` value (reinterpreted as lone surrogates), and only surrogatepass round-trips it byte-for-byte.

### 5.3 String-value ids: resolved per file

STRING / TRANSLATE **values** are not inlined; they store an id into the string table.

In official output those ids look like they came from a **global session counter** — one `counter++` across the
whole game build. But the game **parses per file**: each BINDAT carries its own table, and body ids resolve
against **that file's** table.

The proof: the official base game contains **565 cross-file id collisions** (the same id pointing at different
strings in different files), and the game loads and runs fine. With a globally merged table it would have
collapsed long ago.

⇒ **The actual id values don't matter, as long as they're unique within the file.** So offline packing uses
**per-file hash ids** (`rg_hash(s)` plus intra-file linear probing): no shared state, embarrassingly parallel,
deterministic. Verified in game.

If what you want is a **byte-for-byte reproduction of official output** (for compatibility testing, say), there's
a second mode: the **corpus global-id scheme**, which is the exact semantics of `sub_10289A40` / `sub_1023E9F0`
(known strings looked up in a rebuilt dictionary, unknown ones assigned `max_id+1` in first-appearance order).
Against the shipped corpus that's **15976 / 16084 byte-exact**, and it's marginally faster (no per-file
sort-and-probe). It isn't the default, because that dictionary carries 715 collisions needing a majority vote,
whereas hash mode's "unique within the file" is strictly safer.

### 5.4 Accuracy: those 31 "differences" are the official data's own quirks

Over the full 16084-file corpus: **15976 byte-exact (99.329%)**; another 77 byte-different but semantically
identical (string-id / table-order noise) = **99.807% semantically correct**; genuine structural differences
number 31 (0.19%), with 0 compile errors.

Those 31 are worth unpacking, because they're an instructive case. Thirty of them are **shipped BINDAT
disagreeing with its own text**: a correct encoder is literally `struct.pack('<f', float(text))`, so its bits
**are** the canonical float32 of the text by construction. The cleanest proof is an entry called `QUAKE1` —
the text literally says `"1"`, the correct encoding is `1.0` / `0x3F800000`, and shipped has
`1.0000001` / `0x3F800001`. No correct parser emits that value from `"1"`; it's a lossy artifact of the
editor's GUI export. The rest are GRAPHS/STATS and POTIONS curve Y values — the same story.

The 31st is `TAGS.DAT`: GUTS names the empty-`[]` root after the **filename**
(shipped root `name_hash = rg_hash("TAGS")`), and its source is corrupt anyway — it's the lone-surrogate file
from §5.2.

### 5.5 Going backwards: a BINDAT decompiler

If keys are stored as a one-way hash, can BINDAT be turned back into readable text? Values can (they're in the
string table or inlined); names have to be **looked up in reverse**.

The approach is an embedded wordlist: all 1678 distinct key/section names across the base game's 16084 DATs
(23 KB, and **zero rghash collisions**), reverse-looked-up by hash. Anything not found emits `UNK_<hex>`.
The output is recursive `[name]…[/name]` text with type tags, bool→true/false, GUID int64→decimal,
UTF-16LE + BOM.

**`UNK_<HEX8>` is a formal escape, not a placeholder.** The compile side special-cases it: recognise the shape
and **write the original hash back verbatim**, so decompile→recompile is byte-identical. Matching is strict
(exact length + uppercase hex); anything else is treated as an ordinary name.

> ⚠️ **Never hand-edit the digits inside `UNK_`.** You'd be editing the hash itself, which then points at a
> different property — and nothing will warn you.

The real shape of the wordlist gap is worth stating, because it isn't what you'd guess: **what's missing isn't
identifiers, it's numeric families capped at vanilla usage.** `LEVEL1..16` / `CHILD1..5` / `ENCHANTCOST1..4` /
`VALUE1..5` / `TIER1..3_DESCRIPTION` — while large mods have long since used `LEVEL100`, `CHILD7`,
`ENCHANTCOST5`, `TIER4`. Scanning 80505 mod DATs: only 20 genuinely new keys, and of 104 new sections nearly all
are `LEVEL17..100`. Pouring another 3006 exe string literals into the wordlist (0 collisions) is just insurance;
it can't cure names a mod invents on the spot — which is why the tooling lists the files and warns about
placeholder names at pack time.

---

## 6. BINLAYOUT: scenes, UI and effects

`.LAYOUT` describes where things sit: every rock in a level tile, every widget in the UI, every emitter in a
particle effect. It compiles to BINLAYOUT — a schema-driven, per-descriptor encoding:

```
Header: <B>0x0B <B>flag(=4) <I>dg_off <H>obj_count(top level)
Object (recursive):
   <I> block_size  <B> descriptor  <q> id
   str NAME (only when != the descriptor's default name)
   <B> prop_count   per prop: <H>mem <B>code + value
   <I> adprop_region   <H> child_count   + children…
```

### 6.1 Where the schema comes from — a lesson in not learning from data

BINLAYOUT encoding depends entirely on a schema: **which descriptor has which properties, and each property's
mem number and type**.

The natural idea is to learn it from data: scan every official `.LAYOUT` and `.BINLAYOUT` and infer the mapping.
**That approach is wrong, and it fails quietly.**

- It can only cover properties the official data **happens to exercise**. Anything unseen gets **silently dropped** —
  and a dropped property means a wrong `block_size`, which means a CEGUI crash in game.
- It also learns pollution: the Music descriptor came out with 48 properties; the real count is 4.

The correct approach is to dump the DLL's **runtime descriptor registry** wholesale: headless `InitEditor` →
descriptor-manager global `unk_12670228` → `*(mgr+0x1C)` BST root → in-order walk, taking each descriptor's code
(`+0x58`), property list (`+0xE4`[0..`+0xE8`]), and each property's code / flag / name / group / type.
The result is **159 descriptors / 2258 serializable properties**, with zero corpus input.

The difference is an order of magnitude: the mod corpus went from **18/13224** to **13214/13224**.

### 6.2 Serialization rules

- **The filter** (writer `sub_10115320`, per object): a property is emitted iff
  `(prop->flag@0x50 & 0x10040200) == 0` (bit9 = editor-only, bit18 = routed to datagroup, bit28).
- **Transform defaults are skipped**: drop FORWARD(40) when Z==1.0, RIGHT(41) when X==1.0, UP(95) when Y==1.0
  (POSITION 42 never). GUTS drops identity orientation at compile time — hand-authored layouts especially need this.
- **Group properties take a different route**: CHOICE / RANDOMIZATION / NUMBER / TAG / ACTIVE+DEACTIVE THEMES /
  LEVEL UNIQUE / GAME MODE **do not go into object properties**; they're written into the datagroup node at the
  end of the file.
- Logic Group link graphs and Timeline events live in the ADPROP region, and a link's input/output names are
  **inline strings**, not resolved ids.

Accuracy: base MEDIA **8965 / 8985 byte-exact**. The 20 mismatches are irreproducible uninitialized garbage in
the shipped files — a property mis-authored as `<STRING>` makes the writer read a stale `prop_value[+8]`,
nondeterministically. Semantically it's 8985/8985. The mod corpus is **13214 / 13224**.

A function-by-function audit against the DLL also fixed a few fine points, listed here for anyone writing an
encoder: `CHOICE @16` is a **case-sensitive exact match** against `["ALL","Weight","Random Chance"]`;
`GAME MODE @27` is an exact comparison `2-(v=="NORMAL")` for non-empty values (other non-empty values are 2, not 0);
`@25` is the Group's own `NO TAG FOUND` bool (default 0), not a hardcoded 0.

---

## 7. The 7 RAW indices: the engine's index cards

At startup the game doesn't walk the whole MEDIA tree looking for "what skills exist." It reads 7 pre-generated
aggregate indices. Dispatcher `sub_1029BFA0`, each scanning its own subtree and written only if non-empty:

| RAW | Writer | Source | Structure |
|---|---|---|---|
| AFFIXES | `sub_103C4170` | `*.DAT` | `<H>count`; per: SS(FILE) SS(NAME↑) 4×i32 (MIN_SPAWN/MAX_SPAWN/WEIGHT/DIFF) + UNITTYPES / NOT_UNITTYPES string lists |
| SKILLS | `sub_102ECFD0` | `*.DAT` | `<I>count` (non-empty NAME only); SS(NAME↑) SS(FILE) `<q>`UNIQUE_GUID |
| MISSILES | `sub_102FB490` | `*.LAYOUT` | `<H>count`; SS(FILE) + the MISSILE NAME↑ of each `DESCRIPTOR:Missile` object |
| TRIGGERABLES | — | `*.DAT` | `<H>count`; SS(FILE) SS(NAME) |
| UI | `sub_103178E0` | `*.LAYOUT` | `<I>count` (Menu Definition with non-empty MENU NAME, not DO NOT CREATE); TYPE/GAME STATE enums + KEY BINDING |
| UNITDATA | `sub_1026CC50` | `*.DAT` | 4 classes (ITEMS/MONSTERS/PLAYERS/PROPS); **fields walk the full BASEFILE inheritance chain** |
| ROOMPIECES | — | `*.DAT` | `<I>count`; per: SS(FILE) + a GUID list |

**There are two scan orders**, and they must be kept straight or the bytes won't match:
AFFIXES / SKILLS / UNITDATA / MISSILES use **name-interleaved DFS** (files and subdirectories interleaved by
name, recursing in place); TRIGGERABLES / UI / ROOMPIECES are files-before-dirs. All 7 reproduce the official
output byte-for-byte.

**One conclusion that matters a lot in practice: only UNITDATA depends on base-game data.**

`EncodeUnits` (`sub_1026CC50`) walks the `BASEFILE` inheritance chain and **reads base-game file content** to
pull UNITTYPE / LEVEL / RARITY / CREATEAS. On the reading side, `sub_660560` (via `sub_661480`
CUnitResourceList) stores all of it and **indexes by UNITTYPE** — the game genuinely uses it, and missing values
affect spawning and loot.

That's why a pure browser packer must carry the base game's UNITS templates: an item inheriting from
`UNITS/ITEMS/BASE.DAT` would otherwise lose the `CREATEAS=EQUIPMENT` flag bit. Conversely, the other 6 RAWs never
touch base data, so **a pure class/skill mod packs byte-identically with no base data at all**.

One old trap in passing: the same GUID is written `<INTEGER64>GUID:` in `.DAT` and `<STRING>GUID:` in `.LAYOUT` —
same value, different type. Handle both.

---

## 8. MPP: can the player walk there

### 8.1 A grid of cells

Every level `.layout` has a sibling `.mpp` (1293 of them in the base game), writer `sub_10200920`:

```
24B header: <iiffff> gridW, gridH, worldExtX, worldExtZ, boundsX, boundsZ
then gridW*gridH bytes, row-major (X varies fastest)
```

**One cell = 0.4 world units; there are only three values: `0x00` walkable / `0x01` wall /
`0xFF` out-of-bounds or no ground.** File size = 24 + gridW·gridH. That's the whole format.

The region box comes from each region's **collision** AABB — not the render mesh's bound, which is deliberately
inflated and will compute the wrong box. Each region snaps to 10 with a 0.2 pad, and grid dimensions derive from
the stored float32 origin.

**The classifier** (inside `sub_10200920`) does three things per cell:

1. cast a vertical ray from `y+200` down to `−200`, take the nearest hit;
2. if `|hit.y| > 80` or hit-type == 100 → **wall**;
3. otherwise probe 0.30000001 in each of ±X / ±Z at head height (+1.5); if any hits a NOPATH → **wall**,
   else **walkable**.

Then an enclosure second pass turns cells pinched shut by corners into walls.

Two counter-intuitive points:

- **There is no slope test.** Intuitively "too steep to climb" ought to be a rule, but a DLL-patch experiment
  proved the `|y|>80` gate in step 2 is **dead** on normal templates; walls are 100% NOPATH-driven.
- **NOPATH has exactly two sources**: the piece's NOPATH property (`[+0x192]`), or a collision submesh whose
  **material name contains `nocollide`**. The latter is a substring match, and in the actual assets it's
  **lowercase** — `multi_collision/nocollide`.

### 8.2 Why GUTS sometimes needs two builds

This is the longest-lived piece of workflow folklore among mod authors, and its symptom is alarming:
**players can't move after entering the dungeon.**

To reproduce: open a mod project in GUTS, delete all the intermediates (`.BIN*`, `.MPP`) before hitting build —
plenty of people keep their workspace tidy that way — then build. Every newly generated `.mpp` comes out at
**exactly 2.5 KB**. Play it, and that map is unwalkable. The fix: build again.

The black-box model people inferred looks like this:

```
Function 1:  IF BINLAYOUT EXISTS → generate MPP from BINLAYOUT;  ELSE → generate the default (2.5 KB)
Function 2:  IF BINLAYOUT EXISTS → check CRC32, recompile if it fails;  ELSE → compile BINLAYOUT from LAYOUT
```

Opening a project runs only Function 2; hitting build runs Function 1 then Function 2. Which is why
"open GUTS, then edit text" and "edit text, then open GUTS" give different results.

**The mechanism can now be stated exactly:**

- "Function 1 before Function 2" isn't a strange design — it's simply the **order inside `sub_103FA610`**:
  the MPP step (`Pathing_RegenAll_worker` @ `0x10018750`) runs **before** the LAYOUT→BINLAYOUT compile
  (`sub_1029C9A0`).
- Why does baking MPP need BINLAYOUT? Because the pathing step drives the **runtime level loader**
  (`CLevel_LoadLevelData` @ `0x1020AB90`), not a text parser. The loader only eats `.BINLAYOUT`.
- So no BINLAYOUT → level load fails → it degrades to a **default 50×50 box** → an all-`0xFF` stub is written.
- Stub size = 24 + 50×50 = **2524 bytes**, which is that "exactly 2.5 KB." All `0xFF` = nothing walkable =
  the player can't move.

The same chicken-and-egg has to be worked around when driving the DLL **headlessly**: the tool must run twice
(pass 1 writes BINLAYOUT plus a stub, pass 2 produces the real `.mpp`). And success **can only be measured by
`.mpp` count, never by exit code** — the host routinely exits `0xC0000374` (heap-corruption teardown) *after*
writing every file.

> **A purely offline pipeline doesn't have this problem**: it compiles BINLAYOUT from text every run and bakes
> MPP offline, so stale intermediates can't exist and there's nothing to build twice.

### 8.3 Reproducing the grid offline: hunting down the 0.29%

Moving the bake offline, the hard part isn't the classifier — those three steps transcribe directly. The hard
part is **whether the triangle soup fed to the classifier matches**: which room pieces' collision geometry gets
baked in, and which don't.

The first offline implementation reached **99.71%** per-cell agreement. The remaining 0.29% was, for a while,
judged irreducible — the reasoning being that it clustered heavily on `nocollide` cave decoration (stalagmites,
mushrooms, rubble, overhangs) and appeared to be decided **per instance**: the same mesh, with the editor baking
some placements and dropping others, with no clean static discriminator anywhere in the layout or DAT.
In other words: runtime state, not derivable from static files.

**That judgement was wrong.** Hooking a real bake with frida and capturing the per-piece gate inputs broke it
into six independent gaps, every one of them derivable from text:

| # | Gap | Truth | Gain |
|---|---|---|---|
| 1 | **DEACTIVE THEMES** | The offline "is this geometry backdrop decoration?" test only looked at `CHOICE` and `ACTIVE THEMES`, while the DLL's `sub_1022FF80` also gates on **DEACTIVE THEMES** (it has 5 theme string fields). The batch blamed on "runtime nocollide" turned out to sit entirely under `DEACTIVE THEMES=…` groups. | over-wall −6307 |
| 2 | **Don't guess links by name** | The old code decided whether to bake a link by checking its name for SPAWNER / RANDOM / CHEST — experience design, not reverse engineering. The DLL **never name-matches**: it follows every link and runs each sub-piece through the same gate. "Follow all + the real gate" let the whole name list be deleted. | −5869, 49 tiles better / 0 regressions |
| 3 | **Room Piece parents don't pass transforms** | When a Room Piece is parented under another Room Piece (a trace left by the GUTS clone operation), the transform is **not inherited**. There's code-level proof on the exe side: the function that recursively composes world transforms via `PARENTID` has exactly one consumer in the whole binary — QuestController — and baking never goes through it. Without the fix, a 5-level clone chain multiplies scale to 162× and blows the region AABB out to 130k units, failing compilation outright. | 3 tiles went from "failed → STUB" to correct; 18/18 grid headers match the original author's output |
| 4 | **NEVERBAKE actually means force-bake** | A thoroughly misleading name. `sub_10263280` proves NEVERBAKE lives at `descriptor+0x40`, and `SetMesh` does `if descriptor[+0x40] → piece[401]=1`, with the final gate being `ALWAYSBAKE ‖ piece[0x191]` ⇒ **native force-bakes a NEVERBAKE piece even when the instance explicitly says `BAKE:false`**. | diff −5077, danger cells 6284→1688 |
| 5 | **Controller DATA fields** | A `Layout Link Controller`'s `DATA` field (`1,8,` plus 8 per-object transforms) **overrides** the transform sub-layout objects author for themselves — native places by DATA, not by POSITION. A desert map's "missing floor" hole came from exactly this: a mana_pit was placed outside the tile at Z=−146, while the DATA entry (118,0,170) pulls it right back into the danger zone. | diff −2618, danger cells 1688→**553** |
| 6 | **Path Bounds Extender** | A type-19 Property Node merges into the grid's **origin** (but not into the writer box). It needs a gate: adopt it only when it actually changes the grid dimensions, otherwise keep the collision origin. | dims match +4, 0 regressions |

Plus a clearance side gate: `sub_100672B0` has a side test before the in-triangle hit, which the offline code
missed by reusing a different function. Adding it was worth over −2021.

**Not one of these is "runtime state."** All of them are derivable from text plus the descriptor table.

**A methodological note**, written down because it recurs: when a heuristic is **name-based**, first check
whether the DLL's actual per-object gate already expresses the same thing. It usually does — and
"follow everything + the real gate" wins on both robustness and accuracy, with no name whitelist to maintain.

### 8.4 Is the rest just random? A triple-bake experiment

After closing those six gaps, a thin residual remained. It looked random — provenance tracing showed 68% of the
top contributors were tree-canopy `nocollide` geometry. It's tempting to reason onward: canopies sway in the
wind → sway is runtime → therefore this is a nondeterministic floating-point floor, unfixable.

**That reasoning skips a step, and the step is directly testable.** The experiment is plain:
**have the DLL bake three times independently; our implementation is deterministic, so two runs must agree,
which makes it a perfect control. Then compare what varies on each side.**

Result over 1116 tiles:

- the DLL disagrees **with itself** in only **3826 cells**;
- among disagreements, the cells we call wall and the DLL calls walkable total 33841 — and
  **the DLL walks all three times in 33329 = 98.5%**, i.e. this is a **stable, reproducible real difference**;
  genuinely nondeterministic cells number just 512 (1.5%);
- the other direction (we walk / DLL walls) totals 64953, of which 98.6% is deterministic.

⇒ **The residual is not a coin flip.** The wind-sway explanation is ruled out.

Following up with a mesh verdict — tag every triangle with its mesh, then check how native classifies the cells
where *we* called wall because of that mesh — the answer is that **no mesh is systematically walked by native**
(per-mesh walk rates run 0–4.6%, 0.5% overall). So "skip this class of mesh" fixes are out too: the residual is
a **positional difference spread evenly at about 1% across every mesh**.

### 8.5 The real floor: a ray that isn't vertical

Digging to the bottom, it's the product of three things:

1. **Native's downward ray isn't vertical.** Live-captured ground truth (1324 cells) shows a constant
   `(−5e-6, −1, +8.6e-5)`.
2. **Native's point-in-triangle test is normal-dependent** (using the mesh's stored normal, not a vertex cross
   product): `v8 = E1·(N×E2)`, `v16 = E3·(N×E2)`, `v15 = N·(E3×E1)`,
   accept ⟺ `v16≥0 && v8≥v16 && v15≥0 && v8≥v15+v16`.
3. On a **sloped** collision triangle, `dz/dy = 8.6e-5` times a 196-unit descent gives a **0.0167** drift in
   `hp.z` — enough to flip a razor-thin margin. Measured: native rejects at −0.00159, our vertical ray accepts
   at +0.0275. Flat triangles (vertical normal) drift not at all and both sides agree — which explains why the
   disagreement only ever appears on slopes.

So why not just port the tilted ray and that formula? **We did.** Reject/accept classification reproduces
exactly in isolation (49416 / 49417). But the whole-tile A/B went from 1805 to 1817 — **no net improvement**:
79 cells flipped walkable→wall, 70 flipped wall→walkable, a wash.

The reason is that native's per-cell tilt carries about ±0.001 of noise, while the margin itself is around
±0.0017. **The noise is at or above the signal**, so pinning one fixed tilt value just flips a different half of
the cells.

⇒ Conclusion: byte-exactness has exactly two roads — **bit-exact replication of native's floating-point
arithmetic** (which means calibrating operation-by-operation against the Ogre 1.7.4 source, a large project),
or **driving the real DLL to bake**.

Four more "surely this is it" directions were tested and rejected in the same round, recorded so nobody re-digs them:

- **QUEST / DIFFICULTY string gates**: scanning all 35376 Groups in the corpus finds **zero** authored ones,
  so adding the check is a no-op. Relatedly, the hypothesis that "GAME MODE excludes NG+ content" was measurably
  disproven — the shipped box is **larger** than native's, meaning the engine *includes* NG+ geometry, so
  excluding it goes the wrong way.
- **Fully recursive prop→prop links**: A/B'd long ago as net negative (+191 over for −41 under); the one-level
  limit is deliberate.
- **float32 constants**: converting only the constants is a half-measure (float64 arithmetic fed float32
  constants) and regressed the full corpus by +318. A true match needs float32 arithmetic throughout, which
  lands right back on the underivable problem above.
- **Making `NOCOLLIDE` case-sensitive**: the engine rule really is "material name contains NOCOLLIDE," but the
  assets are actually **lowercase** `multi_collision/nocollide` (296 of them), so case sensitivity would destroy
  the match rate outright.

### 8.6 Is it good enough today

Latest scores against an independently baked DLL corpus (production configuration):

| Metric | Value |
|---|---|
| Per-cell walkability accuracy | **99.850%** (1116 tiles / 91,704,677 cells) |
| Dangerous direction (we block, DLL walks) | 34,615 = **0.038%** |
| Safe direction (we walk, DLL blocks) | 103,356 = 0.113% |
| Largest remaining trap | **80 cells** (none ≥ 100) |
| Tiles with zero danger cells (offline suffices) | 156 / 1116 |

The key move here was **changing the yardstick**. Byte-exactness is unreachable; "don't trap the player" is
reachable — and it's what players actually care about.

So there's a `reconnect_walkable` safety pass: a 0-1 BFS that finds thin wall barriers cutting off a large
walkable region and opens them (on by default). That zeroed out every player-trapping gap of ≥100 cells.
The 31 tiles with genuine traps left were each rendered in Ogre and inspected by hand — all of them are narrow
strips and dead corners hugging collision geometry, none strictly blocking a path.

Practical guidance:

- Editor environment available and you want maximum quality → drive the real DLL (byte-exact, ~25 minutes for
  the full corpus);
- Want to minimize DLL dependence → offline as the base, DLL-override just those 31 tiles;
- No editor / cross-platform (in a browser, say) → pure offline: 99.8%+ with no large traps.

> ⚠️ **Never skip MPP generation for a mod with level tiles.** Source trees usually contain no `.mpp` at all,
> so skipping means custom tiles (which have no vanilla fallback) get no walk grid whatsoever — the player
> simply can't move on entering, the exact same symptom as the 2.5 KB stub in §8.2.

---

## 9. What the official data looks like: DATA.PAK and three-layer base

One last piece of background, because it's widely misunderstood.

**The official `DATA.PAK` does not store text.** The entry `FOO.LAYOUT` holds **compiled** BINLAYOUT binary
(equivalent to the `.LAYOUT.BINLAYOUT` sibling in a loose tree). The text in loose community MEDIA trees that
you can open in Notepad is **decompiled** output from unpacking tools.

Format-wise, `DATA.PAK`'s data section is identical to `.MOD`'s (8-byte head `[MaxCSize][Hash]` at offset 0,
then `[u32 uncompressed][u32 compressed][zlib]` blocks). **The manifest isn't in the file — it's in a separate
sidecar, `DATA.PAK.MAN`**, in the `.MOD` manifest format (ver=2 / mhash / root='MEDIA/' / fc / dirs).
The authoritative format reference is the community library `TL2Lib/rgpak.pas`.

Knowing that, an offline packer gets **three layers of base data**:

```
loose ./MEDIA        >   extracted from ./PAKS/DATA.PAK   >   a bundle embedded in the tool (3 MB gzipped)
```

The extraction set is the LEVELSETS DATs (the MPP piece table + ROOMPIECES.RAW), the UNITS DATs (the UNITDATA
BASEFILE inheritance from §7), and the collision meshes those pieces reference — decompiled to text and cached
next to the tool.

**All three layers pack the same level mod byte-identically** (414110 bytes): compilation, RAW (with BASEFILE
inheritance), MPP pathing and container assembly all come out equivalent. The decompiler's round-trip covers all
34 LEVELSETS DATs / 4492 pieces and matches the loose text sources entry for entry.

The practical implication: **a machine without the game installed can still pack correctly** — including a browser.

---

## 10. The tooling today

### 10.1 Desktop

The production packer is written in Rust, and all three binary formats (BINDAT / BINLAYOUT / MPP) are
**true from-scratch compilers**: parse text → serialize binary, reading no existing binary file, so text edits
always compile correctly.

#### Comparison one: vs the native GUTS DLL

Start with the official implementation itself. The native numbers here are not a stopwatch against the editor
GUI — that would be unfair. They were measured by driving the real `EditorGuts.dll` from a forked headless host,
calling its own `CreateMod` + `EditorRegenPathingData`, with the one-off 3.85 s `InitEditor` cost **amortized
out** so only the **hot pack** time counts. In other words, this is the native path's **best case**.
The Rust side ran on the **same source copies**, 5 repeated rounds averaged.

| Component | Files | Native build | Native MPP | Native total | Rust ×5 (s) | Rust mean | Speedup |
|---|--:|--:|--:|--:|---|--:|--:|
| Shared Assets 01 | 12712 | 164.05 | 208.77 | 372.82 | 6.46/11.75/12.37/6.25/6.05 | **8.58** | **43.5×** |
| Class Skills | 68217 | 268.42 | 0.00 | 268.42 | 12.14/19.55/8.85/9.30/11.05 | **12.18** | **22.0×** |
| Demon Fall | 52438 | 169.36 | 0.51 | 169.87 | 12.79/7.56/7.66/8.09/16.58 | **10.54** | **16.1×** |
| Dark Legend | 32020 | 97.86 | 6.02 | 103.88 | 9.46/5.21/5.36/9.76/10.18 | **7.99** | **13.0×** |
| Dark World | 354 | 9.68 | 17.26 | 26.94 | 0.89/0.76/2.10/2.30/1.73 | **1.56** | **17.3×** |
| Mercenaries | 2956 | 14.16 | 0.86 | 15.02 | 1.09/0.79/1.02/2.48/2.47 | **1.57** | **9.6×** |
| Supreme Adapt | 1818 | 11.14 | 0.00 | 11.14 | 0.82/0.56/0.57/1.23/1.31 | **0.90** | **12.4×** |
| Experimental | 470 | 8.31 | 0.00 | 8.31 | 0.65/0.47/0.47/1.07/1.06 | **0.74** | **11.2×** |
| Amulets | 1348 | 4.29 | 0.00 | 4.29 | 0.48/0.36/0.96/0.99/0.33 | **0.62** | **6.9×** |
| Pets | 431 | 1.96 | 0.17 | 2.13 | 0.51/0.43/1.83/1.76/0.38 | **0.98** | **2.2×** |
| **Total** | 172764 | 749.2 | 233.6 | **982.8 s** | | **45.66 s** | **21.5×** |

**Native takes 16 minutes; Rust takes 46 seconds.** Summing each component's best of 5 gives 31.0 s → **31.7×**;
the run-to-run spread comes mostly from Defender's real-time scanning and write-back cache flushes
(each round writes roughly 600 MB of `.MOD` to disk).

Two caveats that **have to be stated**:

- **MPP is not a like-for-like column.** Native's is `EditorRegenPathingData` (byte-exact); Rust's is the
  offline `re` backend (the 99.850% from §8.6). For byte-exactness you use `--mpp dll` — which drives that same
  native DLL, so its speed is exactly the "Native MPP" column. So within that 21.5×, the MPP portion is
  "faster but measured differently"; compile + RAW + boxing is the strictly like-for-like part, and there the
  numbers are **native 749.2 s vs Rust 45.66 s including MPP**.
- File counts here are larger than in the monorepo because these source copies carry compiled siblings
  (`.BINDAT`/`.BINLAYOUT`) that both sides must walk. Two more components (Map Expansion 242.98 s, POE 52.72 s)
  had their source copies deleted and couldn't be re-measured, so they're excluded — including them would only
  make the native total longer.

#### Comparison two: vs the Python reference implementation

That Python version was itself fully optimized: isal's SIMD compression, a numba-JIT MPP kernel, process and
thread pools. This round ran on the monorepo source tree (10 components, 16 cores, output content verified
file-by-file):

| | Python (isal + numba + multiprocess) | Rust | Speedup |
|---|---|---|---|
| Whole series | 63.9 s | **23.7 s** | **2.69×** |
| Dark World | 5.07 s | 0.64 s | 7.9× |
| Shared Assets 01 (263 MB) | 18.14 s | 5.16 s | 3.5× |

Put all three pipelines side by side and the orders of magnitude are roughly
**native GUTS ≈ 983 s / Python ≈ 64 s / Rust ≈ 46 s**. That's a **reference scale, not one controlled
experiment**: 983 and 46 come from the same source copies (comparison one), while 64 comes from the monorepo
tree (comparison two), and the two source sets differ in file count. But the direction leaves no room for
ambiguity: **Rust is more than an order of magnitude faster than native, and better than twice as fast as
fully-optimized Python.**

One more thing you must know when byte-comparing: the **only byte difference between implementations is the
zlib stream** (different compression backends; the game only inflates and cannot tell). So whole-package
comparison must compare **decompressed content**, never raw bytes.

MPP got its own optimization round: triangle AABB pre-filtering + a cross-tile layout cache + a CSR dense bucket
grid + a different allocator, taking **9.8 s → 5.5 s**, with a full-corpus byte-identical re-verification after
every step. One idea was falsified: pre-transforming the gathered vertices is **net negative**
(allocation + scattered reads cost more than 6× redundant multiplies), and was reverted.

### 10.2 Browser

The same code compiled to `wasm32-wasip1` is the site's [**web .MOD packer**](/en/tools/packer/):
pick a folder → pack → download. Entirely local, nothing uploaded, nothing installed.

**The iron rule is: never modify the verified desktop crate.** The wasm crate uses `#[path]` to read-only-reuse
the desktop packer and compiler modules (a single source of truth), and displaces C/OS dependencies with
**same-name shim crates** (compression swapped for a pure-Rust implementation, registry access stubbed, the
EditorGuts driver replaced by a same-signature no-op — the editor is desktop-only).

Verified byte-for-byte: a 1 MB pet mod produces **identical SHA256** from the desktop and wasm builds;
unpacking a 264 MB asset pack gives **11035/11035** matching decompressed non-MPP files.

**The 4 GB linear-memory wall** deserves its own paragraph, because it's a nice engineering problem.
Desktop packing materializes everything in parallel: all decompressed content, all compressed blocks and the
whole output buffer in memory at once. 786 MB of uncompressed assets under wasm32's 4 GB linear memory
(**which only grows and never returns to the OS**) inevitably OOMs.

The fix is a three-pass temp-file stream:

- **Pass 1**: read each file → compress or store immediately → append to `<out>.data.tmp` (only one file held in
  memory), recording the manifest and the largest compressed block;
- **Pass 2**: compute rollingHash — and here the "only ~50 bytes are sampled" property from §2.5 becomes a
  lifesaver: about 50 seeks against the temp file, with no need to read it back into memory;
- **Pass 3**: assemble `header ++ [maxCsz][rollingHash] ++ chunked copy of tmp ++ manifest`.

The data section lives on disk / in the WASI shim's JS heap (**not** in wasm linear memory), so peak memory is
roughly one file plus the manifest. Packing the real 264 MB mod succeeds in 111 seconds with no OOM, and the
SHA256 matches the desktop build.

One development-time trap worth recording: **Node's uvwasi lacks `fd_readdir`** (os error 52), so readdir
returns 0 files and the output is empty. Testing must use wasmtime. The browser's
`@bjorn3/browser_wasi_shim` **does** have readdir, so the live site is unaffected.

### 10.3 A TUI you can just double-click

Launched with no arguments, the packer brings up a terminal interface: it scans the current directory's
subfolders plus `./mods/*`, lists folders containing `MOD.DAT` as mod sources, flags the ones with
`MEDIA/LAYOUTS/*.LAYOUT` as level mods, and packs the selection into the Documents mods folder.

The design is deliberately conservative: **the TUI only handles selection.** Once you've chosen, it restores the
terminal and runs conversion and packing with ordinary console output — the verified core is never touched.
Running it bare in a non-TTY (pipe / CI) falls back to a usage message rather than hanging.

---

## Appendix A: key addresses (EditorGuts.dll, imagebase `0x10000000`)

| Function | Address |
|---|---|
| InitEditor / CreateMod / EditorSetWorkingMod / EditorRegenPathingData | `0x10001DD0` / `0x100DE830` / `0x100E3B50` / `0x100DDDE0` |
| Build orchestration / compile+pack body / PrePack | `sub_103FA610` / `sub_103F5DA0` / `sub_103F50D0` |
| MOD header write / read | `sub_103F5DA0` / `sub_103FA610` |
| Manifest write / mhash | `sub_102A5860` / `sub_1028E6F0` |
| PAK data-section write (+ rollingHash) | `sub_102A7100` |
| Pack-exclude blacklist / static table | `sub_103F4340` / `sub_11D44D40` @ `unk_13E51C50` |
| Type code / compile remap / store table | `sub_102A1EA0` / `sub_102A24F0` / `byte_11E94CD8` |
| Compile dispatch (5 source types) | `sub_1029C9A0` (→ BINDAT `sub_1028FC00` / BINLAYOUT `sub_101169B0`) |
| RAW dispatch | `sub_1029BFA0` |
| Load validation / rollingHash validation | `sub_103F83C0` / `sub_102A3320` → `sub_102A2690` |
| reqHash / MurmurHash64B / gamever read | `sub_103F5500` / `sub_10285330` / `sub_103F8CD0` |
| rollingHash seed RNG: LCG / seed / save state | `sub_10285B30` / `sub_10285A50` / `sub_10285450` |
| BINDAT: serializer / string collector / interner / node writer / WriteShortString | `sub_10289A40` / `sub_10289950` / `sub_1023E9F0` / `sub_10289860` / `sub_1028ED40` |
| BINLAYOUT: writer chain / object writer / datagroup / tag registry | `sub_101169B0…` / `sub_10115320` / `sub_101150F0` / `sub_10253630` |
| RAW: AFFIXES / SKILLS / MISSILES / UI / UNITDATA | `sub_103C4170` / `sub_102ECFD0` / `sub_102FB490` / `sub_103178E0` / `sub_1026CC50` |
| MPP: RegenAll / RegenSingleFile / LoadLevelData / GenPathing / **writer** | `sub_10018750` / `sub_10015FA0` / `sub_1020AB90` / `sub_10203710` / **`sub_10200920`** |
| MPP: down-ray / clearance / point-in-triangle / geometry merge / backdrop gate | `sub_101EF170` / `sub_101EEEA0`·`sub_100672B0` / `sub_10066E50` / `sub_10068CB0` / `sub_1022FF80` |
| rg_hash (GUTS side / game side) | `sub_100CA9A0` / `sub_4C9FE0` (imagebase `0x400000`) |

Game side (`Torchlight2.exe`, imagebase `0x400000`): scheme parsing `sub_7DEA10`, resource manager init
`sub_64A590`, path VFS lookup `sub_68F630`, UNITDATA reading `sub_660560` (via `sub_661480`).

## Appendix B: tools

- **Desktop packer**: `tl2-mikuro-mod-packer` —
  `[--in-place|--temp-copy] [--mpp {re,dll,none}] [--raw {auto,none}] [--deploy] <mod dir>`;
  subcommands `compile-dat` / `compile-layout` / `compile-mpp` / `extract-base` / `unpack-base`; no args → TUI.
- **Web build**: [/en/tools/packer/](/en/tools/packer/) — the same code compiled to WebAssembly, fully client-side.
- **Diagnostic environment variables**: `MIKURO_TIMING=1` (stage timing), `MPP_TIMING`,
  `MPP_RECONNECT=0` (disable the walk-grid safety pass; required when verifying byte-exactness),
  `MIKURO_BINDAT_DICT` (switch to corpus global-id mode),
  `TL2_MEDIA_DIR` / `TL2_INSTALL_DIR` / `TL2_MOD_GAMEVER`.
- **Further reading**: [TL2 Tag System RE](/en/devlog/tl2-tags-re-and-mod-key-audit/) —
  the other thread on the rghash from §5.2, covering tags and property keys.
