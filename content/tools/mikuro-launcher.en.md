---
title: "Mikuro Launcher"
date: 2026-07-14T22:20:36+10:00
author: "Mikuro"
summary: "An unlimited mod launcher with the MIKURO game enhancements built in (loot filter / save fix / DXVK / multiplayer) — one click and you're in."
weight: 1
params:
  rarity: "legendary"
  icon: "flame"
  typeline: "Legendary · Mod Launcher · Game Enhancement"
  affixes:
    - "Breaks the official 10-mod loading cap — stack as many as you like"
    - "MIKURO enhancements: loot filter / save-crash fix / gem socket gating"
    - "Dual DXVK builds auto-selected by GPU driver — cures black screens and instant exits on old drivers"
    - "Save manager: browse by level / class, unbind mods precisely, double-click to select a save's mod set"
    - "One click to join the MIKURO Afdian multiplayer servers (Guangzhou / Australia)"
    - "Environment self-check on every launch: OS / mod folder / VC++ runtime"
  flavor: "The cap only ever existed in one line of the old launcher."
  status: "Released · v1.1.7"
  metaline: "windows 10 / 11 · bundled with the mod pack"
---

## Overview

The **Mikuro Launcher** is a replacement launcher for Torchlight II. The official ModLauncher caps you at **10 mods** — but that cap only exists on the launcher's side; the engine itself has none. The Mikuro Launcher scans `.MOD` file headers directly, generates a loading scheme and starts the game — **stack as many mods as you like**. It also folds the whole MIKURO enhancement suite, DXVK compatibility, multiplayer servers and save tooling into one window: tick a box and it works.

<figure class="shot">
  <img src="/tools/mikuro-launcher/main.png" alt="Mikuro Launcher main window">
  <figcaption>fig.1 — Main window: mod list on the left · selection details in the middle · load order on the right; enhancement / DXVK / multiplayer toggles and the Launch button along the bottom.</figcaption>
</figure>

## Ⅰ Unlimited Mod Loading

- **No more 10-mod cap.** Writes `modlauncher.sch` directly and starts the game with `MODSCHEME=`, bypassing the old launcher's counter. A full Challenger Continent stack plus other mods is no problem.
- **Drag to reorder — order is priority.** The "selected mods" panel on the right is drag-sortable; Torchlight II's override rule is **first-loaded wins**, so mods higher in the list override those below.
- **Selection details at a glance.** Name / author / mod version / game-version match / description, shown as soon as you select an entry.
- **Save and load schemes.** Keep favorite combinations as reusable `.sch` schemes.
- **No mods selected = vanilla launch.** With nothing ticked, the button switches to "Launch Vanilla" and reads your vanilla characters from `save\` — no accidental trips into the mod-save folder.

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅱ MIKURO Runtime Enhancements

One switch — "**MIKURO Game Enhancement**" — injects the MIKURO runtime into the game (installed as a `d3d9.dll` proxy, **single-player / host only**, language follows the UI). It brings a set of upgrades vanilla never had, without touching the save format:

- **Loot filter** — filter ground drops by rarity / type, auto-detects mod-defined rarities (EPIC / RUNE, etc.); **quest items are never swallowed**; rules adjustable in-game at any time.
- **Save / zone-transition crash fix** — byte-level runtime repair of crashes triggered by oversized bags and stashes when saving, loading or changing zones. **Fail-safe by design and on by default** — any anomaly falls back to vanilla behavior.
- **Haste gem socket gating** — cooldown-reduction gems can only be socketed into weapons / helmets / gloves, matching their description (fixes "sockets anywhere, works anyway").
- **Multiplayer-safe** — enhancements activate only in single-player or when you host, so they never break multiplayer validation.

<blockquote>
The enhancement layer and the loot filter live in the same `d3d9.dll` proxy — one switch turns on the whole suite.
<cite>— one toggle, the full kit</cite>
</blockquote>

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅲ DXVK Graphics Compatibility

Torchlight II's aging D3D9 renderer **black-screens or instantly exits** on some modern drivers and GPUs. The launcher bundles **DXVK** (translates Direct3D 9 to Vulkan) and does two things for you:

- **Dual builds, auto-picked by driver.** Ships both DXVK **3.x (new)** and **2.7.1 (legacy)**; the launcher reads your GPU driver version and recommends one — recent NVIDIA drivers get "new", older ones fall back to "legacy".
- **Optional quality knobs.** 60 FPS cap, v-sync, ground texture sharpening (16× AF), FPS display, max frame latency, texture LOD bias — all with recommended values. The legacy build exposes just the frame cap and v-sync.
- **Downgrade guidance built in.** The dialog itself says: if "new" fails try "legacy"; if both fail, leave DXVK off.

<figure class="shot">
  <img src="/tools/mikuro-launcher/dxvk.png" alt="DXVK options dialog">
  <figcaption>fig.2 — DXVK options: NVIDIA RTX 3070 / driver 576.02 detected, auto-verdict "driver supports DXVK 3.x — DXVK (new) recommended".</figcaption>
</figure>

## Ⅳ Save Manager

The "**Saves**" tab turns the characters in `save\` and `modsave\` into cards, with a set of safe save tools:

- **Everything at a glance.** Each card shows character name, **level**, class (with gender), vanilla / mod badge, and **which mods the save uses** (attributed automatically).
- **Precise per-mod unbinding.** Want to drop a mod without junking the save? Tick the mods to unbind; **only when you unbind the mod that actually provides the class** are you asked to pick a vanilla replacement class — removing ordinary content mods leaves the class untouched. Results are written back to `modsave\` with an automatic `.bak` backup.
- **Double-click to select the save's mods.** Double-click any save card and the launcher **ticks that save's recorded mods in their original order** and jumps back to the loading tab — no more guessing what you had installed.

<figure class="shot">
  <img src="/tools/mikuro-launcher/saves.png" alt="Save manager tab">
  <figcaption>fig.3 — Save cards: level, class, mod attribution list, "Unbind mods"; double-click a card to select all of its mods at once.</figcaption>
</figure>

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅴ Multiplayer: MIKURO Afdian Servers

The official lobby server is up and down these days, so MIKURO runs **dedicated multiplayer servers for Afdian supporters**. Tick "**MIKURO Afdian Server**" and the launcher writes the lobby address (`LOBBYHOST`) into the game settings before starting — then just pick "Internet" in-game. **No config files to edit by hand**:

- **Chinese UI → Guangzhou** server, **other languages → Australia** server, chosen automatically by interface language.
- The address is written on every launch, which **defeats Steam Cloud's habit of reverting settings at startup** and un-doing your lobby address.

## Ⅵ Quality of Life

- **Environment self-check on launch.** Every start checks **OS / mod folder / VC++ runtime** and only pops up when something's wrong (all-green stays silent); "don't auto-check again" is available, and the top-bar "Environment Check" runs it on demand.
- **Misplaced-mod detection.** The check scans the usual wrong spots (game install dir, settings root, double-nested folders) and tells you where stray `.MOD` files should go.
- **VC++ runtime detection.** The game needs **VC++ 2008 x86**; without it you get "msvcp90.dll not found" and no game — the self-check calls it out and tells you to install it.
- **Overlay conflict warning.** The loot filter and DXVK both hook D3D9; overlay / recording tools fighting for the same hook can stop the game from starting — the launcher warns you to close them.
- **Auto-update.** Checks for new versions online and shows a banner up top.

<figure class="shot">
  <img src="/tools/mikuro-launcher/diag.png" alt="Environment check">
  <figcaption>fig.4 — Environment check: OS / mod folder / VC++ runtime each marked ✓ / ⚠ / ✕ — environment readiness at a glance.</figcaption>
</figure>

## Requirements

- **Windows 10 / 11 only.** The launcher is .NET-based and **does not support Windows 7 / 8** (it fails right at startup).
- Requires the **VC++ 2008 x86 runtime** (a dependency of the game itself; the self-check will remind you).
- DXVK 3.x needs a reasonably recent GPU driver; on older drivers switch to "legacy" in the DXVK options.

## Download & Updates

The launcher ships with the **Challenger Continent mod pack**; version history lives in the [Mikuro Launcher changelog](/changelog/mikuro-launcher-changelog/) (Chinese).
