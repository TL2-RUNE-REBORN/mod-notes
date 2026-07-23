---
title: ".MOD Packer · Web Edition"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "Pack a mod folder into a .MOD right in the browser: the desktop packer's Rust code compiled to WebAssembly — fully local, nothing uploaded, nothing to install."
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  link: "/tools/packer/"
  typeline: "Magic · In-Browser Mod Packer · WebAssembly"
  affixes:
    - "The same Rust code as the desktop tl2-mikuro-mod-packer, compiled to wasm — DAT / LAYOUT compilation and .MOD packing are byte-identical"
    - "Fully client-side: pick a folder → pack → download; nothing uploaded, nothing installed, works offline once loaded"
    - "Ships the full Runic base data (UNITS templates + level collision geometry) — BASEFILE inheritance and MPP walk-grids bake right in the browser"
    - "Uses wasm threads under cross-origin isolation — large mods pack in ~1/4 – 1/6 of the single-thread time"
  flavor: "The same furnace, seen through a new window."
  status: "Live"
  metaline: "web · chrome / edge / firefox"
---

<script>location.replace("/tools/packer/")</script>

The tool lives on the packer page itself — **[▶ Open the .MOD Packer](/tools/packer/)**, nothing to install, runs straight in your browser.
