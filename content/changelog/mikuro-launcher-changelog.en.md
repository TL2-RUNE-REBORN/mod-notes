---
title: "Mikuro Launcher Changelog"
date: 2026-07-12T14:05:17+10:00
author: "Mikuro"
summary: "Version change history of the Mikuro Launcher (including MIKURO Game Enhancement)."
---


## What's Inside "MIKURO Game Enhancement"

> Permanently pinned. In-game item descriptions are deliberately kept short — this section is the authoritative reference for full mechanics and acquisition.

Besides the loot filter and save fixes, enabling "MIKURO Game Enhancement" in the launcher also auto-mounts a companion content MOD that adds the following in-game content.

### Socket rows 5 → 10

Item tooltips can now display up to 10 sockets. The vanilla UI only drew 5 rows — the engine itself has no 5-socket cap; items with 5 or fewer sockets are completely unaffected.

### Azure Lotus gems · Cooldown line (haste gems)

Only four slot types accept them — <mark>weapon / helmet / gloves / shield</mark> — and each item counts at most **2 gems** (two-handed weapons **4**). Stacking sockets is useless; quality beats quantity.

| Gem | CD reduction | How to get |
|---|---|---|
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 青莲·聚灵 (Spirit Gathering) | 1% – 5% | Transmute 9× 青莲玉髓 (Jade Marrow); random 1–5%, higher rolls are rarer |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 青莲·凝华 (Condensed Essence) | 6% – 11% | Transmute 9× same-value 聚灵; random 6–11%, higher rolls are rarer |
| <img class="gem-px" src="/img/gems/taixu.png" alt=""> 青莲·太虚 (Great Void) | 15%, plus all damage +50% | Transmute 9× 11% 凝华 (fixed result) |

- Upgrade chain: **<img class="gem-px" src="/img/gems/jade.png" alt=""> 9× Jade Marrow → 聚灵 (random 1–5%) → 9× same tier → 凝华 (random 6–11%) → 9× 11% 凝华 → 太虚**; low rolls never become junk — any 9 same-tier 聚灵 can be re-melted for another gamble
- Jade Marrow drops randomly from monsters (stackable); transmute at the alchemist — the recipe is learned automatically the first time you insert the right materials
- Multiple gems stack multiplicatively: actual cooldown = base × ∏(1 − gem% ÷ 100). Example: three 5% gems → base × 0.95 × 0.95 × 0.95 ≈ 0.857, about **−14.3%** total (not an additive −15%)

### Azure Lotus gems · Cap-break & specials

> **The four cap-break gems now do double duty — stat + cap:** each grants +X% of the stat *and* raises its cap by the same +X% (the "Per gem" column below is that shared value; stat and cap rise together), so the raised cap exactly holds the stat — effective the moment you socket it, no need to first stack up to the vanilla cap.

| Gem | Effect | Per gem | Cap | Slots |
|---|---|---|---|---|
| <img class="gem-px" src="/img/gems/jingang.png" alt=""> 青莲·金刚 (Vajra) | Damage reduction + reduction cap break (vanilla 75%) | +2.5% | 95% (8 gems) | any |
| <img class="gem-px" src="/img/gems/fengying.png" alt=""> 青莲·风影 (Wind Shadow) | Dodge chance + dodge cap break (vanilla 75%) | +2.5% | 95% (8 gems) | any |
| <img class="gem-px" src="/img/gems/xuanwu.png" alt=""> 青莲·玄武 (Black Tortoise) | Block chance + block cap break (vanilla 75%) | +2.5% | 85% (4 gems) | <mark>weapon / helmet / gloves / shield</mark> |
| <img class="gem-px" src="/img/gems/liehun.png" alt=""> 青莲·裂魂 (Soulrend) | Critical damage + crit-damage cap break (vanilla 500%) | +25% | uncapped | any |
| <img class="gem-px" src="/img/gems/shixue.png" alt=""> 青莲·嗜血 (Bloodthirst) | On crit, leech damage as life | 2.5% | — | any |

### Beast Taunt

| Item | Description |
|---|---|
| <img class="gem-px" src="/img/gems/xiangquan.png" alt=""> 青莲·御兽嘲讽项圈 (Beast Taunt Collar) | Pet collar equipment; your pet must wear it to respond to the taunt command |
| <img class="gem-px" src="/img/gems/modian.png" alt=""> 魔典:御兽·嘲讽令 (Tome: Beast Taunt Command) | Use to learn an active skill: enemies within 10m switch to attacking your pet for 4 seconds |

> Drop channels for the cap-break gems and the Beast Taunt pair are still being tuned — actual in-game drops are authoritative. Per-tier transmute odds and design rationale: see the [full design draft](/en/ideas/qinglian-haste-lingshi/).

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
