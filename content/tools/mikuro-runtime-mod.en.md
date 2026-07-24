---
title: "MIKURO Runtime MOD"
date: 2026-07-23T21:07:44+10:00
author: "Mikuro"
summary: "The companion content MOD auto-mounted by the launcher's \"MIKURO Game Enhancement\": Azure Lotus gems (cooldown line / dual-effect cap breaks), sockets 5→10, and Beast Taunt — full mechanics and acquisition."
weight: 2
params:
  rarity: "legendary"
  icon: "gem"
  typeline: "Legendary · Runtime content MOD · Azure Lotus gem system"
  affixes:
    - "Azure Lotus gems: three-tier cooldown line (Gathered Spirit / Condensed Essence / Great Void) + four dual-effect (stat + cap) cap-break stones + Bloodthirst"
    - "Socket tooltip rows 5 → 10 (engine has no 5-socket cap; items with ≤5 sockets unaffected)"
    - "Beast Taunt: collar + command tome, pet pulls 10m aggro for 4 seconds"
    - "In-game item text is deliberately short — this page is the authoritative reference"
  flavor: "Farm the jade, forge the spirit."
  status: "Always on with Game Enhancement"
  metaline: "runtime-mounted · single-player / host"
---

## Overview · 简介

**MIKURO Runtime MOD** is the companion content MOD auto-mounted by the [Mikuro launcher](/en/tools/mikuro-launcher/)'s "**MIKURO Game Enhancement**" switch. Beyond runtime features like the loot filter and save fixes, it adds a whole Azure Lotus gem system, extended socket display, and Beast Taunt to the game. In-game item descriptions are deliberately kept short — **this page is the authoritative reference for full mechanics and acquisition**.

## Ⅰ Sockets 5 → 10 · 镶嵌孔

Item tooltips can display up to **10 sockets**. The vanilla UI only drew 5 rows — the engine itself has no 5-socket cap; items with 5 or fewer sockets are completely unaffected.

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅱ Azure Lotus gems · Cooldown line (haste) · 冷却系

Only four slot types accept them — <mark>weapon / helmet / gloves / shield</mark> — and each item counts at most **2 gems** (two-handed weapons **4**). Stacking sockets is useless; quality beats quantity.

| Gem | CD reduction | How to get |
|---|---|---|
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 青莲·聚灵 (Spirit Gathering) | 1% – 5% | Transmute 9× 青莲玉髓 (Jade Marrow); random 1–5%, higher rolls are rarer |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 青莲·凝华 (Condensed Essence) | 6% – 11% | Transmute 9× same-value 聚灵; random 6–11%, higher rolls are rarer |
| <img class="gem-px" src="/img/gems/taixu.png" alt=""> 青莲·太虚 (Great Void) | 15%, plus all damage +50% | Transmute 9× 11% 凝华 (fixed result) |

- Upgrade chain: **<img class="gem-px" src="/img/gems/jade.png" alt=""> 9× Jade Marrow → 聚灵 (random 1–5%) → 9× same tier → 凝华 (random 6–11%) → 9× 11% 凝华 → 太虚**; low rolls never become junk — any 9 same-tier 聚灵 can be re-melted for another gamble
- Jade Marrow drops randomly from monsters (stackable); transmute at the alchemist — the recipe is learned automatically the first time you insert the right materials
- Multiple gems stack multiplicatively: actual cooldown = base × ∏(1 − gem% ÷ 100). Example: three 5% gems → base × 0.95 × 0.95 × 0.95 ≈ 0.857, about **−14.3%** total (not an additive −15%)

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅲ Azure Lotus gems · Cap-break & specials · 上限突破

> **The four cap-break gems now do double duty — stat + cap:** each grants +X% of the stat *and* raises its cap by the same +X% (the "Per gem" column below is that shared value; stat and cap rise together), so the raised cap exactly holds the stat — effective the moment you socket it, no need to first stack up to the vanilla cap.

| Gem | Effect | Per gem | Cap | Slots |
|---|---|---|---|---|
| <img class="gem-px" src="/img/gems/jingang.png" alt=""> 青莲·金刚 (Vajra) | Damage reduction + reduction cap break (vanilla 75%) | +2.5% | 95% (8 gems) | any |
| <img class="gem-px" src="/img/gems/fengying.png" alt=""> 青莲·风影 (Wind Shadow) | Dodge chance + dodge cap break (vanilla 75%) | +2.5% | 95% (8 gems) | any |
| <img class="gem-px" src="/img/gems/xuanwu.png" alt=""> 青莲·玄武 (Black Tortoise) | Block chance + block cap break (vanilla 75%) | +2.5% | 85% (4 gems) | <mark>weapon / helmet / gloves / shield</mark> |
| <img class="gem-px" src="/img/gems/liehun.png" alt=""> 青莲·裂魂 (Soulrend) | Critical damage + crit-damage cap break (vanilla 500%) | +25% | uncapped | any |
| <img class="gem-px" src="/img/gems/shixue.png" alt=""> 青莲·嗜血 (Bloodthirst) | On crit, leech damage as life | 2.5% | — | any |

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅳ Beast Taunt · 御兽嘲讽

| Item | Description |
|---|---|
| <img class="gem-px" src="/img/gems/xiangquan.png" alt=""> 青莲·御兽嘲讽项圈 (Beast Taunt Collar) | Pet collar equipment; your pet must wear it to respond to the taunt command |
| <img class="gem-px" src="/img/gems/modian.png" alt=""> 魔典:御兽·嘲讽令 (Tome: Beast Taunt Command) | Use to learn an active skill: enemies within 10m switch to attacking your pet for 4 seconds |

> Drop channels for the Beast Taunt pair are still being tuned — actual in-game drops are authoritative. Per-tier transmute odds and design rationale for the Azure Lotus gems: see the [full design draft](/en/ideas/qinglian-haste-lingshi/).

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅴ Drops · 材料掉落

The root materials shared by both forging lines all drop from monsters (stackable), and drop rates are **tiered by monster rank** — Jade Marrow floods off normal mobs, Ash rises as monsters get tougher, and Talismans appear only on champions and bosses. The tougher the kill, the more it feeds the cap-break line.

| Material | Line | Normal | Half-champ | Champion | BOSS |
|---|---|:-:|:-:|:-:|:-:|
| <img class="gem-px" src="/img/gems/jade.png" alt=""> 青莲玉髓 (Jade Marrow) | Cooldown · root | **5.5%** | — | — | — |
| <img class="gem-px" src="/img/gems/jiehui.png" alt=""> 青莲·劫灰 (Ash) | Cap-break · universal root | 1.4% | 3% | 6% | **17%** |
| 五系符 · Talismans (directional) | Cap-break · catalyst | — | 1% | 3% | **8%** |

- **Jade Marrow** drops from normal mobs only — plentiful, and the sole source for the cooldown line (聚灵 / 凝华 / 太虚).
- **Ash** drops at every rank, more as monsters get tougher; a BOSS always yields exactly 1.
- **Talismans are a random pool**: when a champion / BOSS drops a talisman it rolls one of the five below at random, so a **specific** talisman's real rate ≈ the table value ÷ 5 (e.g. a given talisman off a BOSS ≈ 1.6%). Champions and bosses are the only source.

Each talisman maps to one cap-break stone:

| <img class="gem-px" src="/img/gems/fu_jingang.png" alt=""> 金刚符 | <img class="gem-px" src="/img/gems/fu_xuanwu.png" alt=""> 玄武符 | <img class="gem-px" src="/img/gems/fu_fengying.png" alt=""> 风影符 | <img class="gem-px" src="/img/gems/fu_liehun.png" alt=""> 裂魂符 | <img class="gem-px" src="/img/gems/fu_shixue.png" alt=""> 嗜血符 |
|:-:|:-:|:-:|:-:|:-:|
| → 青莲·金刚 (Vajra) | → 青莲·玄武 (Tortoise) | → 青莲·风影 (Wind Shadow) | → 青莲·裂魂 (Soulrend) | → 青莲·嗜血 (Bloodthirst) |

**Forging**: 9× Ash + 1× the matching talisman at the alchemist yields that stone (the recipe is auto-learned on the first correct insert).

> **Balanced across both lines**: one 凝华 ≈ 81 Jade Marrow (~a thousand-odd normal mobs); one cap-break stone ≈ 9 Ash + 1 talisman (~a hundred-odd champions) — the two lines mirror each other mid-game, and their ceilings (太虚 / maxing one stat at 4–8 stones) are both lifetime goals.

## Download · 获取

Distributed with the **Challenger Continent bundle**; auto-mounted the moment you enable "MIKURO Game Enhancement" in the [Mikuro launcher](/en/tools/mikuro-launcher/). Version history: [Mikuro launcher changelog](/en/changelog/mikuro-launcher-changelog/).
