---
title: "Torchlight II Mod Pack/Unpack Tool"
date: 2023-08-11T14:01:57+10:00
author: "Mikuro"
summary: "A mod pack/unpack CLI that initializes in 3 seconds, calling EditorGuts.dll directly."
weight: 2
params:
  rarity: "legendary"
  icon: "cube"
  typeline: "Legendary · Mod Pack / Unpack CLI"
  affixes:
    - "3-second init — no more waiting 20 seconds for the editor"
    - "Packs / unpacks by calling EditorGuts.dll exports directly"
    - "Fits a keep-your-workspace-clean development flow"
  flavor: "Pack without waking the editor ever again."
  status: "Released"
  metaline: "github.com/heiybb/TL2-Mikuro"
---

## Link
https://github.com/heiybb/TL2-Mikuro

## Why it exists
Packing or unpacking a mod normally means starting the editor and sitting through a ~20-second load while it initializes features you don't need.
TL2-Mikuro initializes in 3 seconds.
It does this by calling functions in `EditorGuts.dll` directly — which, regrettably, means `EditorGuts` still has to be installed.

## Install
Just drop `TL2-Mikuro.exe` into the same folder as `Editor.exe` / `Torchlight2.exe`.

## Known limitations
Constrained by the internal logic of `EditorGuts.dll`, packing only accepts projects under the `mods` folder, and unpacking likewise only targets a `mods` folder under the destination directory.
I was new to WPF and C# when I wrote this, so please forgive the rough edges.

## To do
Further analysis of `EditorGuts.dll`.

## License
Licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
