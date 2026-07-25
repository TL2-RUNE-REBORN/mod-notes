---
title: "TL2 Tag System RE: A Zero-Validation Engine, and a Property-Key Audit"
date: 2026-07-24T16:38:00+10:00
author: "Mikuro"
summary: "The engine matches tags by rghash with zero runtime validation — any tag works. Plus the truth about GUTS's spammy no-match warning, and a property-key audit of two real mod packs. (2026-07-25: section 9 added — names live in two namespaces, and the \"zero hardcoded tags\" search was blind.)"
---

> **⚠ Correction, 2026-07-25**: reconciling against one name the engine demonstrably consumes —
> `TIER3_DESCRIPTION` — showed that the *method* behind conclusion #2 below ("hardcoded tags: zero") is
> blind: the engine never uses precomputed hash immediates, it rghashes wide-string literals **at runtime**.
> The corrected framing, the measurements, and the packer fix that fell out of it are in
> [section 9](#9-correction-2026-07-25-tier3_description-narrows-the-conclusion).
> Conclusions #1 and #3 (any tag **value** works / the warning is GUTS-only) survived re-verification.

> It started ordinary: an old mod pack's load log was flooded with `Found property name with a hashcode (…) that has no match in tags.dat`.
> The real question — is this the mod using an "illegal tag," or something else entirely? Following that one warning, I took TL2's tag system apart down to `Torchlight2.exe`.
>
> **Method**: IDA (idalib MCP) decompilation of `Torchlight2.exe` (32-bit, imagebase `0x400000`) and `EditorGuts.dll` (imagebase `0x10000000`),
> plus an rghash reconciliation against the `MEDIA/TAGS.DAT` baseline (3631 tag names), plus a scan of **every** DAT property key in two real mod packs. Every `sub_XXXXXXXX` is an absolute address.
>
> **One-line conclusion**: the engine matches tags by name hash (**rghash**) and **never consults** `TAGS.DAT` at runtime. So a mod can write literally any tag string;
> `TAGS.DAT` is just the GUTS dropdown list plus a hash→name **display lookup table**, not a validation gate. And that spammy warning isn't the game's — it's the **GUTS editor's**,
> and not a single byte of property data is lost.

---

## 0. Conclusions first

1. **The engine accepts any tag (rghash match, zero validation).** `TAGS.DAT` = GUTS dropdown + a hash→name display table, not a membership set. A tag you can't pick in GUTS is simply one that isn't in that table; bypass GUTS — write the DAT directly / pack directly — and any tag works.
2. ~~**Hardcoded tags in the engine: zero.**~~ **(→ narrowed 2026-07-25, see [section 9](#9-correction-2026-07-25-tier3_description-narrows-the-conclusion))** The hash immediates for 68 candidate tags, searched across the entire exe code segment: 0 hits. The 56 callers of rghash are all DAT field-key parsers. Tags are 100% data-driven — boss/hero-style special behavior runs through `UNITTYPES` / `MONSTERCLASS` / explicit DAT flags (like `ISBOSS`), **not tags**.
3. **The `no match in tags.dat` warning is GUTS-only, and loses nothing.** That string doesn't exist in `Torchlight2.exe` at all. The real risk isn't the warning — it's that **opening and re-saving in GUTS** rewrites unrecognized key names as hash numbers, and may quietly drop other fields you'd edited.

The exe evidence for each follows.

---

## 1. How the engine recognizes a tag: rghash + a plain hash compare

**rghash = `sub_4C9FE0`** (`0x4C9FE0`). A djb2 variant, rolled per wchar:

```
h = len(s)
for wchar c in s:
    h = (h >> 27) ^ (h << 5) ^ c        # confirmed instruction-by-instruction: shr ecx,0x1B  shl esi,5  xor ecx,esi  xor ecx,edx
```

It's the same algorithm as `sub_100CA9A0` in `EditorGuts.dll` — which matters, because GUTS hashes key/name strings when it compiles a DAT, and the game hashes them again at runtime; the two must agree or nothing lines up.

**A tag match is a single hash compare.** `sub_4CA070` decompiles to one line:

```c
return rghash(a2) == this[2];   // this[2] is the hash stored when this tag object was loaded
```

No registry query. No membership check. **Any string whose rghash equals the stored value matches.** Structural keys work identically: `sub_4CA7D0` hardcodes `BASEOBJECT` / `PROPERTIES` / `NAME` / `ID`, each rghash'd, then compared.

That settles it: the thing being compared against is a **hash computed while loading data**, never "is this tag in some legal set." At runtime, that legal set doesn't exist.

---

## 2. What TAGS.DAT actually is: a hash→name lookup table

So what is `TAGS.DAT` for? `sub_65BBF0` is its runtime parser (debug strings `"Loading tag file:"` / `"Tags parsed. Total count:"`), and the logic is plain:

```
read COUNT
loop over TAG0..TAGn names:
    hash = rghash(name)
    entry = sub_4FF760(&hash)      # get/create the map entry for this hash
    entry+4 = name                 # hang the name off it
```

The result is a **`hash → name`** table, **used by UI/tooltips to look a display name back up**. It's not a gate: an unregistered tag still matches by hash, it just lacks a pretty name.

While here, this nails Q4 (is a tag hash really rghash?): compute rghash for all 3631 baseline tag names and **3568 of them (98%) hit the 3692 integers in `TAGS.DAT`**. The remaining 2% miss is decode corruption / localization debris — `TAGS.DAT`'s string pool also carries non-tag localized UI strings (things like `', EINGANG'`). In other words: **the integers in `TAGS.DAT` are the rghash of the names.** The table reads both ways (name↔hash), and the GUTS dropdown comes from it.

> One easy-to-miss anchor: in-game tag registration does **not** run through an explicit "load the `TAGS.DAT` string" path. The wide string `"MEDIA/TAGS.DAT"` (`@0x2182044`) in the exe is only referenced by `sub_65B310` (a DAT→text decompile utility); the wide string `"TAGS"` (`@0x21821f4`) is only referenced by `sub_789B00` (the console command dispatcher), a debug command. Neither is the gameplay tag system.

---

## 3. How many tags does the engine hardcode? — Zero

"Zero validation" left one loose thread: what if the engine **special-cases** some tag (sees `HERO` and triggers special AI)? Two independent angles converge on the same answer.

**Angle one: all 56 rghash callers, one by one.** Decompile every one of `sub_4C9FE0`'s 56 call sites and pull the string constants passed in. They classify, without exception, as **DAT/LAYOUT field-key parsers plus the `TAGS.DAT` loader** — no "magic tag" anywhere:

- **Structural/layout keys**: `NAME` / `ID` / `PROPERTIES` / `BASEOBJECT` / `DESCRIPTOR` / `LOGICGROUP` / `PIECE` / `GUID` / `MESH` …
- **Per-content-type field keys**: SKILL (`SKILL_TYPE` / `ACTIVATION_TYPE` / `TARGET_ALIGNMENT` …), AFFIX/EFFECT (`TARGET` / `IGNORE_UNITTYPE` / `DURATION` …), QUEST (`TASK` / `REWARD` …), plus EMOTE/FEATURE/THEME/KEYBIND.
- **Tag registry loading**: `sub_65BBF0` (`COUNT` / `TAG<i>`).

So rghash is a **generic "match a DAT field key by hash" function** — not a place where any specific tag gets special treatment.

**Angle two: search for the hash immediates directly.** If the engine special-cased a tag, it would have to compare against a **precomputed hash immediate** (it won't rehash a string constant at runtime). So: compute rghash for 68 candidate tags — 28 common gameplay guesses (`HERO` / `BOSS` / `CHAMPION` / `PET` / `SUMMONED` / `MALE` / `FEMALE` / `ELITE` / `MINION` …) plus 40 real baseline single-word tags — and `find_bytes` their little-endian u32 across the **whole exe**: **0 hits in the code segment**. The lone "hit," `PET@0x253b69d`, has no xref and isn't even 4-byte aligned = coincidental data bytes, not a tag-hash reference.

**→ Tags are 100% data-driven.** Whether a custom tag means anything depends entirely on whether you **also write the data rule that references it** (an affix/loot/spawn DAT). A carrier with nobody checking it = inert dead data (harmless, and useless). Want to "borrow" some built-in engine behavior? There's no shortcut — that behavior goes through `UNITTYPES` / classes / explicit flags, and recognizes no tag string.

---

## 4. The truth about the spammy warning: GUTS-only, nothing lost

Back to the log that started this. First a decisive fact check: **the string `Found property name with a hashcode (…) that has no match in tags.dat:` cannot be found in `Torchlight2.exe`** (ASCII and wide, 0 hits). It lives only in `EditorGuts.dll` — wide `@0x11E93868` "Found property name with a hashcode (" + narrow `@0x11E938BF` ") that has no match in tags.dat: ". The emitter is `sub_10289D20`.

`sub_10289D20` reads the property stream (each property = `key_hash(4) + type(4) + value`), in this order:

```
sub_10287DD0(key_hash, value, …, type)     # (1) called unconditionally — property + value stored as-is, never dropped
look key_hash up in the tags.dat hash→name tree:   # (2) only then
    hit  → use the real name (sub_10288C10(node+5))
    miss → emit this warning, and sub_10296760 formats the hash into a string, used as the "name"
```

Three conclusions:

1. **This is a GUTS editor diagnostic.** The game engine never emits it and doesn't care — fully consistent with §1's "hash match, zero validation."
2. **The value isn't lost.** The store step (`sub_10287DD0`) runs unconditionally, **before** the lookup. GUTS simply has no friendly name to show and falls back to the hashcode as the name.
3. **The real risk is a GUTS round-trip.** Re-save in GUTS and those "hash-name-only" properties get written back as hash **numbers** (dev's own words: GUTS replaces unrecognized keys with hash numbers, and re-hashes on top of that) — and GUTS may **incidentally discard other fields you edited**. Bypass GUTS — text edit + pack directly (the mikuro packer) — and this entire class of problem never happens.

---

## 5. Field test: a property-key audit of two mod packs

Theory done; check it against real data. Method: take **every property key** that appears in a mod, reconcile it against the 3692 registered hashes in `TAGS.DAT`, and auto-bucket the unregistered ones into three — **GUTS number corruption / edit-distance-1 typo / genuinely custom**.

### 5.1 Old IMBA pack (48,869 DAT) = typos stacked with GUTS corruption

The "custom keys" it turned up are, on inspection, all **vanilla keys with the trailing D dropped**:

| broken key | rghash | files | verdict |
|---|---|---|---|
| `DEXTERITY_REQUIRE` | 1970490181 | 2720 | typo of `DEXTERITY_REQUIRED` |
| `STRENGTH_REQUIRE` | 2034231625 | 2517 | typo of `STRENGTH_REQUIRED` |
| `MAGIC_REQUIRE` | 4272869367 | 2272 | typo of `MAGIC_REQUIRED` |
| `DEFENSE_REQUIRE` | 1284104295 | 1638 | typo of `DEFENSE_REQUIRED` |
| `SHOULDERS_OVERRIDE` | 786463860 | 29 | genuinely custom / TL2 has no shoulders slot → inert |

The first four are the vanilla equipment-requirement keys `*_REQUIRED` (read at runtime by string→hash: the exe wide strings `STRENGTH_REQUIRED@0x2174364` / `DEXTERITY_REQUIRED@0x2174304`) with the trailing D removed. **The engine only reads the D versions**, so these missing-D keys are dead data — the attribute requirements they set **are never enforced**.

Across the whole repo it's worse: `*_REQUIRE` (broken) 3439 files, `*_REQUIRED` (vanilla) 9412 files, **both present in only 304 files**. That leaves roughly **3135 items carrying only the broken, missing-D key and no vanilla key** — their attribute requirements are silently ignored by the engine.

Layered on top of that is GUTS corruption: **53 keys have been written as bare decimal hash numbers** (some past re-save in GUTS swapped the text key name for its hash). Five of those are still reverse-lookupable (the `*_REQUIRE` family + `SHOULDERS_OVERRIDE`); the other **48 names are lost for good** — irreversible, recoverable only from another copy, or kept as a number (still runs, just loses the readable name).

### 5.2 challenger-continent (72,740 DAT, packed via the mikuro packer, never through GUTS) = clean

Same scan, the control group:

- `*_REQUIRE` (broken) **0** files; `*_REQUIRED` (vanilla) 14,615 files; both present 0; requirements broken 0.
- **GUTS number corruption: 0.**
- The scanner's raw flags, after manual review, all land on **benign / WIP**:
  - `TIER4_DESCRIPTION` (3): ★false positive, not a typo. `TAGS.DAT` registers only `TIER1/2/3_DESCRIPTION`; `TIER4` is an intentional 4th-tier extension (pure display, engine reads 1–3, harmless).
  - `MOD_ID` / `VERSION` / `AUTHOR` / `WEBSITE` / `MOD_FILE_NAME` (10 each): `MOD.DAT` manifest header fields (one per sub-repo). These are packing metadata, not game-data keys — correctly absent from `TAGS.DAT`.
  - `chest_OVERRIDE` (3) / `belt_OVERRIDE` (6) / `shoulders_OVERRIDE` (6), lowercase, under `实验内容/`: a real hazard, but harmless for now. **rghash is case-sensitive** → the lowercase versions aren't read by the engine (vanilla is `CHEST_OVERRIDE` uppercase; `BELT`/`SHOULDERS` have no vanilla slot at all). WIP.
  - `SHOULDERS_OVERRIDE` (76, uppercase): an intentional custom shoulder-slot key; TL2 has no vanilla shoulder slot, so inert unless the mod adds one.
  - `INCLUDE_DEAD` (1): a one-off custom key; intent to confirm.

The contrast is the whole point: **same engine, same `TAGS.DAT`, two mods.** The one packed through GUTS is riddled with typos and 53 hash-number scars; the one packed directly with the mikuro packer, never touching GUTS, has zero of either. **"Bypass GUTS = zero corruption"** — demonstrated across 72k-plus files.

---

## 6. Companion tooling

- **`scan_mod_problems.py`**: point it at a mod's MEDIA tree + `TAGS.DAT`; it lists every unregistered property key and auto-buckets it (GUTS number corruption / edit-distance-1 typo / genuinely custom). The two reports above are its output. Note the "custom/typo" bucket still needs a human pass — the `TIER4_DESCRIPTION` false positive is exactly why.
- **The mikuro packer's DAT decompile**: turn compiled BINDAT / `.DAT` back into readable text, so you can see what keys a shipped or GUTS-saved DAT **actually** carries — that's how the 53 hash-number keys were caught.

---

## 7. Three practical takeaways for modders

1. **Want a tag you can't pick in GUTS?** Write the DAT / pack directly — the engine accepts it. But for a tag to *do* something, you have to write the data rule that references it (an affix/loot/spawn DAT); the engine gives no tag free behavior. To restore a display name, add the tag to `TAGS.DAT` (UI only).
2. **Don't round-trip a third-party old mod through GUTS.** It will wash unrecognized keys into hash numbers and may drop fields. Edit the text and pack directly instead.
3. **Seeing a wall of `no match in tags.dat`?** First work out who's emitting it — if it's GUTS, no data is lost, only the display name degrades; the thing to actually avoid is running those "hash-name-only" properties through GUTS again.

---

## 8. Honest boundaries

- Q1 / Q3 / Q4 are proven from exe decompilation: rghash `sub_4C9FE0`, match `sub_4CA070`, registry `sub_65BBF0`, the 3568=98% hash reconciliation, and the 68 hash immediates with 0 hits.
- Keep two different questions apart: "**which tags are usable**" = all of them (answered here); "**which tags trigger special engine behavior**" needs a separate search over precomputed hash immediates — this pass covered only 68 candidates (0 hits), which is not a proof over the whole hash space.
- Q2 (are item/unit tags **stored** or **derived**) is not closed this round: DATs carry almost no explicit `<>TAG:` key, so derivation is the working hypothesis — left for later.
- rghash is 32-bit, so collisions are theoretically possible; the 3631 baseline names include non-tag localized strings from the PAK string pool (the source of that 2% miss in reconciliation).

---

## 9. Correction (2026-07-25): TIER3_DESCRIPTION narrows the conclusion

Conclusion #2 above ("hardcoded tags in the engine: zero") rested on a hash-immediate search that came back
empty. A day later I reconciled it against one name the engine **demonstrably** consumes —
`TIER3_DESCRIPTION`, the third tier-bonus line in a skill tooltip — and the reasoning fell apart.

### 9.1 How it is actually consumed: three stages

**① DAT key → skill-definition field.** In the skill DAT it is an ordinary top-level `[SKILL]` property:

```
<TRANSLATE>TIER1_DESCRIPTION:5 pillars of flame are created
<TRANSLATE>TIER2_DESCRIPTION:6 pillars of flame are created
<TRANSLATE>TIER3_DESCRIPTION:7 pillars of flame are created
```

The engine **hardcodes all three names as wide-string literals** and reads them in the skill-definition
loader `sub_6DC320`:

| key | literal | read at | stored at |
|---|---|---|---|
| `TIER1_DESCRIPTION` | `@0x218B4AC` | `0x6DD905` | `+0x270` |
| `TIER2_DESCRIPTION` | `@0x218B488` | `0x6DD95C` | `+0x28C` |
| `TIER3_DESCRIPTION` | `@0x218B464` | `0x6DD9B3` | `+0x2A8` |

The lookup goes through the generic property-bag getter `sub_677F00` → `sub_677E80`, whose first line is
`v3 = sub_4C9FE0(key)` — it **rghashes the literal at runtime**, then binary-searches a hash-ordered tree.

**② Tooltip build, `sub_6D4020`.** The same function fetches UI widgets by name:
`TIER1_SEC`/`TIER2_SEC`/`TIER3_SEC` (section containers), `TIER1DESCRIPTION`/`TIER2DESCRIPTION`/
`TIER3DESCRIPTION` (text), `TIERDIVIDER` (separator). Per section: empty field → hide; non-empty → set the
text and `setAlpha(investedPoints < threshold ? 0.5 : 1.0)` (`sub_70ECF0` → `CEGUI::Window::setAlpha`).
**Thresholds 5 / 10 / 15 are exe immediates**; all three empty falls back to `"No Tier upgrades available."`.

**③ The skill-tree cell, `sub_79F4F0`**, binds a second set: `TIERTEXT1/2/3` (alongside `MINUS`/`PLUS`/
`PROGRESSBAR`/`INVESTED`/`CONTAINER`).

The exe contains exactly **13 wide literals starting with `TIER`, all enumerated — and no `TIER4`.**

### 9.2 So what was wrong with #2

**The search method, not the data.** Special-casing a name does **not** require a precomputed hash immediate:
the engine keeps the name as a wide literal in code and hashes it on every call. So "search the whole exe for
hash immediates → 0 hits" was going to return 0 **no matter how many names the engine hardcodes**. It proves nothing.

A measurement that can actually see them — extract **every** UTF-16LE literal in the exe and intersect with the
`TAGS.DAT` name pool:

| | count |
|---|---|
| identifier-shaped names in the `TAGS.DAT` pool | 2929 |
| └ **hardcoded in the exe** as wide literals | **1167 (39%)** |
| └ absent from the exe (pure data space) | 1762 (61%) |
| identifier-shaped wide literals in the exe | 4050 |
| └ **not** in the `TAGS.DAT` pool | 2883 |

Two more corrections fall out:

- **`sub_4CA070` is not a "tag matcher."** It is `node.keyHash == rghash(literal)` — a **key** comparator, with
  exactly one call site in the whole exe (`sub_506550`, comparing `TIMELINEOBJECTEVENT`). Section 1 used it as
  the core evidence for tag matching; that was a mislabel.
- **"the 56 rghash callers" is too narrow a lens.** Hardcoded names live at the **property-getter call sites**
  (`sub_677F00` alone has ≥100 xrefs), not at rghash's direct callers.

One methodology lesson too: **IDA's string list is unreliable** — `TIER3_DESCRIPTION` isn't in it at all, so
`find_regex` reports 0 hits. Section 4's claim that the GUTS warning string is absent from the exe was therefore
re-verified the hard way, by extracting UTF-16LE/ASCII strings from the **raw bytes**: `no match in tags.dat` and
`Found property name with a hashcode` are still 0, while `TAGS.DAT` / `Loading tag file` / `Tags parsed` do hit.
**The conclusion stands.**

### 9.3 Corrected framing: names live in two namespaces

The root confusion was calling every name in `TAGS.DAT` a "tag." There are two distinct things:

1. **Keys the engine reads** (`TIER3_DESCRIPTION`, `SKILL_ICON`, `CHEST_OVERRIDE`, …): the name is
   **hardcoded in the exe**, **case-sensitive, character for character**. A misspelled key still gets stored in
   the property bag (rghash validates nothing), but **no code ever queries it** → inert, silently dead. That is
   exactly the mechanism behind the lowercase `chest_OVERRIDE` hazard in section 5.2.
2. **Values matched between data files** (unit/level tags, spawnclass names, …): name them anything, as long as
   the carrier and the checker agree. Membership in `TAGS.DAT` only affects whether GUTS can offer it in a
   dropdown and whether a hash reverses to a readable name.

**"Any tag works" holds only for the second kind** — re-verified this round: the 131 `A1-*` level/quest tags have
0 hits in the exe, and the engine's own property schema (`sub_4A29A0`, for `CWidgetUnitImageDescriptor`) documents
its `TAG` property as *"The tag to check in the unit data of the target."* — data compared against data. Same on
the loot side (`sub_5FE2C0` loops over `TAG` blocks reading `NAME`/`CHANCE`/`MINCOUNT`/`MAXCOUNT`).

The practical takeaway — you cannot invent a tag name and inherit engine behavior for free — is **unchanged**, but
the reason has to be restated: not "the engine hardcodes no names," but **the engine hardcodes its own key set,
whose behavior you cannot alter and which offers no spare hooks**.

That also upgrades the `TIER4_DESCRIPTION` note in section 5.2 from inference to proof: the engine **does not read
it** (no such literal) and the UI has **no** `TIER4_SEC`/`TIER4DESCRIPTION`/`TIERTEXT4` widget → **100% inert,
harmless, never displayed**. A fourth tier can only be folded into `TIER3_DESCRIPTION`'s text. And those 5/10/15
thresholds only drive that line's dim/highlight state — **data cannot move them**; the actual numbers follow the
skill's `[LEVEL]` blocks, so putting tier bonuses on other invest levels desyncs the tooltip's dim/bright from the
real bonus.

### 9.4 Fallout: a real bug in our own packer

The reconciliation exposed a genuine bug in the toolchain. A BINDAT stores names only as rghash, so decompiling
leans on an embedded reverse dictionary (1678 entries, harvested from shipped data); a hash it can't name comes out
as the placeholder `UNK_<8 hex digits>`. The problem was on the way **back in**: the compiler dutifully rghashed the
placeholder **text** `UNK_1A2B3C4D` — producing a **completely different hash**. No error, no warning, the data just
went dark.

Not a theoretical risk. Scanning key and section names across 80,505 real DATs (the whole challenger-continent repo):

- only 20 new keys (all mod-invented: manifest fields, `*_OVERRIDE` experiments, `TIER4_DESCRIPTION`);
- but **104 new section names, overwhelmingly `LEVEL17` … `LEVEL100`**.

Because the dictionary was harvested from **shipped** data, its numbered families stop where the vanilla game
stopped: `LEVEL1..16`, `CHILD1..5`, `ENCHANTCOST1..4`, `VALUE1..5`, `TIER1..3_DESCRIPTION`. Mods left that range
long ago. So a `[LEVEL20]` unpacks as `UNK_…` and repacks into a key the engine never looks up — **the whole
section's data disappears silently**.

The fix (shipped; both the Rust and the WASM packer share one `bindat.rs`):

1. **`UNK_<HEX8>` is now a real escape**: the compiler recognizes it and writes the **original hash back verbatim**,
   so decompile → compile is **byte-identical**. Deliberately strict (exact length + uppercase hex); anything
   else is an ordinary name and gets hashed.
2. **Packing warns**: any file that used the escape is listed with its placeholder names — the data survives, but
   the readable name is gone, so put the real name back when you know it, and **never hand-edit the digits inside
   an `UNK_` token** (that changes the hash).
3. The WASM side additionally exports `dat_raw_hash_names(data)` so the browser tool can raise the same warning.

As for "just pour all 4050 exe identifiers into the dictionary" — considered, rejected: the merge is collision-free,
but the gap that actually bites is names mods invent, which no dictionary can ever cover. Fixing the escape is the
cure.

---

## Appendix: key addresses

**`Torchlight2.exe`** (imagebase `0x400000`)

| function | address |
|---|---|
| rghash (name/key hash) | `sub_4C9FE0` |
| ~~tag~~ key match (plain hash compare, 1 call site exe-wide) | `sub_4CA070` |
| property-bag get (rghash + hash-tree lookup) | `sub_677F00` → `sub_677E80` |
| skill-definition loader (reads `TIER1/2/3_DESCRIPTION`) | `sub_6DC320` |
| skill tooltip (`TIER<n>_SEC`/`TIER<n>DESCRIPTION`/`TIERDIVIDER`, thresholds 5/10/15) | `sub_6D4020` |
| skill-tree cell (`TIERTEXT1/2/3`) | `sub_79F4F0` |
| widget alpha (dim/highlight) | `sub_70ECF0` → `CEGUI::Window::setAlpha` |
| structural-key parse (`BASEOBJECT`/`PROPERTIES`/`NAME`/`ID`) | `sub_4CA7D0` |
| `TAGS.DAT` loader (hash→name table) / map get-or-create | `sub_65BBF0` / `sub_4FF760` |
| vanilla requirement-key wide strings | `STRENGTH_REQUIRED@0x2174364` / `DEXTERITY_REQUIRED@0x2174304` |
| `"MEDIA/TAGS.DAT"` wide str (only the DAT-decompile utility) / `"TAGS"` console cmd | `@0x2182044`·`sub_65B310` / `@0x21821f4`·`sub_789B00` |

**`EditorGuts.dll`** (imagebase `0x10000000`)

| function | address |
|---|---|
| rghash twin | `sub_100CA9A0` |
| property-stream read / emits the no-match warning | `sub_10289D20` |
| stores property + value unconditionally, before the lookup | `sub_10287DD0` |
| hash→string (fallback display name) / name accessor | `sub_10296760` / `sub_10288C10` |
| warning format strings | wide `@0x11E93868` / narrow `@0x11E938BF` |

**Companion files**: `原版游戏分析/TAGS_RE/` (`TAGS_ENGINE_SET.md` main findings, the two audit reports `IMBA_custom_keys.txt` and `challenger_key_problems.txt`, the `_LEDGER.json` RE ledger, and the 3631-name `tags_dat_baseline.txt`).
