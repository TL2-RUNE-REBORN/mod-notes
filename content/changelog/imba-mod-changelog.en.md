---
title: "Challenger Continent MOD Changelog"
date: 2026-07-12T00:00:19+10:00
author: "Mikuro"
summary: "Complete version change history of the Challenger Continent mod pack."
---


## 2026-07-12
Crash-fix special, plus the launcher's "MIKURO Game Enhancement" update. This release focuses on three classes of crashes confirmed in real play; all MODs have been fully repacked — replacing the whole pack is recommended, and the launcher has been updated in step.

- 🐛: Fixed crashing while fighting monsters after socketing the "Lost Maya Runestone" (失落的玛雅符石) — the runestone's proc skills (Hell Plague / Rising Sun Breeze / Plague Infection) were loading old visual-effect paths that had already been migrated (Diablo Legacy + class skills)
- 🐛: Fixed crashing when pressing P to open the pet screen while a mercenary is present — the mercenary backpack's 3D preview collided with the vanilla UI's display layer; even a single mercenary could trigger it (mercenary system)
- 🐛: Fixed a batch of broken visual-effect references on related skills in the class skill pack — old paths left over from the priest-line directory migration, affecting 11 skill files including Armor Trap / Ground Slam / Uppercut / Blazing Fist; triggering them could crash or show missing effects (class skills)
- 🐛: Fixed mercenary sidebar menu buttons not showing after entering the game (name collision with a vanilla menu displaced them; mercenary system)
- ✨: Loot filter revamp (launcher MIKURO Game Enhancement): custom MOD rarities (e.g. EPIC/RUNE) are now auto-detected and filtered on their own rows; the type blacklist is now a filterable dropdown; quest items can never be swallowed by the filter
- ✨: Haste Spirit Stone restriction (launcher MIKURO Game Enhancement): Haste Spirit Stones with cooldown reduction can now only be socketed into weapons/helmets/gloves, matching their description and preventing wasted sockets
- ♻️: Launcher save-unbind improvement: you are only asked to pick a vanilla class when actually unbinding a class MOD; regular content MODs are no longer misidentified as class MODs
- ♻️: Save crash fixes (large-inventory saves / zone-transition crashes) merged into MIKURO Game Enhancement and enabled by default
- ✨: The mod pack adds a troubleshooting guide, "If You Don't Read This You WILL Crash" (《不看这个说明你肯定闪退》) — a four-step checklist covering game version / GPU driver / launch method / antivirus; check it first whenever you crash

## 2026-07-04
Technical repack release. All MODs have been repacked with a brand-new in-house packer; in-game content is completely identical to the previous release (07-03). Replacing the whole pack is recommended.

- ♻️: All components fully rebuilt with the new packer; the output was verified file-by-file to match the previous release, with no difference in game loading or runtime behavior — no character rebuild needed
- ♻️: Packing is faster and the mod pack is slightly smaller; if the old version runs fine you may keep using it — this release is purely a build-tooling upgrade

## 2026-07-03
Major component-conflict overhaul + full repack. Focuses on GUID collisions when multiple components are enabled together, mutual interference between the mercenary and pet UIs, and some classes missing weapons or showing naked models. All MODs in this release were completely repacked with the new packer; replacing the old pack is recommended.  

- 🐛: Fixed a large batch of GUID conflicts — cross-MOD collisions and internal reuse of skills / unique gear / summoned units when multiple components are enabled (11 skills, 17 units, 5 unique items, 2 pet summons, etc. — 30+ in total)
- 🐛: Fixed a GUID conflict between the pet shop merchant and the mercenary arms dealer
- 🐛: Fixed the skill sheet / skill bar disappearing because the mercenary and pet MODs shared the same UI (mercenaries now use a dedicated backpack UI WBINVENTORYMENU; pet containers now use unique IDs)
- ♻️: Moved the mercenary health bar out of the pet column to top-center of the HUD, removing overlap with the pet panel/HUD
- 🐛: Fixed missing weapons (bows) for Jungle Hunter (丛林猎人) / Overwatch (守望先锋) / Dark Archer (暗黑弓手); corrected the Jungle Hunter's bow grip pose and equipping method
- 🐛: Fixed naked models (missing equipment) for Overwatch / Heavy Mech Pilot (重甲机师)
- ✨: Added the map scroll "Purgatory Paradise" (炼狱天堂) — opens a portal on use, unlimited shop supply (Demon Fall (群魔堕落))
- ♻️: Updated L_BOSS-series boss data and translations (Diablo Legacy)
- ♻️: Updated SSS_BOSS-series boss data (Demon Fall)
- 🗑️: Removed leftover POE portal and candlestick layouts (Diablo Legacy)
- 🗑️: Removed the defunct XEV pet merchant (class skills)
- 🗑️: Removed SSS_POTION (Demon Fall)
- 💬: MOD description updates (shared assets, pet system)

## 2023-12-15
A refined release focused on the Sword Immortal; a character rebuild is required — select Azure Lotus Sword Immortal [Refined] (青莲剑仙[精修版])  

- ♻️: Massive description, visual-effect, and misc updates
- ♻️: The passive [Sword Dao: Sword Emperor] (剑道-剑帝) no longer triggers on destructible objects
- ♻️: The passive [Sword Dao: Sword Emperor] duration changed to 2 seconds
- ♻️: [Sword Force: Spirit Sword Domain] (剑势-灵剑剑域) armor reduction now scales with MAX MANA
- ♻️: [Sword Force: Spirit Sword Domain] removed useless description text, restored the missing T1/2/3 bonuses
- ♻️: [Sword Force: Sword Radiance] (剑势-剑耀) DOT changed to INSTANT
- ♻️: [Sword Force: Sword Intent Slaughter] (剑势-剑意杀戮) fixed missing skill effects
- ♻️: [Sword Force: Sword Intent Slaughter] added main-hand and off-hand weapon effects
- ♻️: [Sword Force: Storm] (剑势-风暴) nerfed to physical damage
- ♻️: [Sword Dao: Sword Emperor] reduced the number of DEBUFFs
- ♻️: [Swordplay: Spirit Flying Sword] (剑术-元灵飞剑) adjusted
- ♻️: [Sword Dao: Swordsman] (剑道-剑士) adjusted
- ♻️: [Swordplay: Sword Step] (剑术-剑步) adjusted — the stun now ignores resistance; dodge nerfed
- ♻️: [Swordplay: Sword Tomb] (剑术-剑冢) removed the dual-wield requirement
- ♻️: [Sword Dao: Sword Patriarch] (剑道-剑宗) description corrected; the Focus bonus nerfed
- ♻️: [Swordplay: Boundless Edge] (剑术-无量锋) description corrected; fixed the skill effect not matching the description
- ♻️: [Sword Force: Spirit Sword Domain] description corrected; fixed the skill effect not matching the description
- ♻️: [Sword Force: Spirit Sword Domain] visual effect reworked; fixed the effect's attachment position
- ♻️: [Song of Ten Thousand Swords] (万剑曲) can now be charged, but count and range are nerfed
- ♻️: Fixed the full-charge state
- 🐛: Fixed a wrong T3 AFFIX on Sword Flash (剑闪)
- 🐛: Fixed the Sword Qi (剑气) description not matching the actual AFFIX
- ♻️: Simplified the Yijian (奕剑) description
- 🐛: Fixed the Taigeng Sword (太庚剑) missing its visual effect on initialization
- ♻️: Corrected the Sword Saint / Sword Sovereign (剑圣/剑皇) descriptions
- ♻️: Corrected the Sword God (剑神) description
- ♻️: Simplified resources
- ♻️: [Song of Ten Thousand Swords] now gains a full-energy stun effect at level 15
- ♻️: Adjusted the Immortal Sword (仙剑) effect icon and duration

## 2023-12-10
Can be applied over either the 11-28 or the 12-05 version  

Download link: [Challenger Space](https://tl2-mod-download.chr.moe/)  
Click a file name to download  

Unzip password:  
.K166ed56F07f93F8
  
- ⚗️: Regardless of character level, everyone is now placed at the start of NG cycle 1; monster levels per cycle are 85-101-125-160-160
- ♻️: Mitigated zone-transition crashes — max cached map levels reduced from 6 to 3; refresh time changed from 10M to 5M for dungeons and from 5H to 20M for overworld maps
- ♻️: Specialization quest rewards are now pick-1-of-5
- ♻️: Reviving in place now always grants 30% move speed
- ♻️: Restored the vanished robot
- ✨: Added charm synthesis — 5 low-tier charms combine into 1 higher-tier
- ✨: Added the map expansion pack
- ♻️: Lost Atlantis Sacred Shield (遗落的亚特兰蒂斯圣盾): lowered equip requirements, raised stats
- ♻️: Normalized MERGE LAYOUT naming for the lightsaber and specialization-skill retailers
- 🗑️: Removed the weapon-growth TRIGGERABLE
- 🗑️: Removed unstable AFFIXes


## 2023-12-05
Just overwrite the 11-28 files  
**The specialization-skill changes are not fully tested — removing them first and updating later is recommended to avoid issues**  
Coming next: the refined Sword Immortal  

Download link: [Challenger Space](https://tl2-mod-download.chr.moe/)  
Click a file name to download  

- ♻️: Lowered white/blue item drop rates to avoid stutter from too many items on the ground
- 🗑️: Removed the class requirement on specialization skills — all 16 skills open to everyone (level 25 still required)
- ♻️: Adjusted the Enigma (谜团) drop rate
- ♻️: Adjusted Diablo AFFIX weights
- 💬: Corrected the "fumble chance" translation
- 🐛: Fixed some DDS format issues
- ♻️: Soul Return ring (灵魂归来): stat adjustments and AFFIX simplification
- ♻️: Diablo 3 rings: stat adjustments and AFFIX simplification
- 🐛: Fixed indentation errors in some IMAGESET files
- 🚚: Relocated lightsaber AFFIXes
- 🗑️: Removed MAP Dark World-5
- 🗑️: Removed leftovers of an unknown class

## 2023-11-28
Download link: [Challenger Space](https://tl2-mod-download.chr.moe/)  
Click a file name to download  

All MODs got new file names in this update for easier identification  
The MOD launcher uses the MOD ID to identify each unique MOD — delete the old versions before copying in the new ones, or the MOD launcher cannot identify them correctly  
Likewise, if you use the regular-inventory version of the mercenary MOD, delete the charm-version mercenary MOD (the one without brackets in its name), or it cannot be identified correctly  

- ✨: Replaced the charm button icon on the character inventory screen
- ✨: Mercenaries can now wear charms too — just put them in the mercenary's inventory (the charm version is now the mercenary default going forward)  
The regular-inventory version is kept as an extra but will no longer be updated; it can be downloaded from `Challenger Space`
- ⚗️: Max NG cycles adjusted to 5
- 🐛: Fixed the mercenary MOD causing the sidebar to disappear on first game entry
- ♻️: For multiplayer, capped the level at 100 and raised XP requirements by +20%
- ♻️: Adjusted the equipment stat-requirement curve — the four attributes unified, value requirements +20%
- ♻️: Simplified the names of Fallen-series monsters
- ♻️: The mercenary merchant now sells the Soothing Elixir (安抚剂); description corrections
- 💬: Diablo-exclusive affixes are now tagged (e.g. `暗黑-五光之` appearing on blue items)
- 💬: Corrected the Meteoric Iron necklace description
- 💬: MOD description updates
- 💬: Translation fixes (equipment stat requirements, pet/minion move speed)
- 💬: Translated the mercenary death-count reset skill
- 🗑️: Removed the Dark World entrance in the map factory to avoid conflicting with the final BOSS scene
- 🗑️: Removed invalid AFFIXes inside class BASE files
- 🗑️: Removed a redundant page from Legendary War God (传奇战神)
- 🗑️: Cleaned up duplicate content (Demon Fall)

### File checksums
File name: 挑战者大陆20231128(完整).zip (Challenger Continent 20231128, full)  
File size: 502 MB (526,776,591 bytes)  
Modified: 2023-11-28, 15:11:35  
MD5: 5d01fec2a4764c0a4508f0cd9c6c5644  
SHA1: 7d7d62290b2bc6bf0648f220b52c0f6338b4f6d4  
SHA256: ce03b069d8a8749b0c568344d0ac1e0d40cf2bc0197f2c7b372621628d993292  
CRC32: 98321f21



## 2023-11-23
- ♻️: Adjusted class portraits
- ♻️: Adjusted shop-sold potions
- ♻️: Lowered the stats on the rune item Wealth (财富) (only affects new drops)
- 🐛: Fixed the charm MOD causing crashes when sorting equipment
- 🗑️: Removed the 2-set-piece and 4-unique synthesis recipes (too many items caused crashes)
- 🗑️: Cleaned up a large amount of invalid SPAWNCLASS content
- 🗑️: Removed thrown-type artifacts (recipes, models, textures, projectiles)
- ✨: Raised the max LAN player count to 8



## 2023-11-18
- ♻️: Lost Fragments (遗失的碎片) → always identified
- ♻️: Removed the Demon Fall BOSS from the starting-area Echo Pass (ECHOPASS)
- ♻️: Adjusted shop-sold potions
- 🐛: Fixed the necromancer's skeleton soldiers losing their weapons
- 🐛: Fixed artifact synthesis issues

## 2023-11-17
After this update, multiplayer is supported  
**Known issues:**  
The multiplayer Dark World must be refreshed manually — walking in and out does not refresh it  
The Phase Beast portal in ACT5 does not support multiplayer yet; temporarily removed, solution TBD
The POE maps sold by the Mafa Continent (玛法大陆) Exile do not support multiplayer yet; temporarily removed, solution TBD

- ✨: Added a (temporary) visual effect when using class specialization scrolls
- 💬: Corrected the Stone of Jordan description
- 💬: Translation fixes
- ♻️: Adjusted ACT teleport scrolls
- ♻️: Unified HEALTH/MANA POTION naming
- ♻️: Book of Infinity (无限之书, the Fallen mini-shop): removed invalid content
- ♻️: Adjusted shop-sold SPAWNCLASSes
- ♻️: Adjusted the Exile shop's SPAWNCLASSes
- 🗑️: Removed the Mafa Continent instruction-manual socketable
- 🗑️: Removed invalid SPAWNCLASSes
- 🗑️: Removed the random-equipment coin and the Coin of Destruction; updated the related recipes and SPAWNCLASSes
- 🗑️: Removed the IMBA commemorative coin
- 🗑️: Removed DUNGEONs that do not support LAN
- 🗑️: Removed content whose HASH is identical to vanilla
- 🗑️: Removed infinite potions [may be restored later]

## 2023-11-13
- ♻️: [Ash Warlock (灰烬术士)] - [Thunderburst Charge (雷爆冲锋)] removed the shield/armor value scaling, reverted to vanilla TL2 stats
- ♻️: Removed invalid growth-stat AFFIXes from the Sterk War Crossbow (斯特尔克战弩) and the Warglaive of Azzinoth (埃辛诺斯战刃); stats raised as compensation
- ♻️: Removed invalid growth-stat AFFIXes from lightsabers
- 🐛: Fixed the wrong name on the map factory teleport scroll (both the Imp King (小鬼王) and the Book of Infinity now sell it)
- 🐛: Fixed the missing icon on Famine Bloodbone (饥荒血骨)
- 🐛: Fixed missing equipment icons on some summons (skeleton soldiers)
- 🗑️: Removed the Enchanter [Horse] (附魔师【马】)
- 🗑️: Removed the Jungle Hunter's starter texture equipment
- 🗑️: Removed the Star* items (missing textures caused crashes)
- 🗑️: Removed duplicate Star Wars files
- 🗑️: Removed pure and normal amber

## 2023-11-08
- 💬: Corrected specialization-system quest descriptions
- 💬: [Shadow Ninja (暗影忍者)] fixed a skill-tree name mismatch
- 💬: [Shadow Ninja] - [Bloodthirsty Execution (嗜血处决)] corrected the skill description
- ♻️: [Shadow Ninja] - [Bloodthirsty Execution] removed the move-speed and energy gains; the 2% four-attribute gain raised to 3%; duration extended
- ♻️: Reworked the class-screen portraits


## 2023-11-05
Extra note: if you have `growable artifacts` in your inventory, equipment slots, or personal/shared stash, selling them is recommended (in theory they disappear automatically, but if you cannot enter the game, use the old MOD to delete them first, then switch to the new MOD)  
Specialization system: the specialization selection screen is gone — just use a scroll to switch specializations, no relog needed
- 🐛: Removed unmatched items from recipes (Supreme Adaptation (至尊适配))
- ♻️: Adjusted (reduced) the starter-pack rewards
- ✨: Added class specialization scrolls (used to pick a class specialization)
- ✨: The specialization NPC now sells class specialization scrolls
- 🗑️: Removed unused specialization translation content
- 🗑️: Removed the sidebar specialization button
- 🗑️: Removed the old Diablo 3 gem AFFIXes
- ✨: Added placeholder AFFIXes
- ♻️: Removed and reworked the Eternal Heart (永恒之心) growth series
- ♻️: Removed `growable artifacts`
- 🗑️: Removed the specialization UI screen and unused STATs
- 🗑️: Removed the Enchanter (Horse)'s chance to grant growth enchants (AFF and STAT)
- ♻️: Adjusted charm prefixes

## 2023-11-04
Only the `挑战者大陆--暗黑传奇.MOD` (Challenger Continent — Diablo Legacy) file needs updating
Extra note: equipment vanishing while enchanting in the room happens because some enchanters leave after one enchant — if your equipment happens to be lying inside, they take it with them
- ✨: Added a synthesis master to the Secret Realm (秘密境域, the test room)

## 2023-11-03
Only the `挑战者大陆--暗黑传奇.MOD` (Challenger Continent — Diablo Legacy) file needs updating
- ♻️: Lucky coins and dice no longer drop
- ✨: Added a personal-stash button to the sidebar


## 2023-09-28
Consider picking up blue items — some of them may be decent  
Known issue: because a large number of Dimension items were removed, some classes may spawn without a weapon; a later update will fix this  
- ♻️: [Overwatch] active-type stance skills' CD adjusted to 10s
- 🐛: [Wolf Soul Ritualist (狼魂祭祀)] - [Sacrifice: Resistance (祭祀-抵抗)] fixed a wrong T0 bonus
- ♻️: Adjusted the **Nephalem Rift (涅法雷姆秘境)** — now sold by the Imp King, no longer limited to the ACT1 town
- 💬: Corrected test-area translations
- 🗑️: Removed Dimension fragments and items (kept only the flamethrower and sniper rifle [the latter actually lives in ADD_SNIPER])
- 💬: Adjusted the names of blue-item AFFIXes
- 🗑️: Removed leftover Dimension fragment files
- ✨: Added the test room scroll (a.k.a. Secret Realm), sold by the Imp King
- 🗑️: Removed the blue health potion and the skill-reset potion from Supreme Adaptation
- 🗑️: Removed duplicate test-room files

## 2023-09-27
- ♻️: [Elemental Assassin (元素刺客)] - [Whirlwind Venom Dance (旋风毒舞)] reworked: 480% weapon DPS at max level, 5-second cooldown, per-hit damage increased
- 💬: [Elemental Assassin] [Four-Element Enchant (四系附魔)] description corrected
- 💬: [Elemental Assassin] [Frost Wolf Counter (寒狼反击)] description corrected (summons a frost wolf to counter enemies attacking you in melee range)
- ♻️: [Elemental Assassin] - [Thundercloud Storm (雷云风暴)] reworked: damage adjusted, cooldown reduced from 60s to 30s
- 🐛: Fixed the type of 5 legendary swords (they should be legendary one-handed swords)  
Unicorn's Angel Longsword (独角兽的天使长剑)  
White Swan (白鹄, the sword once used by Tio, one of the Four Pirates)  
Starter Set - Dragon-Slaying Saber (新手套装-屠龙宝刀)  
Natalya's Shadow Blade (娜塔亚的影刃) - ★Primordial Legacy (太古遗产)★  
Natalya's Piercing Blade (娜塔亚的刺刃) - ★Primordial Legacy★  
This bug was known to prevent the Azure Lotus Sword Immortal from using sword skills while wielding these weapons
- ♻️: Renamed the IMBA Lucky Gem — the craftable one stays the same; the other is renamed [Elemental Torment (元素折磨)] with a new icon (existing items keep their names; only new drops are affected)
- ♻️: Adjusted Supreme item drops
- 🐛: Fixed some Supreme-series affixes buffing enemies (may cause existing items to disappear)
- 🐛: Fixed some Ancient Ninefold Frost set (上古·九重寒冰套) affixes buffing enemies (may cause existing items to disappear)

## 2023-09-26
Just overwrite the old files with this update 
- ♻️: [Elemental Assassin] - [Four-Element Enchant] reworked
- 🐛: [Temple Guardian (圣殿守卫)] - [Phoenix Rebirth (凤凰重生)] fixed a wrong cooldown
- ♻️: [Elemental Assassin] - [Passive: Swift Thunder (被动-迅雷)] buffed (dual-wield damage and attack speed both scale at 400% of skill level)

## 2023-09-22
Just overwrite the old files with this update  
- 🐛: [Wolf Soul Ritualist] - [Passive: Power Strike (被动-强击)] fixed the skill not working with claw weapons equipped
- ♻️: [Plague Lord (瘟疫之主)] - [Desecration: Swarm (亵渎-蜂涌)] no longer summons a bone prison; the level-15 T3 skill bonus raised to 200% weapon DPS
- ♻️: [Wolf Soul Ritualist] - [Werewolf Bones (狼人白骨)] description corrected: added bone prison CD and duration text; trigger chance scales with skill level up to 16%
- 🐛: [Wolf Soul Ritualist] - [Passive: Flame Claw (被动-焰爪)] fixed the missing UNITTHEME when triggering the burn
- 🚀: Increased the duration of [Omni Walker (全能行者)] - [Charge Skill: Blade Dash (冲锋技能-剑刃冲刺)]'s on-hit move-speed bonus (2S->5S)
- ♻️: [Omni Walker] - [Charge Skill: Blade Dash] reworked — no longer a channeled skill, the dash animation now makes sense, fixed the enemy DEBUFF not applying, scales at 500% DPS at level 15
- ♻️: [Overwatch] - [Assassination: Blade Dash (刺杀-剑刃冲刺)] reworked — no longer a channeled skill, the dash animation now makes sense, fixed the enemy DEBUFF not applying, scales at 500% DPS at level 15

## 2023-09-21
This update requires overwriting the old files  
It also requires performing the following with the OLD MOD (version `挑战者大陆20230919(完整)`) first:  
If you have learned `恶狼猛击` (Dire Wolf Smash) or `暗影爆发` (Shadow Burst) in your spell slots, unlearn them, or the game will not load  
If you have `恶狼猛击` or `暗影爆发` skill scrolls in your equipment slots or stash, discarding/selling them is recommended (untested)
- 🐛: Fixed the skill scroll [Shadow Burst (暗影爆发)] teaching a different skill than stated
- 🐛: Fixed the StarCraft fist-weapon skill triggering multiple times and causing frame drops
- 💬: Adjusted MU recipe display
- 🐛: Fixed rune synthesis recipes missing icons and therefore not showing in the synthesis master's list
- 💬: Fixed extra text displayed on the Warcraft ultimate weapons
- 💬: Translation polish
- ✨: [Item drops] item drop levels are now more reasonable?
- 🐛: Fixed the [Nether (冥)] Frostmourne's icon not matching its model
- 💬: Adjusted the wording of the 50-Lost-Fragments synthesis recipe
- 🗑️: Removed skill-level bonuses from Demon Fall drops (e.g. +2 ??? skill levels) (only affects newly dropped items)
- 🐛: Fixed missing icons on Demon Fall weapons such as Dragon Slayer** (屠龙者**) — now renamed Ancient Xuanyuan Sword (Broken) (远古轩辕剑(残))
- 🐛: [Azure Lotus Sword Immortal] fixed the starting character having no weapon
- 🐛: [Wolf Soul Ritualist] - [Totem Shelter (图腾庇护)] fixed the skill description not matching the actual effect; the T1, 2, 3 bonuses now apply correctly
- 🚀: Increased the damage-reflect values of [Unicorn (独角兽)] - [Hurricane Armor (飓风装甲)] and [Wolf Soul Ritualist] - [Totem Shelter]: 250% reflect against ranged at level 15
- 🐛: Corrected the descriptions of [Unicorn] - [Hurricane Armor] and [Wolf Soul Ritualist] - [Totem Shelter]
- 💬: [Omni Walker] [Charge Skill: Charge Assault (冲锋技能冲杀)] corrected the weapon-requirement description
- 🐛: [Omni Walker] - [Charge Skill: Blade Dash] fixed the enemy DEBUFF not applying, and the character disappearing without recovering when holding the key

## 2023-09-19
Just overwrite the old files with this update  
- ♻️: Lowered the [Witch Puppet (女巫傀儡)]'s max damage reduction to 75% (the original 115% made it damn near unkillable)
- 🐛: Fixed the skill scroll [Elemental Profit (元素获利)] actually teaching [Elemental Attunement (元素调和)]
- 💬: Translation polish (Elemental Boon renamed to Elemental Profit)
- 🐛: [Temple Guardian] - [Source of Fire/Ice/Lightning (火焰/寒冰/闪电之源)] fixed wrong skill descriptions
- 💬: [Temple Guardian] fixed a wrong skill-tree name
- 🐛: [Temple Guardian] - [Source of Ice] fixed the ice damage bonus being 0
- 🐛: [Lich Specialization (巫妖专精)] - [Frost Nova (霜之新星)] fixed the skill CD not matching the description
- 💬: [Bow God Specialization (箭神专精)] - [Tornado (龙卷)] description corrected
- 💬: [Blood Demon Specialization (血魔专精)] - [Death Strike (死亡之击)] description corrected
- 💬: [Ultimate Demon (极道天魔)] - [Summon Demon Spirit (唤灵魔灵)] description corrected
- 💬: [Temple Guardian] - [Ice Curse (寒冰诅咒)] description corrected
- 💬: [Omni Walker] - [Aura Skill: Serrated Shield (光环技能-锯齿盾牌)] description corrected
- 💬: [Ultimate Demon] - [Blood Spirit Cloak (血灵披风)] description corrected

## 2023-09-18
This update requires overwriting the old files  
It also requires performing the following with the old MOD first:  
If you have learned legacy (传承) spells in your spell slots, unlearn them, or the game will not load  
Legacy skill scrolls in your equipment slots need no action — testing shows they simply disappear  
If any are in your stash, discarding/selling them is recommended (untested)

- 🚀: [Strength/Dexterity/Focus/Vitality Divine Stones (神石)] changed from the original 10% boost to a random 25%-35% (existing stones are unaffected; only newly generated ones)
- 🐛: [Temple Guardian] - [Ice Curse] fixed the skill's DOT values not matching the design
- 🐛: [Peerless War God (绝世武神)] fixed the skill page going black (missing LAYOUT suffix)
- 🐛: [BETA] adjusted item-growth MIN_SPAWN_RANGE
- 🐛: [BETA] adjusted skill AFF MIN_SPAWN_RANGE
- ♻️: [Wolf Soul Ritualist] - [Wolf God: Bravery (狼神-勇敢)] duration changed from 10 min to 1 min (suspected buggy; this makes later tuning easier)
- 🎨: Translation polish
- 🎨: Recipe display translation polish
- 🎨: Spell display translation polish
- 🗑️: Removed legacy spells (crashes / corrupted saves / stutter for unknown reasons)
- ✨: [Specialization Legacy] the old legacy spells replaced with specialization skill legacies (Blood Demon / Sword Saint / Lich / Bow God) +5
- 💡: The Bow God legacy uses the DOTA2 `Drow Ranger` `Marksmanship` skill icon
- 💡: The Blood Demon legacy uses the DOTA2 `Bloodseeker` `Blood Rite` skill icon
- 💡: The Lich legacy uses the DOTA2 `Witch Doctor` `Paralyzing Cask` skill icon
- 💡: The Sword Saint legacy uses the DOTA2 `Juggernaut` `Blade Dance` skill icon
- 🐛: Fixed the item [Targo's * (塔格奥的*)] chest-armor description error and missing shield icon
- 🐛: [BETA] adjusted MIN_SPAWN_RANGE for various AFFs
- ♻️: [StarCraft fist-weapon skills] now all have a 500ms internal CD that ignores cast speed

## 2023-09-15
Just overwrite the old files with this update  
- 🎨: Translation polish
- 🎨: Changed the nonsensical drop effect on some Supreme Adaptation items to lightning
- 🎨: Added a new icon for the [Suicide Potion (自杀药水)]
- 🐛: Fixed the Eternal Holy Knight set's missing model/texture causing an instant crash when worn
- 🐛: Fixed the pet MOD causing a wrong Z-order for the recipe screen TOOLTIP (mostly caused by idiots stacking MODs in random order)
- ✨: [Potions] added a [Skill Reset Potion] (infinite) (comes with a note about mercenaries disappearing) (if you still ask where your mercenary went, have your grade-school teacher take you in for a brain MRI)
- ✨: [Book of Infinity] the spawn-point shop now sells the [Skill Reset Potion]
- ✨: [Imp King] the shop now sells the [Skill Reset Potion]
- 🚚: Skill file cleanup and migration (PALADIN_CHARGE_TOOLTIP)
- 🚚: Specialization skill file cleanup
- 🗑️: Removed a duplicate specialization-skill scroll SPAWNCLASS
- 🗑️: Removed leftover unused content in the specialization skill UI files
- 🐛: Fixed a display error in the specialization skill [Sword Saint] [Holy Sword Descent (圣剑天降)]
- 💬: [Bow God Specialization] skill description corrections
- ✨: [Bow God Specialization] - [Tornado] added new learn and upgrade icons
- ♻️: Cleaned up the skill-tree UI for all classes; removed the skill-reset page and class introductions
- ♻️: [Miracle Set (奇迹套装)] slightly raised the Miracle Set drop rate (will be dialed back once recipes are added)

## 2023-09-14
Just overwrite the old files with this update  
- ✨: Added a new enrage effect for ghost-type monsters (a bagua array with orbiting paper talismans)
- ♻️: Black & White Impermanence, Ox-Head & Horse-Face, the Zombie Emperor, and the Black & White Ghosts: move speed reduced, enrage skills adjusted, enrage HP trigger raised (30%->45%)
- ♻️: Lowered the SSS BOSS max damage reduction to 75% (was 100%)
- ✨: [Wolf Soul Ritualist] added a full-energy visual effect
- ✨: [Imp King] the shop now sells suicide drinks
- ✨: [World BOSS] world BOSS attacks can now display the armor-shred and bleed icons
- 🐛: [Wolf Soul Ritualist] fixed duplicated text in the energy bar's TOOLTIP (other classes may have the same issue)
- 🎨: Translation polish
- 🐛: Attempted a fix for the recipe screen TOOLTIP rendering behind the UI for some players
- 🧑‍💻: chore
- 🐛: Fixed the missing Frostmourne model

## 2023-09-13
Just overwrite the old files with this update  
- 💬: Translation polish (attribute/HP/MP percentage-gain descriptions) Less Confusing
- 💬: Skill description corrections
- 🐛: [Wolf Soul Ritualist] - [Toxic Burst (剧毒爆发)] fixed the skill mismatch and wrong DPS scaling; added a more visible particle effect
- 💬: [Wolf Soul Ritualist] - [Wolf Shadow Pact (狼影契约)] description corrected
- 💬: Corrected the [Flame Rebirth (火焰复生)] skill name
- 🐛: Fixed the Miracle Set's set-bonus HP boost being wrong
- 🐛: Fixed the Miracle Set's set-bonus skill showing as question marks (wrong skill name; the actual skill is [Blade Slash (斩刃)])

## 2023-09-12
Just overwrite the old files with this update  
- 🎨: Added new icons for the Atlantis Fragment / Heart of Atlantis
- 💬: [Assassin Battle Soul (刺客斗魂)] - [PASSIVE] - [Iron Shadow (铁影)] description corrected
- 🗑️ : [Assassin Battle Soul] - [PASSIVE] - [Iron Shadow] removed an ineffective dual-wield requirement
- ♻️ : [Elemental Assassin] - [Lightning/Ice/Fire Enchant (闪电/寒冰/火焰 附魔)] fixed the skills' strength scaling
- 💬: [Assassin Battle Soul] skill description corrections
- 🗑️ : [Assassin Battle Soul] - [PASSIVE] - [Shadow Stab (影刺)] removed an ineffective dual-wield requirement
- 💬: [Assassin Battle Soul] - [PASSIVE] - [Master Thief (神偷)] renamed to [Phantom Thief (鬼影神偷)]; description corrected
- 🗑️: Removed a duplicate skill file — [Assassin Battle Soul] - [Static Guard (电能守卫)]
- 🐛 : [Assassin Battle Soul] - skill - [Static Guard] fixed the skill damage not scaling correctly with energy
- 💬: [Assassin Battle Soul] skill translation corrections
- ♻️ : [Assassin Battle Soul] - skill - [Trap Master (陷阱大师)] raised the scaling of trap damage with character DPS
- ♻️ : [Shadow Ninja] - skill - [Shadow Talent: Sharing (暗影天赋-共享)] raised shadow DPS, from the original 0.35% to 65% of max DPS
- ♻️ : [Shadow Ninja] - skill - [Assassin: Whirlwind Shuriken (刺客-旋风飞镖)] raised the DPS scaling; removed an ineffective energy gain
- ♻️ : [Shadow Ninja] - skill - [Passive: Spirit (被动-精神)] fixed the DUMMY regen not working; values adjusted
- 💬: Fixed a difficulty-name translation conflict
- 💬: Updated the Thunder Sword Intent (雷霆剑意) skill description
- 💬: Updated the Heart Soul Mind (心魂念) skill description

## 2023-09-11
- 🐛: Fixed mercenaries not casting skills
- 🐛: Corrected the starter-pack chest GUID
- 🐛: Fixed the Atlantis Sacred Shield being shattered while equipped on the player
- 💬: Minor translation display tweaks
- 💬: [Supreme Adaptation] improved the wording of the legendary fashion-fragment synthesis recipe
- 🗑️: Removed the bikini fashion outfit
- 💬: Corrected the Diablo 3 set descriptions
- ♻️ : [Shadow Ninja] - skill - [Passive: Spirit] fixed the DUMMY regen not working; values adjusted
- ♻️ : [Shadow Ninja] - skill - [Assassin: Whirlwind Shuriken] raised the DPS scaling; removed an ineffective energy gain
- ♻️ : [Shadow Ninja] - skill - [Shadow Talent: Sharing] raised shadow DPS, from the original 0.35% to 65% of max DPS

## 2023-09-10
- 🐛: Fixed 3 socketable synthesis recipes; fixed the 50-Lost-Fragments synthesis recipe
- 🐛: Fixed Supreme Adaptation recipes not being remembered after a relog (missing GUID)
- ♻️: Starter pack tweaks

## 2023-09-09
Replace whichever files the update package contains  
The following changes will make existing `祝福/力量/敏捷/专注/体力 神石` (Blessing/Strength/Dexterity/Focus/Vitality Divine Stones) disappear  
**Carefully check and delete any of these Divine Stones already in your save's inventory — including ones socketed into equipment!!!**  
**Sell them to a shop, relog, and they are gone**  
**First load the old MOD and dispose of (drop/sell) these Divine Stones, then save and exit to menu --> re-enter the game --> exit again**  
**After that you can delete the old MOD and load the save with the new MOD**  
**Otherwise the save will fail to load and crash**
- 🐛: Fixed rune name translations displaying incorrectly
- 🐛: Fixed the `Demon Fall` item `Eternal Tear [Life] (永恒之泪[生命])` not gaining its BOSS-kill growth stats
- 🐛: Fixed the `Supreme Adaptation` `Strength/Dexterity/Focus/Vitality/Blessing Divine Stones` being stackable and therefore infinitely reusable  
This also avoids the game crashing when merging these stones
- ♻️: For the reason above, the `Blessing Divine Stone` is renamed `Blessing Scroll`, stackable to 999
- ♻️: The `Strength/Dexterity/Focus/Vitality Divine Stones` were too IMBA — boost reduced from `50%` to `10%`
- 🎨: Made new icons for the `Blessing Scroll` and the `Strength/Dexterity/Focus/Vitality Divine Stones` — the old art was hideous beyond words
- 🎨: `****施放技能` ("casts skill") lines are now highlighted for all skills, color HEX #fb923c
- 🎨: `持续时间` ("duration") lines are now color HEX #ecfeff
- 🐛: Fixed BOSS-type monsters generating two description lines under the target health bar

## 2023-09-08 (first public-beta release)
- 🐛: Fixed items unable to drop due to GUID conflicts (around 30 weapons in the nerf pack)
- 🗑️: Removed extra/duplicate weapon models
- 🎨: Reduced the color saturation of weapons in the nerf pack
- 🐛: Fixed `神圣之手弩` (Holy Hand Crossbow) drops
- 🐛: Fixed `暗黑-黑色水银及LIN Set Items` (Diablo Black Mercury and LIN set items) drops
- 🐛: Fixed a `SCROLL SUMMON` error
- 🐛: Fixed some Maya runestones having lower stats at higher levels
- 🎨: Unified the icon order of the Maya runestones
- 🎨: Unified rune icon files
- 🐛: Fixed a wrong AFFIX on the Primordial Legacy `塔拉夏的元素共享` (Tal Rasha's Elemental Sharing)
- 🐛: Fixed the name display of the Primordial Legacy `利维坦之剑` (Sword of Leviathan)
- 💬: Corrected skill color translations
- 💬: Removed the "stats text" from `Dimension gear` descriptions (everyone can wear them by stats anyway)
- 🗑️: Removed some `IMBA instruction socketables`
- ♻️: Removed the newbie instructions, added a starter pack (high-tier Silence-series runes and a rare fixed-level `Hope Tang Saber (希望唐刀)`)
- 🐛: Fixed the `甜腻药水` (Saccharine Potion) failing to kill
- 💬: Corrected the incorrect `甜腻药水` translation
- ♻️: Elemental Assassin - Venom Enchant - corrected the skill's strength scaling
- 🗑️: Removed skill files with no references / invalid references
- 🗑️: Removed a duplicate fist-weapon skill (Diablo already has it at higher priority)
- 🗑️: Removed duplicate TAG properties in SKILL files
- 🗑️: Removed corrupted skill files
- 🗑️: Removed the corrupted skill MANA DRAIN
- 🗑️: Removed the skill file IAZU with no references / invalid references
- 💬: Removed the "early-game viability" and "handling index" text descriptions

## 2023-09-05
- 🐛: Legendary War God skill fixes
- 🐛: Recipe fixes
- 🐛: Translation error fixes
- 🐛: De-duplicated translation content
- 🐛: Temple Guardian skill fixes
- 🐛: Wolf Soul Ritualist skill fixes
- ♻️: Normalized some skill files and descriptions
- 🐛: Fixed a large number of recipe file issues


## 2023-08-28
- 🗑️: Removed ancient gear, keeping only jewelry, armor pieces, and shields
- 📈: Reduced monster attack power in the 3S Purgatory (炼狱) and Heavenly Prison (天狱) difficulties (by 90%); HP and armor increased
- ♻️: Reset the spawn-point chest GUID and model (prevents being one-shot after adding Challenger)
- ♻️: Jordan Coin renamed Stone of Jordan; fixed the MU Archangel Sword name; named the Meteoric Iron Stone of Jordan; fixed NPC textures
- ♻️: Tidied up the town's Imp King
- 🎨: Removed smart tags
- 💬: Massive skill text/description updates
- ♻️: "Hero" uniformly renamed "mercenary"


## 2023-08-24
- 🚀: [Mikuro] Added a large batch of AFFIX equipment effects (high weight, for testing)
- 🐛: Fixed the pet Inventory button not working, plus other bugs
- ♻️: Restored class requirements on skill TAGs
## 2023-08-23
- 🐛: Randomly assigned new GUIDs to STATS files, fixing Potential growth not working
- ♻️: (Diablo)(gear): [Super Meteoric Iron gear] reduced the move-speed penalty
- ♻️: (Diablo)(mechanics): [Revive] reduced the revive-in-place move-speed bonus; removed the cast/attack-speed penalty
- 🚚: (Diablo+classes)(files): [NULL] migrated scroll files
- 🗑️: (Diablo)(files): [NULL] removed hero-system leftovers (HUMAN AS PET)
- 🐛: Fixed smart tags not working
- 🐛: Fixed the MTJEW AFFIX not working
- 🗑️: Removed the football and related content
- 🚚: Recipe file cleanup
- 🎨: Fixed recipe icons
- 🗑️: Removed the Diablo 3 gems
- 🚀: [Mikuro] Lost Atlantis Collection
- 🚀: [Mikuro] Spirit Stones
- ✏️: [Mikuro] Fixed a TYPO in the Lost Atlantis Collection
- 🚚: Migrated UI files
- ♻️: Rebuilt the smart inventory
- 🗑️: Removed the class requirement on the Heart Soul Mind gear
- 🎨: (class skills)(UI): improved sidebar button positions
- 🎨: (class skills)(UI): improved the recipe screen
- 🗑️: Removed the NG+ scale on equipment
- 🚚: Migrated non-primary-town LAYOUT files
- 🐛: Fixed an age-old bug — the large chest's equipment tab not following the character's equipment-tab switching
- 🎨: Simplified the ACT1 newcomer-welfare messagebox

## 2023-08-19
- 🎨Removed the large chest's nonsense description

## 2023-08-18
- 🚀Every MOD now has a GUID different from the original version (avoids conflicts with the original MODs that would keep the MOD launcher from identifying files correctly)
- 🎨(hero system) Every hero skill plaque now has its own skill description
- 🗑️Removed fashion-system leftovers
- 🐛(Challenger plugin) Fixed the clothing display of dark humanoid monsters

## 2023-08-15
- 🗑️Removed the fashion system (it caused some weird bugs)
- 🐛Fixed the Shadow Ninja spawning without a weapon
- 🚚MOD file cleanup and migration
- **Removed the post-rebirth equipment-level increase (removed because mixed old/new equipment and gem drops caused confusion)**
- 🐛Assorted miscellaneous fixes
- 🚚Vanilla Torchlight 2 equipment class requirements moved to a separate PAK file

## 2023-08-10
- 🐛Fixed Invalid Hierarchy
- 🗑️Removed the light-pillar effects from Unique, Primordial, Ancient, MU, easter-egg, Meteoric Iron, and legendary items (they hurt FPS)
- 📈GRAPHS: increased monster HP in the Heavenly Prison and Purgatory difficulties
- 📝Updated the MOD-unbind menu text
- 🐛Fixed Invalid GUID
- 🗑️Removed monsters with invalid references

## 2023-08-05
- 📈GRAPHS: reduced the XP requirements for leveling past 100
- 🗑️Removed duplicate NPCs
- 🐛Fixed the Mafa Continent Exile NPC's voice-line errors
- 🗑️Removed a corrupted TEXTURE_REPLACE section
- 🗑️Removed invalid DDS file references

## 2023-08-04
- 🎨Normalized synthesis-recipe UI LAYOUT file naming (easier future updates)
- 👹Slightly buffed Diablo's (大菠萝) (main body/clone) HP and armor
- 🗺️Reduced Nephalem Rift monster density v1.0
- 🗑️Removed leftover hero-system (Brother-in-Arms: Warbounds) files from Diablo Legacy
- 🛡️Fixed the Hope Tang Saber's stats (the original lightning stats were over the cap)
- 🛡️Fixed inheritance issues on some equipment (hand crossbows, ancient fist weapons, Dimension one-handed swords)
- 🛡️Fixed the Invalid GUID issue on Runeword Gloves 01 and the Lost Maya Runestone Frost Slash level 1

## 2023-08-02
- 🐛Fixed missing/mismatched MESH/ICON files on some equipment
- 🐛Formatted the Lost Maya Runestone skill descriptions and fixed some skills
- 🐛Fixed Targo's Guardian (塔格奥的守护) drops; Tal Rasha's Elemental WAND now belongs to the Tal Rasha's Wrappings set

## 2023-08-01
- 🐛Fixed all known TAGs with corrupted hashcodes
- 🐛Fixed all known GUID conflicts
- 🐛Fixed all known item-name (internal, not display name) conflicts
- 🐛Fixed Lost Maya Runestone naming and some skills not taking effect
- 🐛Fixed missing visual-effect skills on the StarCraft-series equipment

## 2023-07-31
- 🐛Fixed missing four-attribute requirements on equipment
- 🐛Fixed duplicated and partially missing gem AFFIXes
- 🗑️Removed the football gem and some useless gems (one football kept — crafting the World Cup Trophy is unaffected)

## 2023-07-27
- 🔀The IMBA dedicated patch 1.2 is now merged into the class skills; the old dedicated 1.2 patch can be discarded
