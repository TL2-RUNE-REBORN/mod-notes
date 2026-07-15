---
title: "Azure Lotus · Haste Spirit Stone"
date: 2026-07-14T12:05:00+08:00
params:
  status: forge
  summary: "A skill-cooldown spirit-stone system rooted in Azure Lotus Chalcedony and evolved through three forgings — complete design draft; numbers and rules open for debate, critique welcome."
---

> 📜 **Design Draft v1** · Numbers and rules open for debate · Critique welcome — this article is the complete content; you can also [view the original design draft with full layout (Chinese)](/design/qinglian-lingshi/).

Farm for jade, forge it into spirit. Nine refinements, nine forgings — ride time like the wind. A skill-cooldown spirit-stone system rooted in **Azure Lotus Chalcedony**, evolving through three tiers.

## I · Raw Material: Azure Lotus Chalcedony

Where everything starts. A mellow piece of jade occasionally found on monsters — the sole base material for forging spirit stones.

> *A mellow jade suffused with spiritual resonance; an alchemist can forge nine of them into a Haste Spirit Stone.*

- **Acquisition**: drops from monster kills at a rate of roughly **5.7%** (tunable)
- **Use**: the sole material for the **First Forge** — forging 9 yields one Spirit Gathering stone
- **Misc**: stacks to 99, can be sold, can be discarded

## II · The Path of Advancement

Chalcedony is the root; three refinements form the tiers. Every forging is a gamble — the values are random, and the higher you climb, the harder they are to come by.

**Azure Lotus Chalcedony** (base material · monster drop)
→ First Forge 9 × Chalcedony → **Spirit Gathering** (entry tier · 1%–5%)
→ Re-Forge 9 × Spirit Gathering → **Sublimation** (high tier · 6%–11%)
→ Apex Forge 9 × Sublimation → **Taixu** (apex tier · 15% + 150% dmg)

## III · The Three Stone Tiers

Within a tier the stones form a fixed family of values; the randomness lies in **which one you draw**. Low tiers are common, high tiers rare.

### Azure Lotus · Spirit Gathering (entry tier · 1%–5% cooldown reduction)

> *The azure lotus first blooms, gathering the spirit of heaven and earth into stone. The mind grows clear, and the gap between strikes begins to narrow.*

- **Effect**: socketed into equipment, **reduces skill cooldowns by 1%–5%**
- **Acquisition**: **First Forge** 9 × Azure Lotus Chalcedony → randomly yields one grade

| Grade | 1% | 2% | 3% | 4% | 5% |
|---|---|---|---|---|---|
| Probability | 40.0% | 28.0% | 18.0% | 10.0% | 4.0% |

### Azure Lotus · Sublimation (high tier · 6%–11% cooldown reduction)

> *Spirit tempered into radiance, essence condensed and unscattered. In the span of a thought, one's strength already surges back like a spring.*

- **Effect**: socketed into equipment, **greatly reduces skill cooldowns by 6%–11%**
- **Acquisition**: **Re-Forge** 9 × any Spirit Gathering (any single grade from 1–5%) → randomly yields one grade

| Grade | 6% | 7% | 8% | 9% | 10% | 11% |
|---|---|---|---|---|---|---|
| Probability | 38.9% | 27.2% | 17.5% | 9.7% | 4.7% | 1.9% |

### Azure Lotus · Taixu (apex tier · 15% cooldown + all damage +150%)

> *The Way opens into the great void; bearer and stone become one, and intent alone is arrival. Condensed from nine blossoms of the azure lotus, scarcely ever seen in this world. Its momentum is wind and thunder, unhindered in every direction, overwhelming all rivals.*

- **Effect**: reduces skill cooldowns by **15%** and grants **+150% to all damage**
- **Acquisition**: **Apex Forge** 9 × Sublimation (11%) → fixed output, vanishingly rare

## IV · Forging Formulas

All forging happens at the alchemist. The first time you feed in the correct materials, the recipe is **learned and remembered**.

| Recipe | Input | Output | Random |
|---|---|---|---|
| First Forge | 9 × Azure Lotus Chalcedony | Azure Lotus · Spirit Gathering | 1–5% |
| Re-Forge | 9 × any Spirit Gathering | Azure Lotus · Sublimation | 6–11% |
| Apex Forge | 9 × Sublimation (11%) | Azure Lotus · Taixu | fixed 15% |

The **Re-Forge** has a separate recipe for each of 1% / 2% / 3% / 4% / 5% — whatever grade of Spirit Gathering you hold, gather 9 of the same grade and you can gamble once on a Sublimation. **Low-grade stones therefore never become dead weight; every one can go back into the furnace for another roll.**

## V · Socketing Rules

Haste Spirit Stones only accept four classes of gear slots, and each item carries its own cap — stacking sockets gets you nowhere; quality has to win.

| Slot | Two-handed weapon | One-handed weapon | Helmet | Gloves | Shield |
|---|---|---|---|---|---|
| Cap | **4** stones | **2** stones | **2** stones | **2** stones | **2** stones |

**The three loadout archetypes all total 8 sockets**: two-hander (4) + helmet (2) + gloves (2) = one-hand + shield (2+2) + helmet (2) + gloves (2) = dual wield (2+2) + helmet (2) + gloves (2). Nobody gets shortchanged. The stones can only be socketed into the slots above; on any other slot they neither light up nor can they be placed.

## VI · How the Cooldown Is Calculated

Multiplicative stacking — every extra stone brings diminishing marginal returns; there is no hard cap, yet even a full loadout converges naturally into a healthy range.

> Actual cooldown = base cooldown × **∏ (1 − each stone's % ÷ 100)**
>
> e.g. socketing 3 × 5% → base cooldown × 0.95 × 0.95 × 0.95 = 0.857 → a 14.3% reduction

| Setup | Product | Effective CDR | Notes |
|---|---|---|---|
| 3 × Spirit Gathering (5%) | 1 − 0.95³ | 14.3% | early-game start |
| 5 × Sublimation (8%) | 1 − 0.92⁵ | 34.1% | mid-game growth |
| 8 × Sublimation (11%) | 1 − 0.89⁸ | 60.6% | practical endgame (all sockets, top grade) |
| 8 × Taixu (15%) | 1 − 0.85⁸ | 72.7% | theoretical limit (all but unreachable) |

A full set of 8 top-grade Sublimation stones reaches the **≈60%** "practical endgame line"; the all-Taixu **72.7%** demands an astronomical grind — a trophy for perfectionists, not an efficiency play. Multiplicative stacking guarantees that **the more you stack, the worse the deal**, so the socket count caps itself naturally.

---

**Progress**: the design draft is settled; the two hard engine-side problems — the percentage cooldown multiplier and the socket-slot gate — have both been cracked with runtime patches and verified in-game. What remains is the content side: the stone DAT files, the forging recipes, and wiring up the drops. Numbers / drop rates / recipes are all tunable — feedback wanted.
