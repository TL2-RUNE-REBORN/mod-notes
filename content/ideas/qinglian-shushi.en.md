---
title: "Azure Lotus Taoist · Rites of the Three Pure Ones"
date: 2026-08-01T16:20:00+08:00
params:
  status: hatch
  summary: "A second-class concept for the Azure Lotus lineage — cycle the Five Elements to build Qi, unleash it at Five Breaths Converged, and let runtime miracles handle charm, death-cheating and soul-harvesting. Full 36-skill draft inside."
---

> 🧠 **Brainstorm v0** · 36-slot draft across three trees · Numbers unset, mechanics open for debate — critique welcome.

Lay the talismans, form the seals, chant the incantation. Qi cycles through the Five Elements; when the circuit completes, one breath becomes Three Pure Ones — the Azure Lotus lineage's second class concept lives and dies by the **rhythm** of its casting, not the weight of a single sword.

## Ⅰ · Three Make a Formation

Position first. The two existing custom classes each pushed one extreme:

| | Sword Immortal | Anonymous Scholar | **Azure Lotus Taoist (this draft)** |
|---|---|---|---|
| Playstyle | Melee burst + mobility | Summons / aura management | **Mid-range ritual casting: set up → trigger → harvest** |
| Resource identity | Mana *is* the damage stat | Crit chance spent as aura fuel | **Cycle the Five Elements to build Qi** |
| Charge bar | 1 cell, burst on full | 1 cell, linear scaling | **5 cells — "Five Breaths Converge", spendable by ultimates** |
| Implementation | Pure data layer | Pure data layer | **Data-layer skeleton + runtime miracles** |

The Sword Immortal is fast, the Scholar is patient; the Taoist plays **tempo**: skills only pay off when rotated through the elements. Lore-wise it is a branch of the same Azure Lotus lineage — sword cultivation and arts cultivation share one root, and the existing Azure Lotus gem families (Haste / Soulrend / Windshade) work for it out of the box.

## Ⅱ · Five Breaths Converge

The core resource. The charge bar opens at five cells, drawn as five element pearls — Metal, Water, Wood, Fire, Earth, one per lotus petal. Two layers of rules: **playable without a guide, with a hidden beat for those who learn it**:

- **Switch elements to build**: every skill carries an element tag. Cast a skill of a *different* element than your last — +1 Qi. Spam the same element — nothing. The kit rotates itself.
- **The Great Circuit**: cast five skills in exact generating order (Metal → Water → Wood → Fire → Earth) — **instant full bar**, plus the "Circuit Perfected" buff. A hidden rhythm reserved for the disciplined.
- **Five Breaths Converged** (5/5): cast speed and damage scale with cells; a qualitative bonus kicks in at full.
- **Spending**: ultimates like Ninefold Golden Elixir and Unity of Heaven and Man consume the bar — the more cells, the bigger the meal.

An advanced layer (can ship later): **element brands and counters**. Skills brand their element onto targets; a later skill whose element *counters* the brand (Water quells Fire, Fire melts Metal…) deals a bonus "subdue" hit. That is where the set-up pays off — brand first, then strike the counter.

> *The Five Elements reward not quantity, but turning.*

## Ⅲ · Three Trees of the Three Pure Ones

Three skill pages for three lineages, each 9 actives + 3 passives. "Runtime ★" marks skills that need runtime miracles (next section); everything else is achievable in pure data.

### Jade Purity · Divine Empyrean Thunder (burst / retribution)

> *From the Ninth Heaven answers the Origin; thunder proclaims the Law.*

| Skill | Element | Mechanic | Layer |
|---|---|---|---|
| Palm Thunder | Fire | Instant short-range single-target zap, cheap Qi builder | Data |
| Five Thunders Rite | Fire | Five-point thunder array ahead | Data |
| Thunder Step | Wood | Blink as lightning, discharging along the path | Data |
| Empyrean Thunder Pool | Water | Ground field: slow + arcing damage over time | Data |
| Seal of Heaven's Punishment | Metal | Brands "Thunder Draw"; detonates after 3 s, or early when struck by thunder skills | Data |
| Summon Thunder Marshal | Wood | Summons Marshal Wang Lingguan, whip-chaining lightning (one avatar max) | Data |
| Gang-Wind Sweep | Metal | Cone gale that shoves and shreds armor | Data |
| Edict of the Thunder Bureau | Earth | Detonates every Thunder Draw on the field | Runtime ★ |
| Ninefold Thunder Tribulation | Fire | Ultimate: nine random bolts under the tribulation cloud, **friend and foe alike** — but bolts that strike you grant the "Tribulation Passed" buff instead of damage | Runtime ★ |
| Thunder Attunement | — | Passive: thunder damage and chain count | Data |
| Five Thunders Crown | — | Passive: chance to answer hits with a bolt | Data |
| Pacing the Dipper | — | Passive: slow Qi gain while moving (kiting builds) | Data |

### Highest Purity · Numinous Treasure Talismans (control / summons / toolbox)

> *One edict issued, ten thousand talismans obey.*

| Skill | Element | Mechanic | Layer |
|---|---|---|---|
| Five-Element Talismans | Cycling | Thrown talismans cycling Metal-Water-Wood-Fire-Earth — a natural gap-filling Qi engine | Data |
| Immobilization Talisman | Earth | Root + minor damage | Data |
| Soul-Beguiling Talisman | Water | **Charm**: the struck monster turns on its own kind for a few seconds | Runtime ★ |
| Golden Light Mantra | Metal | Golden ward + **fear** pulse around you | Runtime ★ |
| Curse of the Three Corpses | Wood | Lingering curse; on death, three corpse-worms burst out and bite | Data |
| Five Ghosts Ferry | Water | Marks a target: on death it drops a "soul wisp" pickup restoring mana and Qi | Runtime ★ |
| Paper Effigy | Wood | Summons a decoy that taunts; while it stands, a killing blow **destroys the effigy instead of you** | Runtime ★ |
| Liuding & Liujia Guardians | Earth | Summons the yin and yang guardian pair | Data |
| Edict: All Talismans Return | — | Ultimate: detonates every talisman brand on the field, with counter bonuses | Runtime ★ |
| Talisman Mastery | — | Passive: talisman duration and concurrent brand cap | Data |
| Aura Reading | — | Passive: crit bonus against branded targets | Data |
| Bell of the Three Pure Ones | — | Passive: after a control skill lands, the next skill casts faster and cheaper | Data |

This tree deliberately lacks Fire — it cannot complete the cycle alone, and **Five-Element Talismans are the gap-filler**: whichever element you miss, wait for the talisman cycle to hand it to you.

### Grand Purity · Cauldron of Inner Alchemy (resource / spirit-form / survival)

> *One breath becomes Three Pure Ones; Three Pure Ones return to one breath.*

| Skill | Element | Mechanic | Layer |
|---|---|---|---|
| Yin-Yang Fish | — | Stance toggle: Yang boosts thunder damage and speed, Yin boosts talismans, mitigation and mana | Data |
| Black Tortoise Gang Steps | Water | Yu-step dash leaving a trail of gang-qi | Data |
| Ninefold Golden Elixir | Earth | **Consumes all Qi cells**: heal and restore per cell + stacking "Elixir Radiance" damage buff | Data |
| Sitting in Oblivion · Egress | — | Spirit leaves the body for 4 s: the body **cannot be targeted**, casting costs no mana | Runtime ★ |
| Bagua Mirror | Metal | Block enhancement + blocked projectiles are reflected | Data |
| Inner Vision · Circuit | — | Channel: sustained recovery, +2 Qi on completion | Data |
| Great Derivation Reckoning | — | Active: instantly cuts all cooldowns by your current Qi count | Runtime ★ |
| One Breath, Three Pure Ones | — | Ultimate: summons the three avatars — Jade, Highest, Grand Purity — casting in rotation | Data |
| Unity of Heaven and Man | — | Capstone: castable only at Five Breaths Converged; fuses both stances, and every skill builds full Qi regardless of element order | Runtime ★ |
| Highest Good Is Like Water | — | Passive: a share of damage taken converts to mana | Data |
| The Way Follows Nature | — | Passive: damage per Qi cell (linear charge scaling, the Scholar's proven trick) | Data |
| Fasting Breath | — | Passive: out-of-combat recovery and potion strength | Data |

Most Grand Purity skills carry no element — inner cultivation stays out of the cycle, so this tree borrows tempo from the other two. Fitting, for the school of non-action.

## Ⅳ · The Miracle Layer

What the data layer cannot express and a runtime patch can — this is where the class outgrows its two elders. Nothing here is speculative: **every engine primitive below already shipped and was play-tested in the Azure Lotus gems (the cooldown multiplier) or the Beast-Taming Collar (taunt)** — the same craft already running on players' machines.

From smallest job to largest:

- **Soul-Beguiling Talisman (charm)** — the engine ships a native "lock target" primitive; the taunt collar uses it to pin monster aggro onto your pet. Point the same primitive at *another monster* and you have charm. No vanilla class ever got one — the best feature-per-effort buy on the board.
- **Golden Light Mantra (fear)** — the AI carries a native fear flag with its own countdown. Light it up and walk away.
- **Sitting in Oblivion (untargetable)** — the same AI flag family has "cannot be targeted". Spirit egress is one line deep.
- **Great Derivation Reckoning** — the exact cooldown multiplier the Haste gems use in production; wiring it to the Qi count is an afternoon.
- **Five Ghosts Ferry (soul harvest)** — loot-resolution injection: the "soul wisp" drops through the **vanilla loot pipeline** — creation, placement, multiplayer sync all handled by the engine; the patch merely adds one entry after the dice land. The read-only probe for this chain is already built.
- **Paper Effigy (death-cheating)** — every damage source in the game (weapons, skills, DoTs, reflects) funnels through **one final outlet**; intercept the killing blow there, burn the effigy instead. A paper-thin second life.
- **Edicts (mass detonation)** — the range-enumeration primitive exists; walk the brand table and light the fuses.
- **Deluxe backlog** — the full element-counter matrix, tribulation self-damage conversion, and the three avatars copying your current wardrobe (pure cosmetics, last in line).

Runtime miracles share the current deployment stance: effective in single-player and as multiplayer host; client-side behavior gets play-tested per feature before it is ever advertised.

## Ⅴ · Known Pits and the Road

Every pit the first two classes fell into becomes a day-one rule: reuse the Engineer template (for its five-cell charge semantics) but **purge dead authorizations immediately**; skill GUIDs freeze at release (save files key invested points on them); no bare-basename model references (an old collision wound); passive structures steer clear of respec-order residue.

Five steps down the road:

1. Paper finalization — the 36-slot number table and stat-hook rules (primary stat leaning Focus, Qi cells as an independent multiplier, keeping clear of the Sword Immortal's mana lane)
2. Pure data-layer skeleton — charge bar plus every data-layer skill running; the Scholar proved how far this step alone goes
3. The four small miracles — charm / fear / egress / Reckoning: minimal patches, maximal identity
4. The element-sequence judge — the Great Circuit metronome
5. Counter matrix and deluxe items, one by one

---

**Progress**: paper draft. Every engine primitive the runtime side needs has already shipped and been play-tested in existing systems (cooldown multiplier / taunt / loot injection) — no new reverse-engineering bones to crack; next up is the 36-slot number table and the pure data-layer skeleton. Opinions wanted — especially on how strict the Qi-building rules should be, and where the charm duration line sits.
