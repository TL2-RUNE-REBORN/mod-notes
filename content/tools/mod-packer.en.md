---
title: ".MOD Packer · Web Edition"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "Pack a mod folder into a .MOD right in the browser: the desktop packer's Rust code compiled to WebAssembly — fully local, nothing uploaded, nothing to install."
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  typeline: "Magic · In-Browser Mod Packer · WebAssembly"
  affixes:
    - "The same Rust code as the desktop tl2-mikuro-mod-packer, compiled to wasm — DAT / LAYOUT compilation is byte-identical"
    - "Fully client-side: pick a folder → pack → download; nothing uploaded, nothing installed, works offline once loaded"
    - "Ships the full Runic base UNITS templates, so BASEFILE unit inheritance resolves entirely in the browser"
    - "Built-in self-test: one click verifies the output is byte-identical (SHA-256) to a desktop reference"
  flavor: "The same furnace, seen through a new window."
  status: "Live"
  metaline: "web · chrome / edge / firefox"
---

## Open the tool

**[▶ Open the .MOD Packer](/tools/packer/)** — nothing to install, runs in the browser (interface currently in Chinese).

## What it is

The core of the [desktop mod packer](/tools/tl2-mikuro-tool/), moved wholesale into the browser: the same Rust
packing code compiled to **WebAssembly (wasm32-wasip1)**, running against an in-memory file system on the page.
Pick a mod folder and it compiles `DAT` / `LAYOUT` sources into the engine's binary formats
(`BINDAT` / `BINLAYOUT`) and assembles the `.MOD` container — locally:

- **Fully local**: everything runs inside the browser's WebAssembly sandbox; no file ever leaves your machine;
- **Identical output**: compilation and container assembly share the desktop packer's code, byte-identical content
  (manifest file timestamps are written at the browser-visible millisecond precision, a cosmetic difference from
  the desktop's 100ns precision that does not affect game loading or mod activation);
- **BASEFILE inheritance**: ships the full Runic base UNITS templates (7731 files, 760 KB gzipped), so the
  `BASEFILE` inheritance chains of item / unit mods resolve entirely in the browser;
- **Built-in self-test**: one click packs a bundled sample and compares the output byte-for-byte (SHA-256)
  against a desktop reference, so you can always verify the pipeline in your own browser.

## How to use

Click the folder picker and select your mod root (it must contain `MOD.DAT` and `MEDIA/`), confirm the output
file name, hit pack, then download. Chrome / Edge get the native directory picker; Firefox and others fall back
to a directory upload input (still read locally only).

## Limits

- **MPP level pathing data is not generated** (equivalent to the desktop `--mpp none`). Mods that ship level
  `LAYOUT`s (new / edited maps) should be packed with the desktop tool — MPP baking needs the base game's level
  geometry, and the web edition only bundles the UNITS templates. Pure stat / unit / item / skill mods are unaffected.
- The whole mod tree is read into memory; for multi-hundred-MB mega components, use the
  [desktop packer](/tools/tl2-mikuro-tool/).
