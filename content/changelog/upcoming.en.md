---
title: "Upcoming"
date: 2026-07-17T21:13:44+10:00
author: "Mikuro"
summary: "On the way: the Qinglian Haste Lingshi system, WASD movement, and a fix for the mercenary shield breaking."
---

> 🔮 **Preview** · None of this has shipped yet — numbers and details may still change. Feedback welcome before release.

## Qinglian Haste Lingshi

Farm the jade, forge the stone. A **skill-cooldown** gem system rooted in **Qinglian Jade Marrow** and evolving through three forges — the headline feature of the next version.

### From Jade Marrow to Great Void

**Qinglian Jade Marrow** is where it all starts: a warm jade occasionally dropped by monsters, at roughly a **5.7%** drop rate, stacking to 99 — and the only raw material for forging. Three forges take it upward, and every forge is a gamble: within a tier the value is random, and the higher you go, the rarer it gets.

| Forge | Input | Output | Value |
|---|---|---|---|
| **First Forge** | 9 × Jade Marrow | **Qinglian · Gathered Spirit** | 1%–5% cooldown reduction |
| **Reforge** | 9 × same-tier Gathered Spirit | **Qinglian · Condensed Essence** | 6%–11% cooldown reduction |
| **Apex Forge** | 9 × Condensed Essence (11%) | **Qinglian · Great Void** | 15% cooldown, **+150% all damage** |

Tier probabilities:

- **Gathered Spirit** — 1%: 40.0% ｜ 2%: 28.0% ｜ 3%: 18.0% ｜ 4%: 10.0% ｜ 5%: 4.0%
- **Condensed Essence** — 6%: 38.9% ｜ 7%: 27.2% ｜ 8%: 17.5% ｜ 9%: 9.7% ｜ 10%: 4.7% ｜ 11%: 1.9%

"Reforge" has a separate recipe for each of 1% / 2% / 3% / 4% / 5% — collect 9 of any single tier and you can gamble for a Condensed Essence. **Low-tier stones therefore never become worthless; they can all go back into the furnace.**

All forging happens at the Enchanter, and feeding in the correct materials the first time "learns and remembers" the recipe.

### Socketing rules: only four slot types

Haste Lingshi only accept weapons, helmets, gloves and shields, and each item has its own cap — **stacking sockets won't help; quality will**.

| Slot | Two-hand weapon | One-hand weapon | Helmet | Gloves | Shield |
|---|---|---|---|---|---|
| Cap | **4** | **2** | **2** | **2** | **2** |

All three builds land on **8 total sockets** — nobody loses out:

- Two-hander (4) + helmet (2) + gloves (2) = **8**
- One-hand + shield (2+2) + helmet (2) + gloves (2) = **8**
- Dual-wield (2+2) + helmet (2) + gloves (2) = **8**

Any other slot won't highlight, and won't accept the stone.

### How cooldown is computed: multiplicative

> Actual cooldown ＝ base cooldown × ∏ ( 1 − each stone% ÷ 100 )
>
> e.g. three 5% stones → base × 0.95 × 0.95 × 0.95 ＝ 0.857 → a **14.3%** reduction

Each additional stone gives less; there is no hard cap, yet a full build still settles into a healthy range:

| Setup | Actual CD reduction | Notes |
|---|---|---|
| 3 × Gathered Spirit (5%) | 14.3% | early game |
| 5 × Condensed Essence (8%) | 34.1% | mid game |
| 8 × Condensed Essence (11%) | **60.6%** | practical endgame (all slots, top tier) |
| 8 × Great Void (15%) | 72.7% | theoretical ceiling (all but unreachable) |

Eight top-tier Condensed Essences reach the **≈60%** "practical graduation line"; the all-Great-Void 72.7% demands astronomical grinding — a flex for completionists, not an efficient goal. Multiplicative stacking guarantees diminishing returns, so sockets cap themselves naturally.

### Progress

The two hard bones on the engine side — the **percentage cooldown multiplier** and the **socket-slot gate** — have both been cracked with runtime patches and verified in game. What remains is content-side: the gem data, the forge recipes, and the drop wiring. Numbers / drop rates / recipes are all **adjustable** — opinions wanted → [full design draft](/en/ideas/qinglian-haste-lingshi/)

## WASD Movement

Giving a keyboard to an engine that has been click-to-move for fourteen years.

The idea isn't to poke at coordinates, but to **speak the engine's own language**: every frame, combine the pressed direction keys (with the camera facing) into a nearby target point and issue the engine a "move to point" order. Going through the native order path, the benefits are free —

- **Pathfinding, collision, ground snapping, turning and walk animations** are all handled by the engine's own logic — nothing to reinvent;
- **Multiplayer-safe**: move orders are exactly what already gets network-synced, whereas rewriting coordinates directly is guaranteed to desync.

Both key engine anchors (how to get the local player, and where to issue the "move to point" order) are verified by reverse engineering in IDA. The delivery vehicle is the existing **Mikuro Runtime** (cooldown reduction and loot filtering already run on it); WASD joins as a new component.

What's left is all about feel: whether continuous orders produce a smooth walk animation, key throttling and stop-on-release, and calibrating the synthesis of camera facing and input direction — all to be settled by in-game testing. → [full write-up](/en/ideas/wasd-movement/)

## Mercenary shield break fix

The mercenary's supposedly unbreakable *Merc's Indestructible Shield* would, in practice, get broken — and its durability was on the low side, so before long it was effectively useless.

The root cause: the shield's **damaged state was being written into the save**. Once knocked down, it stayed permanently at the broken value and never came back. With persistence removed, the shield now re-applies at full value every time — back to what it was meant to be: **a truly unbreakable shield**.
