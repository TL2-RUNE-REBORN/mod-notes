---
title: "Moonlight Blade Progression Systems: A Research Report"
date: 2026-07-14T12:04:00+08:00
params:
  status: hatch
  summary: "Taking apart Moonlight Blade's entire progression stack — Longzhu, Tianxinzhu, Langwen, Bianshi, Jingmai — to scout the road for the remaster's equipment and progression systems."
---

**Purpose**: reference material for designing the equipment and progression systems of the Torchlight II remaster
**Scope**: equipment design / equipment enhancement / Longzhu (skill-forging enchant) · Tianxinzhu (controllable random enchant) · Langwen (inlay & resonance) / Bianshi (shaped gems) / Jingmai (meridian network) / the attribute system
**Notes**: the PC and mobile clients of Moonlight Blade differ in some systems; this report is based primarily on the PC client with the mobile client as a supplement, and differences are flagged where they occur. The "Porting takeaways" at the end of each section are concrete suggestions aimed at Torchlight II (a Diablo-like ARPG).

---

## Table of Contents

1. [Overall Design Philosophy](#1-overall-design-philosophy)
2. [Equipment Design](#2-equipment-design)
3. [Equipment Enhancement Systems Overview](#3-equipment-enhancement-systems-overview)
4. [Longzhu — Skill-Forging Affixes](#4-longzhu--skill-forging-affixes)
5. [Tianxinzhu — Controllable Random Enchanting](#5-tianxinzhu--controllable-random-enchanting)
6. [Langwen — Inlay and Resonance Combos](#6-langwen--inlay-and-resonance-combos)
7. [Bianshi — Shaped Gem System](#7-bianshi--shaped-gem-system)
8. [Jingmai — Node-Based Growth Network](#8-jingmai--node-based-growth-network)
9. [The Attribute System — Converting Base Attributes into Combat Attributes](#9-the-attribute-system)
10. [Porting Summary for Torchlight II](#10-porting-summary-for-torchlight-ii)

---

## 1. Overall Design Philosophy

At heart, Moonlight Blade's progression is **"multiple parallel progression tracks + one unified Gongli (power rating) metric"**. Equipment grade, Jinggong (refinement), Zhuomo (polish), affixes, Longzhu, Tianxinzhu, Langwen, Bianshi, Jingmai, inner arts... each track grows on its own, and everything rolls up into the character's total Gongli.

The sources from which players raise their Gongli are staggeringly sprawling; the lists compiled by the developers and the player community alone include: inner arts, Jingmai, guild skills, calligraphy and painting, Bianshi, gold-grade gear, grinding (Jinggong), carving (Zhuomo), affixes, inner-art collection, inner-art secluded training, travels and lore, trials, map exploration, hidden attribute points, plus late-game Longzhu and sect-treasure weapons.

Three foundational principles run through the whole design, and they are **strongly recommended as the basis of the progression architecture in the Torchlight II remaster**:

1. **No destructive failure**: almost every enhancement (Jinggong, Zhuomo, Tianxinzhu, Longzhu) can never damage or downgrade an item on failure; the frustration is shifted onto **resource grind** and **random convergence** instead.
2. **Progression bound to the slot, not the item** (a newer rework): Longzhu, Tianxinzhu, and Langwen were all later detached from the item itself onto the equipment slot, so progression is no longer lost when swapping gear.
3. **An independent material track per line**: every system has its own dedicated currency/materials that never compete with each other, letting players push each track at their own pace.

---

## 2. Equipment Design

### 2.1 Grade Tiers

Equipment comes in four grades — **white, blue, purple, gold** (PC client) — with **orange (sect-treasure weapons)** as the top rarity. At equal level and slot, a higher grade grants more Gongli.

- Every sect-treasure weapon has its own backstory; crafting one requires collecting a rare drop item (Meteor Flame Stone), and repairs consume a dedicated material (Meteor Iron Stone, each restoring 40 durability).
- The mobile client's quality sequence is green → blue → purple → orange, and each piece carries sect, wear-level, and slot restrictions.

### 2.2 Slot Layout (12 classes on the PC client)

Main weapon, off-hand weapon, hidden weapon, ring ×2, bracelet, necklace, headpiece, top, belt, wristguards, lining, leggings.

**Key design — attack attributes classified by martial-art type**:

| Category | Slots |
|---|---|
| Internal-attack class | Main weapon, off-hand weapon, hidden weapon, bracelet |
| External-attack class | Rings, necklace |
| Defense class | Headpiece, top, belt, wristguards, lining, leggings |

Different sects pick gear by their internal/external leaning, so attribute demand diverges naturally.

### 2.3 Crafting / Random Attributes (the commission system)

Players can commission a high-crafting-level player at a market stall to craft equipment on their behalf:

- The higher the crafter's crafting level, the better the odds of extra attributes.
- Each commission accrues "Fortune"; **at 50 Fortune, spending it guarantees a peerless-quality item**.
- Crafting rolls the first affix first; only with luck does a second affix appear (double-affix).

### 2.4 Porting takeaways

- **Dual axes of grade + affix**: rarity sets the base power ceiling, affixes set the build direction — keep the two axes separate.
- **Split equipment slots by damage type**: portable as physical/elemental damage-type partitions, giving different classes different valuations of the same slot.
- **Fortune pity guarantee**: add an accumulate-N pity guarantee to random drops/crafting to soften unlucky streaks — a great fit for an ARPG crafting system.

---

## 3. Equipment Enhancement Systems Overview

Moonlight Blade drives all of this through the "Polish" interface (hotkey B), split into **multiple parallel** enhancement tracks:

| System | Essence | Can it fail? | Bonus form |
|---|---|---|---|
| Jinggong (refinement) | Enhancement | No — pure XP accumulation | Flat values (armor adds HP) |
| Zhuomo (polish) | Refining | No | Percentages + Craftsman's Heart points |
| Inheritance | Stat transfer | No | Transfers Jinggong/Zhuomo/extra attributes |
| Affixes | Random stat lines | Rerolls are luck-based | Rank system (ranks 1–9), fusable upward |
| Longzhu | Skill enhancement | No | Attributes + sect-move enhancement |
| Tianxinzhu | Souped-up enchanting | No — chance-based level-ups | Random double affixes |
| Langwen | Inlay + resonance | No | Combo resonance amplification |

### 3.1 Jinggong (= enhancement)

- Like traditional gear upgrading, but **it cannot fail** — fill the Jinggong XP bar and the item automatically advances to the next level.
- Materials come from disenchanting equipment; each level demands a different amount.
- The gains are **flat values rather than percentages**; armor pieces grant extra HP.
- The Jinggong level cap differs by rarity.

### 3.2 Zhuomo

- Uses the same materials as Jinggong, but raises item attributes by **percentages** and grants Craftsman's Heart points.
- Costs far more materials and coin than Jinggong, and the early gains are marginal, so the standard advice is to leave Zhuomo for late game.

### 3.3 Inheritance (stat transfer)

- **Passes** one item's Jinggong level, Zhuomo level, and extra attributes to another item.
- Each item can receive inheritance only once; the donor item is consumed and disappears.
- Typical play: commission a low-quality item until it rolls great affixes → inherit the affixes onto a high-quality item.
- **Design intent**: decouple "farming affixes" from "raising numbers," lowering the sunk progression cost of top-end gear.

### 3.4 The Affix System

- Affixes are an item's random stat lines, obtained through crafting, dungeon chests, the auction house, and Forge-God chests.
- **Forge-God Tokens** are the core item for rerolling weapon/armor affixes; the cost escalates with reroll level (PC and mobile values differ).
- Affixes have a **rank system (rank 1 – rank 9)** and can be fused upward via "affix upgrading": it takes 3 affix-bearing items of the same slot as materials, and the sum of the 3 ranks must be ≥ a set value (e.g. 15 or 25).
- Rare affixes (e.g. "Transcendence," +2% crit rate) have far higher upgrade thresholds than common ones.

**The mobile client's reroll-line tiers and pity guarantee** (worth close study):

- Stat lines come in four tiers: base attributes (HP/attack), the four core stats (strength/agility), special attributes (crit/dark wound), and **top-tier attributes (guard-break/counter)**.
- Top-tier attributes (guard-break/counter) only have a chance to roll once the reroll level reaches 18.
- **There is a pity guarantee**: after enough accumulated attempts an upgrade is guaranteed to trigger, and on a "crit" proc it jumps 2–3 levels at once.
- Junk lines accumulate up to 10 and must be cleared before rerolling can continue; some lines can also be kept for swapping between.

### 3.5 Porting takeaways

- **Fail-proof, purely cumulative enhancement** (Jinggong) → lowers frustration; well suited as the core enhancement of a casual-friendly ARPG.
- **Flat-value vs percentage dual tracks** (Jinggong/Zhuomo) → offers distinct progression textures and cost-benefit curves.
- **Stat transfer** (inheritance) → players never lose progression to a gear swap; an early form of the "progression bound to the character" idea.
- **Reroll pity guarantee + crit multi-level jumps** → the classic mitigation for random progression, balancing anticipation with a safety floor.

---

## 4. Longzhu — Skill-Forging Affixes

> Originally named Zhulong; Moonlight Blade's most distinctive system. Its core is **binding equipment progression directly to sect skills**.

### 4.1 Core mechanics

- **Essence**: adds an upgradable special affix to divine-grade (PVP) equipment which, beyond granting high-end attributes, **also carries enhancement effects for specific sect moves**. Different equipment slots can carry different Longzhu effects.
- **An independent upgrade track**: Longzhu levels up separately from Jinggong and Zhuomo, and every level further strengthens the sect-move bonus.
- **Max level unlocks a skill VFX**: at Longzhu level **9**, the enhanced sect move gains a spectacular visual effect — the archetypal "numeric progression unlocks visual payoff" design.
- **Equipment pass-through**: like enchants it has a pass-through effect — an activated Longzhu keeps working after switching equipment loadouts (provided the other item in the same slot carries no Longzhu attribute).
- **Inheritance and upgrade threshold**: Longzhu effects on items of level 81 and above can be inherited and upgraded.

### 4.2 Acquisition and upgrade path

- The material "Ye Linglong" is obtained from dungeon bosses, limited purchases in the Tiankui-coin shop, and similar channels.
- Exchange examples: 15 head-slot Ye Linglong for one head Longzhu; 10 wristguard Ye Linglong for one wristguard Longzhu.
- The exchange yields an "unidentified" item; right-click to identify it into an item bearing the Longzhu effect, then inherit it onto your real gear.
- Upgrading: levels 1–4 use "Ye Linglong · Basic"; past level 4 you must defeat high-difficulty bosses for "Linglong Furnaces" to keep upgrading.

### 4.3 Porting takeaways ★ (a match for the sword-qi / skill-VFX direction)

Longzhu = "socket a rune into gear that doesn't just add numbers — it changes a specific skill's numbers and visuals, with a visual upgrade unlocked at max level."

- Design a **"skill rune" system**: enhancement materials bind directly to a specific active skill and strengthen that skill's numbers level by level.
- **Max level triggers a visual upgrade**: e.g. unlocking extra sword-qi particles, a glowing trail, or flashier hit effects at max level — wiring numeric growth directly into visual positive feedback.
- The **pass-through mechanic** ports as "runes bound to the skill rather than the item," so skill enhancement survives weapon swaps.

---

## 5. Tianxinzhu — Controllable Random Enchanting

> Best understood as **souped-up equipment enchanting**. The enhanced attributes are displayed in yellow text on the item panel.

### 5.1 Core mechanics

- **Unlike a traditional enchant that just tells you a fixed bonus amount**, it displays the boosted attributes outright.
- **Dual PVP/PVE sets, dual materials**: PVE consumes Bloodshed Tianxin Tokens, PVP consumes Martial Tianxin Tokens; you must first own the corresponding PVE/PVP skill. In the new version, Tianxinzhu detached from items onto equipment slots — the same slot stores both a PVP and a PVE attribute set, and whichever set matches the currently active gear is the one in effect.
- **No failure, chance-based level-ups**: each attempt has a chance to raise the level (similar to rerolling, but with no fixed jump count — pure luck).
- **Escalating cost**: the first layer starts around 10 Tianxin Tokens and climbs to about 40 at high levels; the PVP second layer starts higher (about 60).
- **Slot-weighted stat lines**: armor leans defense with attack secondary; jewelry leans crit/crit damage/accuracy; weapons lean attack power/crit/accuracy.

### 5.2 The "reroll affix → lock → level up" loop ★

Players chase **the perfect double-attribute affix** (e.g. "Yang + crit damage"). The standard play:

1. First push to **level 2** (the breakpoint — cheapest in tokens).
2. Once the desired attribute rolls, choose "keep."
3. On every level-up after that, whenever the roll is not the target affix, choose "keep" and reroll, so the affix keeps evolving toward the target.
4. Continue to max level (20 upper / 12 lower); max level means done, with no further heavy token spending needed.

This "keep-and-reroll" mechanic gives players **directional control within randomness** — you cannot dictate the outcome, but you can converge on it.

**Sample primary-attribute effects** (showing "effect differentiation" rather than pure numbers):

- Yang: on proc, reduces the target's dual defenses by 16% and increases threat.
- Liangyi: on proc, deals a bolt of lightning damage based on the current stat panel (appears to have an internal CD).

### 5.3 Porting takeaways

- **The template for controllable randomness**: players cannot pick the result outright, but by "locking the lines they like and rerolling only the ones they don't" they converge on the goal. Compared to pure random enchanting it adds agency and a sense of direction, while preserving grind and resource sinks.
- **Dual attribute sets in one slot**: the PVP/PVE dual-set design ports as "dual-form / dual-build save slots" — one equipment slot stores two configurations, auto-activating the matching set on form switch; solves progression fragmentation for dual-form characters.
- **Stat lines with active effects**: not just numbers — some lines carry trigger effects (defense shred, bonus damage), adding a qualitative edge to builds.

---

## 6. Langwen — Inlay and Resonance Combos

> Of the three systems, the one most focused on **build composition** — it relies on **combinations of Langwen quality/type triggering resonance** to amplify the payoff.

### 6.1 Three types × three qualities

| Type | Role |
|---|---|
| Heaven group | Offense |
| Earth group | Defense |
| Chaos | Advanced / wildcard (enjoys partial resonance, flexible filler) |

| Quality | Role |
|---|---|
| Blue (exquisite) | Early transition |
| Purple (peerless) | Event acquisition |
| Gold (divine) | Shop / high-difficulty drops |

**Key restriction**: a single item **cannot hold both Heaven and Earth Langwen at the same time**; Chaos goes with anything.

### 6.2 Gear split into attack and defense classes

- **Six attack-resonance pieces**: main weapon, off-hand weapon, wristguards, leggings, necklace, ring.
- **Six defense-resonance pieces**: bracelet, jade pendant, helmet, top, lining, shoes.
- Attack pieces take attack Langwen and defense pieces take defense Langwen — that is how you maximize the payoff and activate resonance.

### 6.3 The resonance mechanic ★ (the core highlight)

- **Combo-triggered**: different quality/type combinations trigger different resonances (e.g. "Five Elk Rise" requires 2 gold + 3 purple, boosting the five core stats plus attack; others such as "Tides of the Four Seas," "Heaven-Earth-Man," "Unbroken," and "Four Books, One Script" trigger by socket count and composition).
- **The weakest link sets the resonance level**: the resonance level is determined by the **lowest level** among the Langwen socketed on that item.
  - Example: three sockets at 5/5/1 → resonance only level 1; three sockets at 3/3/3 → resonance level 3.
  - This **weakest-link rule** forces players to upgrade evenly instead of stacking a single piece.
- **Socket growth**: up to 4 sockets per item (PC) / 5 (late-game mobile), opened progressively via seals/level unlocks.
- **Priority: attributes > resonance.** First use Langwen to patch your own attribute gaps, then adjust ranks/types to activate high-value resonances — avoid sinking money into expensive Langwen too early.

### 6.4 Day-to-day operations

- **Upgrading**: consume Langwen of the same kind to raise its own attributes.
- **Disassembly**: an upgraded Langwen can be disassembled, reverting to level 1 and refunding all consumed Langwen plus 80% of the silver.
- **Smelting**: melt spare Langwen into Langwen fragments, with a chance of obtaining a new Langwen.
- In the new version, Langwen detached from items onto equipment slots — gear swaps are lossless.

### 6.5 Porting takeaways

- **Type exclusivity + a wildcard piece** (Heaven/Earth exclusive, Chaos universal) → use exclusivity to create trade-offs, and the wildcard to lower the entry bar.
- **Resonance level takes the lowest piece** (weakest-link rule) → prevents stacking a single piece, forces balanced investment, and naturally stretches the progression curve. **The single most porting-worthy mechanic in this report.**
- **Attack/defense zoned resonance** → gives every equipment slot a clear Langwen direction, reducing choice paralysis.

---

## 7. Bianshi — Shaped Gem System

> Moonlight Blade's gem-socketing system; its biggest highlight is **using shape to express attribute direction at a glance**.

### 7.1 Three shapes for three attribute classes ★

| Shape | Name | Attribute direction | Name prefix |
|---|---|---|---|
| Triangle | Awl type | Attack attributes (external attack, accuracy, crit rate) | Day |
| Circle | Floatstone | Base attributes (strength, internal force, agility) | Star |
| Square | Spirit jade | Defense attributes (HP, external defense) | Night |

- The same attribute on a non-matching shape rolls lower values (steering players to socket "shape-appropriately").
- Only one of each Bianshi kind can be socketed, so all three shapes must each be raised separately.

### 7.2 Quality and upgrading

- Five grades: common (white), fine (green), superior (blue), exquisite (purple), peerless (yellow) — the higher the grade, the more attributes it carries.
- A new Bianshi starts at layer 1 and is leveled by consuming other Bianshi; the higher the quality, the more XP each level requires.
- **Level cap = one tenth of character level** (e.g. a level-39 character caps Bianshi at layer 3) — prevents low-level stomping and ties gem progression to character level.

### 7.3 Socketing location (where it meets Jingmai)

Bianshi are not socketed into equipment: they activate at level 30 upon completing the "Shimen" acupoint on the Ren meridian and are socketed into the **Jingmai (meridian network)**. Moreover, the network's "wondrous acupoints" can only be opened with the help of a Bianshi; once opened they become "Bianshi acupoints," whose power relates to the gem and cannot be upgraded.

### 7.4 Porting takeaways

- **Shape = a gem language for attribute direction** → intuitive and instantly readable in the UI (triangle = attack, square = defense, circle = base), lowering newcomers' cognitive load.
- **Level cap tied to character level** → controls the growth curve and stops players from using money/materials to leapfrog level bands.
- **Gems socketed into the "talent tree" rather than gear** → the Bianshi-into-Jingmai design ports as "gems socketed into talent nodes," fusing gems with the character's growth network.

---

## 8. Jingmai — Node-Based Growth Network

> Moonlight Blade's "talent tree / growth network" system: spend resources to activate acupoints one by one and gain attributes.

### 8.1 Structure

- Multiple meridians, each containing several acupoints. **The mobile version has five**, unlocked in stages:
  - Ren meridian, Du meridian (level 48), Dai meridian (level 55), Chong meridian (level 61), Yinwei meridian (level 71).
  - Acupoint counts: Ren 13, Du 15, Dai 15.
- **Left/right division of labor**: the left branch governs defensive attributes such as max HP and recovery; the right branch governs offensive attributes such as crit and dodge.
- Attribute leanings per meridian: the Ren meridian leans base attributes (HP, internal attack), the Du meridian leans external defense, toughness, and the like.

### 8.2 The acupoint-opening mechanic

- Opening an acupoint's first layer costs 1 "opening point"; opening points come from leveling up or are exchanged for cultivation.
- Acupoint levels are double-capped by character level and "dantian level."
- **Opening grants a bigger attribute bump than leveling it afterward**, and clearing an entire meridian grants an extra "completion attribute."
- Nurturing consumes materials such as "stone-mother," with each round granting its attribute bonus.

### 8.3 Signature pacing-control mechanics ★ (worth borrowing)

- **Fatigue timer**: opening acupoints generates meridian fatigue; once the total reaches 8 hours, no further openings are allowed until it resets — a soft daily limiter that prevents grinding it all in one sitting.
- **Zhengxu locks**: some meridians and acupoints are locked behind "Zhengxu" and require completing assorted journeying feats out in the world to unlock — binding numeric progression to exploration content.
- **Wondrous/Bianshi acupoints**: wondrous acupoints need a Bianshi to open; once opened they become Bianshi acupoints whose power relates to the gem and cannot be upgraded — the crossover point between Bianshi and Jingmai.

### 8.4 Porting takeaways

- **A node-based growth network** = the Diablo-like's talent tree/star chart; Moonlight Blade paces it with "branching meridians + staged unlocks."
- **Soft pacing gates** (fatigue timer / Zhengxu locks) → tie numeric growth to time and exploration, shaping the growth curve and stopping players from maxing out in one go and flattening the experience curve. An ARPG can substitute "exploration-unlocked talent nodes" for pure point-buying.
- **The opening > leveling attribute gap**: encourages players to "spread wide and unlock first, then upgrade deep," creating clearly staged progression.

---

## 9. The Attribute System

> The heart of Moonlight Blade's numeric design is the **"base attributes → combat attributes" coefficient-conversion model**.

### 9.1 A two-layer attribute structure

- **Base attributes (the four/five core stats)**: strength, internal force, agility, insight, constitution (mind-guard), and so on.
- **Combat attributes**: internal/external attack, internal/external defense, HP, accuracy, crit (rate/damage), block, toughness, guard-break, counter, and so on.

### 9.2 The coefficient-conversion model ★

Each base attribute distributes into several combat attributes at **different coefficients**. Taking the Shendao sect as an example:

- Strength → external attack ×0.45, external defense ×0.4, HP ×1

The same point of a base attribute is thus worth different amounts to different classes — the foundation of deep builds.

### 9.3 The dual internal/external system

- Internal-attack-class and external-attack-class gear/attributes are kept separate.
- Sects choose their primary stat by martial-art type. Example: Taibai favors insight first (emphasizing crit and accuracy), with agility as the secondary to balance external growth and survivability.

### 9.4 Numeric details

- Moonlight Blade's numbers use **truncation** rather than rounding.
- The internal/external bonus coefficients are not officially published (players reverse-derived them from collected data).

### 9.5 Porting takeaways

- **Base attributes → combat attributes via coefficient conversion** → makes the same attribute worth different amounts per class, avoiding "every class stacks the same stat"; the numeric bedrock of build diversity.
- **Separated dual damage systems** (internal/external) → ports as separated physical/elemental systems, differentiating gear and attribute choices.

---

## 10. Porting Summary for Torchlight II

### 10.1 The three foundational architecture principles (adopt first)

| Principle | Moonlight Blade source | Value for Torchlight II |
|---|---|---|
| No destructive failure | Jinggong/Longzhu/Tianxinzhu never damage gear | Lowers casual-player frustration; grind shifts to resources |
| Progression bound to slots, not items | Longzhu/Tianxinzhu/Langwen detached to slots | Lossless gear swaps; establish this early in the architecture |
| Independent material tracks | Each system has its own currency | Players can advance each track at their own pace |

### 10.2 A checklist of directly portable core mechanics

1. **A skill-rune system** (from Longzhu) ★: enhancement bound to specific skills, with max level unlocking skill VFX — a direct match for the sword-qi/skill-VFX direction.
2. **Controllable random enchanting** (from Tianxinzhu): the "lock the satisfying lines + reroll only the unsatisfying" convergence loop, balancing random anticipation with a sense of direction.
3. **Resonance level takes the lowest piece** (from Langwen) ★: the weakest-link rule forces balanced investment and naturally stretches the progression curve — the best single mechanic.
4. **Type exclusivity + a wildcard piece** (from Langwen): exclusivity creates build trade-offs, the wildcard lowers the entry bar.
5. **A shaped gem language** (from Bianshi): triangle = attack, square = defense, circle = base — intuitive, cuts cognitive load.
6. **The coefficient-conversion attribute model** (from the attribute system): base attributes converting into combat attributes at per-class coefficients — the bedrock of build diversity.
7. **Fortune pity guarantee** (from commissioning): add an accumulate-N pity guarantee to random crafting to soften unlucky streaks.
8. **Reroll pity guarantee + crit multi-level jumps** (from affix rerolling): the classic mitigation for random progression.

### 10.3 Pacing-control advice (port with caution)

Moonlight Blade's soft time gates — "meridian fatigue timers," "Zhengxu locks" — are MMO daily-retention design; **a single-player/buy-to-play Torchlight II should de-emphasize time gates**, while keeping:

- **Exploration-unlocked progression nodes** (the healthy core of the Zhengxu lock): bind some powerful talents/rune slots to exploration or challenge achievements rather than pure resource stacking.
- **The opening > leveling attribute gap**: encourage "spread wide first, then dig deep," creating a clear sense of progression stages.

---

## Appendix: Three-System Side-by-Side Quick Reference

| Dimension | Longzhu | Tianxinzhu | Langwen |
|---|---|---|---|
| Enhancement target | Sect skills (numbers + VFX) | Item attributes (random affixes) | Item attributes (socketed combos) |
| Core mechanic | Independent leveling; max level unlocks skill VFX | Chance-based level-ups; "keep-and-reroll" affix play | Combo resonance; weakest link sets resonance level |
| Randomness | Low (directed upgrades) | High (controllable random) | Medium (combos deterministic, attribute leveling linear) |
| Source of build depth | Skill-enhancement choices | Chasing perfect double affixes | Type/quality composition + resonance trade-offs |
| Can it fail? | No | No (level-ups are chance-based) | No |
| Loss on gear swap? | New version slot-bound, lossless | New version slot-bound, lossless | New version slot-bound, lossless |

---

*This report is compiled from public guides and wiki material; some numbers are reverse-derived by the player community and are offered for design reference only, not as precise official data. Both the PC and mobile clients of Moonlight Blade iterate frequently — defer to the live version for exact values.*
