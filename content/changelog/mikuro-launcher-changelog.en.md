---
title: "Mikuro Launcher Changelog"
date: 2026-07-12T14:05:17+10:00
author: "Mikuro"
summary: "Version change history of the Mikuro Launcher (including MIKURO Game Enhancement)."
---


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
