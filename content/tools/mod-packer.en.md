---
title: ".MOD UN/PACKER · Web Edition"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "Pack a mod folder into a .MOD right in the browser — and unpack a .MOD back into editable sources: the desktop tool's Rust code compiled to WebAssembly, fully local, nothing uploaded, nothing to install."
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  link: "/en/tools/packer/"
  typeline: "Magic · In-Browser Mod UN/PACKER · WebAssembly"
  affixes:
    - "The same Rust code as the desktop tl2-mikuro-mod-packer, compiled to wasm — DAT / LAYOUT compilation and .MOD packing are byte-identical"
    - "Fully client-side: pick a folder → pack → download; nothing uploaded, nothing installed, works offline once loaded"
    - "Ships the full Runic base data (UNITS templates + level collision geometry) — BASEFILE inheritance and MPP walk-grids bake right in the browser"
    - "Uses wasm threads under cross-origin isolation — large mods pack in ~1/4 – 1/6 of the single-thread time"
    - "Unpacks too: a .MOD back into an editable source folder, with BINDAT / BINLAYOUT decompiled to text; Chrome / Edge write the folder directly, others get a ZIP"
    - "Key-name recovery: a 465k-entry tiered reverse table plus the file's own context — recovered names print green, still-unknown ones red; across 20 third-party mods UNK_ fell from 972 to 871 with zero regressions"
    - "For speed, or for multi-hundred-MB compilations, reach for the native Rust build tl2-mikuro-mod-packer-rs — real multi-core parallelism, no browser memory ceiling"
  flavor: "The same furnace, seen through a new window."
  status: "Live"
  metaline: "web · chrome / edge / firefox"
---

<script>location.replace("/en/tools/packer/")</script>

The tool lives on the packer page itself — **[▶ Open the .MOD UN/PACKER](/en/tools/packer/)**, nothing to install, runs straight in your browser.

If you want it faster, or you are working on a multi-hundred-MB compilation, reach for the
**native Rust build** instead:
[tl2-mikuro-mod-packer-rs](https://github.com/heiybb/tl2-mikuro-mod-packer-rs) — a single
exe, nothing to install, real multi-core parallelism and no 4 GB browser memory ceiling,
typically several times quicker. Both are the same code and produce byte-identical output;
the web edition simply wins on being instantly available, anywhere.
