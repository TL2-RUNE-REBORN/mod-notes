---
title: "Upcoming"
date: 2026-07-17T21:13:44+10:00
author: "Mikuro"
summary: "On the way: the Qinglian Lingshi system, WASD movement, the MIKURO Afdian server, and a fix for the mercenary shield breaking."
---

> **Preview** · None of this has shipped yet — numbers and details may still change. Feedback welcome before release.

## The Qinglian Lingshi system

Farm the jade, forge the stone. A whole family of gems rooted in **Qinglian Jade Marrow** — a three-forge **skill-cooldown** main line, plus a set of stones built to pry open the engine's hard caps.

### The full table

> The four cap-break stones are dual-effect — stat + cap: each grants +X% of the stat *and* raises its cap by the same +X% (the "Per stone" column below is that shared value; stat and cap rise together), effective the moment you socket it.

| Lingshi | Effect | Per stone | Vanilla cap | New cap | Stones to cap | Slots |
|---|---|---|---|---|---|---|
| **Gathered Spirit / Condensed Essence / Great Void** | Skill cooldown | 1%–11% ／ 15% | — | — | 2 per item (4 on two-handers) | Weapon / helmet / gloves / shield |
| **Qinglian · Vajra** | Damage reduction + reduction cap | +2.5% | 75% | **95%** | 8 | Any |
| **Qinglian · Windshade** | Dodge chance + dodge cap | +2.5% | 75% | **95%** | 8 | Any |
| **Qinglian · Xuanwu** | Block chance + block cap | +2.5% | 75% | **85%** | **4** | Weapon / helmet / gloves / shield |
| **Qinglian · Soulrend** | Critical damage + crit-damage cap | +25% | 500% | **uncapped** | ∞ | Any |
| **Qinglian · Bloodthirst** | Crit lifesteal | 2.5% | — | — | ∞ | Any |
| **Qinglian · Beast-Taunt Collar** | Pet pulls aggro, 10m ／ 4s | — | — | — | — | Pet |

Plus two affix-less material/utility items: **Qinglian Jade Marrow** (the forging root) and the **Grimoire: Beast · Taunt Writ**.

### Why block caps at 85% when dodge reaches 95%

This isn't an arbitrary number. Reverse engineering settled it: **dodge only avoids melee weapon attacks**, while **block also stops skill/spell projectiles, non-weapon AoE, damage over time and reflect** — at the cost of requiring a shield. Block covers far more than dodge, so its ceiling sits lower (85% vs 95%) and it **caps out at just 4 stones** — the sockets you save go into something else, instead of grinding all the way to invulnerable.

### From Jade Marrow to Great Void

**Qinglian Jade Marrow** is where it all starts: a warm jade occasionally dropped by monsters, at roughly a **5.7%** drop rate, stacking to 99 — and the only raw material for forging. Three forges take it upward, and every forge is a gamble: within a tier the value is random, and the higher you go, the rarer it gets.

| Forge | Input | Output | Value |
|---|---|---|---|
| **First Forge** | 9 × Jade Marrow | **Qinglian · Gathered Spirit** | 1%–5% cooldown reduction |
| **Reforge** | 9 × same-tier Gathered Spirit | **Qinglian · Condensed Essence** | 6%–11% cooldown reduction |
| **Apex Forge** | 9 × Condensed Essence (11%) | **Qinglian · Great Void** | 15% cooldown, **+50% all damage** |

Tier probabilities:

- **Gathered Spirit** — 1%: 40.0% ｜ 2%: 28.0% ｜ 3%: 18.0% ｜ 4%: 10.0% ｜ 5%: 4.0%
- **Condensed Essence** — 6%: 38.9% ｜ 7%: 27.2% ｜ 8%: 17.5% ｜ 9%: 9.7% ｜ 10%: 4.7% ｜ 11%: 1.9%

"Reforge" has a separate recipe for each of 1% / 2% / 3% / 4% / 5% — collect 9 of any single tier and you can gamble for a Condensed Essence. **Low-tier stones therefore never become worthless; they can all go back into the furnace.**

All forging happens at the Enchanter, and feeding in the correct materials the first time "learns and remembers" the recipe.

### Socketing rules for the haste stones: only four slot types

The cap stones (Vajra / Windshade / Soulrend / Bloodthirst) take any slot, and Xuanwu is limited to weapon/helmet/gloves/shield (the same four as the haste stones); the **haste stones** only accept weapons, helmets, gloves and shields, and each item has its own cap — **stacking sockets won't help; quality will**.

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

The hard bones on the engine side — the **percentage cooldown multiplier**, the **cap breaks**, and the **socket-slot gates** — have all been cracked with runtime patches and verified in game. What remains is content-side: the gem data, the forge recipes, and the drop wiring. Numbers / drop rates / recipes are all **adjustable** — opinions wanted → [full design draft](/en/ideas/qinglian-haste-lingshi/)

## WASD Movement

Giving a keyboard to an engine that has been click-to-move for fourteen years. **The minimal prototype is already running.**

The idea isn't to poke at coordinates, but to **speak the engine's own language**: every frame, read WASD, work out a **synthesized cursor point** just outside the character along the screen direction, and inject it into the one call that turns the cursor into a world ground point — for the *movement* path only — while holding left-click. The engine then does exactly what it always does: "hold left-click and walk toward that point." The benefits come free:

- **Pathfinding, collision, ground snapping, turning and walk animations** are all handled by the engine's own logic — nothing to reinvent;
- **Multiplayer-safe**: no coordinates are written; it rides the engine's own movement path, so it can't desync;
- **The real mouse never moves**: the injection is routed by call site, so skill aiming and the cursor icon still see the true cursor.

There were dead ends along the way: calling the pathfinding function directly, or driving movement via SetDestination — both **disproven** in testing (they compute a path but don't drive it) and abandoned.

The delivery vehicle is the existing **Mikuro Runtime** (cooldown reduction and loot filtering already run on it), and it now ships as a component of the **MIKURO X** suite. It remains an **experimental prototype** — the feel (key throttling, stop-on-release) is still being tuned. → [full write-up](/en/ideas/wasd-movement/)

## MIKURO Afdian Server

Beyond the official lobby, we stood up one of our own.

The launcher's **MIKURO X** options gain a **"MIKURO Afdian Server"** toggle: switch it on and you can pick an internet connection in game, matching into our hosted lobby — **Guangzhou for Chinese users, Australia for everyone else**.

## Mercenary shield break fix

The mercenary's supposedly unbreakable *Merc's Indestructible Shield* would, in practice, get broken — and its durability was on the low side, so before long it was effectively useless.

The root cause: the shield's **damaged state was being written into the save**. Once knocked down, it stayed permanently at the broken value and never came back. With persistence removed, the shield now re-applies at full value every time — back to what it was meant to be: **a truly unbreakable shield**.
