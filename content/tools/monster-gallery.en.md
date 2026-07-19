---
title: "Vanilla + Challenger Continent · Monster Bestiary"
date: 2026-07-19T19:10:00+10:00
author: "Mikuro"
summary: "An online bestiary of 3000+ monsters from vanilla Torchlight 2 and every Challenger Continent component: stats / skills / resists / 3D models / real-value calculator."
weight: 4
params:
  rarity: "rare"
  icon: "skull"
  typeline: "Rare · Online Monster Bestiary · Data Browser"
  affixes:
    - "800+ vanilla and 2300+ Challenger Continent entries, color-coded by rank: boss / champion / regular / pet & summon"
    - "HP / damage / armor / elemental armor shown with true engine semantics: level-curve multipliers (×1.0 = baseline)"
    - "Both vanilla and Challenger level curves built in — drag the level slider to compute real HP / damage / XP per difficulty"
    - "Monster skill lists (incl. AI triggers), innate traits and boss control-resist affixes, rendered from in-game text"
    - "Online 3D model preview, filter by source / rank / family; same-name random variants auto-collapsed"
  flavor: "Every pair of eyes that lights up in the dark, kept on record."
  status: "Live"
  metaline: "web · opens right in the browser"
---

## Enter the bestiary

**[▶ Open the Monster Bestiary](/tools/monsters/)** — nothing to install, runs in the browser (interface currently in Chinese).

## What it is

Every monster in vanilla Torchlight 2, plus everything the Challenger Continent components add
(Diablo Legacy, Fallen Horde, Class Skills, Mercenaries, …), extracted straight from the game's `DAT` source data:

- **Stats**: HP / damage / armor / elemental armor / XP, displayed with the engine's real semantics —
  **level-curve multipliers** (reverse-engineering confirmed: DAT value ÷100 × level curve; bosses and champions use the champion curves);
- **Real-value calculator**: each detail page embeds both the vanilla (level 105) and Challenger (level 180) curve sets —
  drag the level slider and switch difficulty to get the actual HP, damage and kill XP at that level;
- **Skills**: monster skill lists with cast chance and AI-triggered skills (low-HP summons, enrage, …), resolved to in-game names;
- **Traits & affixes**: innate block / crit / cast-speed traits plus boss and champion control-resist affixes, rendered from in-game text;
- **3D preview**: monster meshes parsed per-submesh with their material textures — click any row to inspect the model;
- **Variant collapsing**: same-name random variants (like Fallen Horde's ten thousand randomly-equipped "Fallen Heroes") collapse into one entry with value ranges.

## How to use it

Filter by source (vanilla / component mod), rank (boss / champion / regular / pet & summon) or family in the top bar,
or search by name; click any table row for details, the 3D model and the real-value calculator.
Data is regenerated with each mod-pack release — in-game values are authoritative.
