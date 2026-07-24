---
title: "Challenger Continent · Transmutation Recipe Codex"
date: 2026-07-24T20:05:00+10:00
author: "Mikuro"
summary: "All 455 transmutation recipes online: item icons for ingredients and results, with exact probabilities for random outcomes."
weight: 5
params:
  rarity: "rare"
  icon: "flask"
  typeline: "Rare · Online Recipe Codex · Data Browser"
  affixes:
    - "455 recipes extracted straight from the mod DAT files, with item icons and rarity colors"
    - "Random results expanded via the engine's weighted roll algorithm: 137 random recipes with per-item probabilities"
    - "Gamble recipes that can yield nothing (e.g. legendary → shards) show the empty-handed chance"
    - "Hidden recipes and ?-result recipes are all included and labeled"
    - "Filter by group / source component; search by recipe, ingredient or result name"
  flavor: "Luck goes into the crucible; probability goes into the ledger."
  status: "Live"
  metaline: "web · runs in your browser (UI in Chinese)"
---

## Open the codex

**[▶ Open the Recipe Codex](/tools/recipes/)** — no install needed, runs in your browser.
The codex UI is in Chinese; item names come from the mod's data files.

## What it is

Every transmutation recipe in the Challenger Continent modpack (ember upgrades, spirit
stones, runes, runewords, MU weapons, Zhizun sets…), generated directly from the mods'
`DAT` source data:

- **Ingredients**: item icons + counts; type-matched ingredients (e.g. "any legendary")
  keep their in-game descriptions;
- **Results**: fixed results shown directly; random results expand into a full
  probability table — probability = weight ÷ pool total, per the engine's weighted
  roll algorithm, with nested spawn tables multiplied through;
- **Special recipes**: gamble recipes that can leave you empty-handed, the socketing
  recipe, and recipes hidden from the in-game list are all included;
- **Variant folding**: same-name results (e.g. 32 kinds of pet eggs) are merged with
  probabilities summed.

## How to use

Filter by group / source component in the toolbar, or search by recipe, ingredient or
result name; click "N possible results" to expand the probability table.
Data is regenerated with each modpack release; in-game behavior is authoritative.
