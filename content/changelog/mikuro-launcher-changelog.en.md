---
title: "Mikuro Launcher Changelog"
date: 2026-07-24T21:45:48+10:00
author: "Mikuro"
summary: "Version change history of the Mikuro Launcher (including MIKURO Game Enhancement)."
---


> The full in-game content mounted by "MIKURO X" (Azure Lotus gems, sockets 5→10, Beast Taunt) now has its own page in the Armory → **[MIKURO Runtime MOD](/en/tools/mikuro-runtime-mod/)**. This page tracks version changes only.

## 2026-07-24 (v1.1.9)
A larger feature update: the enhancement switches are consolidated into a "MIKURO X" master + ⚙ popup, with new save Respec tools and WASD movement, a parchment light theme, a no-shake toggle, a first-run notice, forced-update support, plus several fixes.

- ✨: New save "Respec" tool — every save card gets a "Respec" button: refund skill points per-skill or all at once (removes that skill's entries from the save's effect table and refunds by level), and optionally reset stats (four attributes back to 10/10/10/10, points refunded conservatively); saved in place with an automatic `.bak`. Fully quit the game before saving, or the autosave overwrites your changes
- ✨: Loot filter gains a "**keep-list**" (whitelist) — when filtering in bulk by rarity, gems (`SOCKETABLE`) and amulets (`AMULET`) are kept by default, so "block blue / green" no longer collaterally destroys runes / gems / amulets; add your own keep entries by type or name (keep-priority above a same-level blacklist); items rescued by the whitelist are flagged "Kept" in the filter panel
- ♻️: "MIKURO Game Enhancement" consolidated into a "MIKURO X" master switch + ⚙ options popup; three advanced toggles (Allow >10 mods / MIKURO Afdian Server / WASD movement) moved into the popup, all gated by the master switch
- ✨: New "Allow >10 mods" — tick it to load more than 10 mods at once; the launcher lifts the engine's 10-mod cap in memory at launch (the game exe file is never modified), then resumes
- ✨: New "WASD movement" — move with WASD instead of click-to-move; F6 toggles it in-game, `[` `]` adjust step size; if WASD is bound to skills, clear them in the game's key settings first
- ✨: New "No shake" toggle on the main bar — turns off camera shake (a vanilla option many new players can't find), written into the settings before launch
- ✨: Environment self-check gains a "First run" item — when the game profile (`settings.txt`) is missing it shows a gentle notice suggesting a mods-off first launch to generate the graphics profile. Optional, not required: by reverse-engineering and a live test, the game autodetects a safe profile when the config is missing, and a first modded launch usually autoconfigures fine
- ✨: Added **forced-update** support — when a version is marked mandatory, the game can't be launched until you update (the top banner can't be dismissed and the launch button is blocked with a prompt), keeping everyone on a consistent version to avoid multiplayer / save incompatibility
- 🐛: Fixed mods stuck showing a ⚠ (invalid) marker until restart — a file locked during pack deployment could fail to read and be flagged invalid; the list now re-reads on every refresh and self-heals once the read succeeds
- 🐛: Fixed an error when double-clicking a vanilla save card — it now clears the selected mods instead (equivalent to "Launch Vanilla")
- 🎨: Added a parchment light theme; the launcher was renamed to "Mikuro Launcher"

## 2026-07-14 (v1.1.7)
Adds an environment self-check that catches the three "can't get into the game" environment problems newcomers hit most.

- ✨: Environment self-check on launch — every start checks OS / mod folder / VC++ runtime, only pops up when something's wrong (all-green stays silent), with a "don't auto-check again" option; the top-bar "Environment Check" runs it on demand
- ✨: Misplaced-mod detection — scans the usual wrong spots (game install dir, settings root, double-nested `mods\mods\`) and tells you where stray `.MOD` files should go
- ✨: VC++ runtime detection — missing VC++ 2008 x86 (the game needs MSVCP90 / MSVCR90) yields "msvcp90.dll not found" and no game; the check names it and tells you to install it

## 2026-07-13 (v1.1.6)
Adds one-click access to the self-hosted multiplayer servers.

- ✨: New "MIKURO Afdian Server" toggle — the official lobby is flaky, so this writes the lobby address (`LOBBYHOST`) into the game settings pointing at MIKURO's own multiplayer servers (Chinese UI → Guangzhou / others → Australia, by interface language); written before every launch to defeat Steam Cloud reverting settings at startup

## 2026-07-12 (v1.1.5)
This release focuses on GPU compatibility (dual DXVK versions), consolidating the enhancement features into a single "MIKURO Game Enhancement" switch, and improving class-MOD detection for save unbinding.

- ✨: Dual DXVK versions (3.x / 2.7.1), auto-selected by GPU driver — compatible with more old and new GPUs, fewer black screens / instant exits
- ♻️: The old "Item Filter" switch renamed "MIKURO Game Enhancement" — a single switch that mounts the whole in-game enhancement layer (loot filter, save fixes, etc.); the save crash fixes (large-inventory saves, zone-transition crashes) are merged into it and enabled by default
- ♻️: Smarter save unbinding — class MODs are now identified precisely by the character's class name: regular content MODs are no longer misjudged as class MODs and no longer needlessly ask you to pick a vanilla class; the vanilla-class prompt only appears when actually unbinding a class MOD
- ✨: Tooltips pop up faster (250ms) and stay longer (30s), making them easier to read
- 🗑️: Hid the almost-never-used "download link" field for a cleaner UI

## 2026-07-03 (v1.1.4)
This release polishes "one-click save ↔ MOD linkage", automatic vanilla/MOD launch distinction, and the DXVK quality options; it also adds an overlay-conflict warning so software like GamePP no longer keeps the game from starting.

- ✨: Double-click a save card to auto-check the MODs in the order recorded in that save and jump to the MOD list (shows "automatic MOD selection failed" when a MOD is missing)
- ✨: With no MODs selected, the launch button becomes "Launch Vanilla" and enters vanilla saves (save\) directly, no longer mistakenly using MOD saves (modsave\)
- ✨: Save cards now show the character level
- ✨: Added a hint bar at the bottom noting that double-clicking a save card quickly selects MODs
- ✨: On launch, a warning now advises against stacking GamePP, MSI Afterburner / RTSS, Discord / Steam overlays, GeForce Experience, and similar software — they compete with the loot filter / DXVK for the same D3D9 hooks and can cause startup failures, black screens, or instant exits (a "don't remind me again" checkbox is available; the reminder returns after a launcher update)
- ♻️: "Precise per-MOD unbinding" now supports multi-select, unbinding several chosen MODs at once; unbound saves are still written back to modsave\ (with a .SVB.bak backup)
- ♻️: The save card's "with MODs" label shortened to "MOD"
- ✨: DXVK options gained "Show FPS", "Max Frame Latency", and "Texture Sharpness" (recommended values: Max Frame Latency 1 / Texture Sharpness -0.5)
- 🎨: The DXVK options popup now opens above the button; the dropdowns were widened to avoid text truncation; the gear icon replaced with a more intuitive slider icon
- 💬: Simplified the "Ground Texture Clarity (16x AF)" wording for easier understanding

### Notes
- The double-click auto-selection is based on the MOD list and load order recorded in the save; if any of those MODs is not currently installed, the whole operation is treated as failed and a prompt is shown.
- The overlay warning only appears when "loot filter" or "DXVK" is enabled (only these two hook D3D9). If you want an on-screen FPS counter, use "Show FPS" in the launcher's DXVK options instead.
