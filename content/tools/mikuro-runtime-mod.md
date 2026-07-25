---
title: "MIKURO 游戏增强 · 内容"
date: 2026-07-23T21:07:44+10:00
author: "Mikuro"
summary: "「MIKURO 游戏增强」随启动器挂载的配套内容 MOD:青莲灵石(冷却系 / 上限突破双效)、镶嵌孔 5→10、御兽嘲讽——完整机制与获取方式以本页为准。"
weight: 2
params:
  rarity: "legendary"
  icon: "gem"
  typeline: "传奇 · 运行时内容 MOD · 青莲灵石体系"
  affixes:
    - "青莲灵石:三阶冷却主线(聚灵 / 凝华 / 太虚)+ 四颗「属性 + 上限」双效突破石 + 嗜血"
    - "镶嵌孔悬浮显示 5 → 10(引擎无 5 孔上限,对 5 孔内装备无影响)"
    - "御兽嘲讽:项圈 + 嘲讽令,宠物拉 10m 仇恨 4 秒"
    - "游戏内物品描述刻意精简,完整机制与获取方式以本页为准"
  flavor: "刷图凝玉,熔铸成灵。"
  status: "随「游戏增强」常开"
  metaline: "运行时挂载 · 单人 / 房主"
---

## 简介 · Overview

**MIKURO 游戏增强内容**是随 [Mikuro 启动器](/tools/mikuro-launcher/) 的「**MIKURO 游戏增强**」开关自动挂载的配套内容 MOD。除掉落过滤、存档修复等**运行时功能**外,它还往游戏里加入一整套青莲灵石体系、扩展的镶嵌孔显示与御兽嘲讽。游戏内的物品描述已刻意精简,**完整机制与获取方式以本页为准**。

## Ⅰ 镶嵌孔显示 5 → 10 · Sockets

物品悬浮框最多可显示 **10 个镶嵌孔**。原版界面只画了 5 行,引擎本身并没有 5 孔上限;对 5 孔以内的普通装备无任何影响。

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅱ 青莲灵石 · 冷却系(疾速灵石) · Haste

只认 <mark>武器 / 头盔 / 护手 / 盾</mark> 四类部位,每件装备最多生效 **2 颗**(双手武器 **4 颗**)——堆孔无用,须以质取胜。

| 灵石 | 冷却缩减 | 获取方式 |
|---|---|---|
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 青莲·聚灵 | 1% – 5% | 青莲玉髓 ×9 初铸,随机开出 1–5%(数值越高越稀有) |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 青莲·凝华 | 6% – 11% | 同数值聚灵 ×9 重铸,随机开出 6–11%(数值越高越稀有) |
| <img class="gem-px" src="/img/gems/taixu.png" alt=""> 青莲·太虚 | 15%,另附全部伤害 +50% | 11% 凝华 ×9 顶铸(固定产出) |

- 升阶链:**<img class="gem-px" src="/img/gems/jade.png" alt=""> 青莲玉髓 ×9 → 聚灵(随机 1–5%)→ 同级 ×9 → 凝华(随机 6–11%)→ 11% 凝华 ×9 → 太虚**;低档聚灵永不作废,凑满 9 枚同档即可回炉再赌
- 青莲玉髓由怪物随机掉落(可堆叠);集齐后在炼金师处熔铸,首次投入正确材料即自动习得配方
- 多颗为乘法叠加:实际冷却 ＝ 原冷却 × ∏(1 − 每颗% ÷ 100)。例:镶 3 颗 5% → 原冷却 × 0.95 × 0.95 × 0.95 ≈ 0.857,合计约 **−14.3%**(而非直加的 −15%)

**熔铸概率** —— 每次熔铸独立随机,不保底、不累积:

| 初铸 · <img class="gem-px" src="/img/gems/jade.png" alt=""> 玉髓 ×9 开出 | 概率 |
|---|:-:|
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 聚灵 1% | **40%** |
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 聚灵 2% | 28% |
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 聚灵 3% | 18% |
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 聚灵 4% | 10% |
| <img class="gem-px" src="/img/gems/juling.png" alt=""> 聚灵 5% | 4% |

| 重铸 · <img class="gem-px" src="/img/gems/juling.png" alt=""> 同档聚灵 ×9 开出 | 概率 |
|---|:-:|
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 6% | **38.9%** |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 7% | 27.2% |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 8% | 17.5% |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 9% | 9.7% |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 10% | 4.7% |
| <img class="gem-px" src="/img/gems/ninghua.png" alt=""> 凝华 **11%** | **1.9%** |

- **顶铸**(11% 凝华 ×9 → 太虚)和突破线的五条熔铸一样是**固定产出**,不赌。
- 聚灵的档位只决定它自己镶嵌时的数值;**重铸时投入哪一档,开出的凝华分布都相同**——攒够 9 枚同档就可以直接下炉,不必留着高档聚灵。
- 期望量级:1 颗聚灵 ≈ 9 玉髓(约 210 只精英/BOSS),1 颗凝华 ≈ 81 玉髓(约 1,900 只)。11% 凝华单次仅 **1.9%**,凑满 9 枚做太虚属毕生目标级投入,途中开出的低档凝华照常可用。

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅲ 青莲灵石 · 上限突破与特效 · Cap-break

> **突破系四颗现已「属性 + 上限」双效**:每颗在提供 +X% 该属性的同时,把对应上限也抬高等量的 +X%(下表「每颗」列即这一数值,属性与上限同增),让上限恰好容纳——镶上即见效,不必先堆到原版上限才有用。

| 灵石 | 效果 | 每颗 | 上限 | 镶嵌部位 |
|---|---|---|---|---|
| <img class="gem-px" src="/img/gems/jingang.png" alt=""> 青莲·金刚 | 全伤减免 + 减伤上限突破(原版 75%) | +2.5% | 95%(8 颗到顶) | 不限 |
| <img class="gem-px" src="/img/gems/fengying.png" alt=""> 青莲·风影 | 闪避 + 闪避上限突破(原版 75%) | +2.5% | 95%(8 颗到顶) | 不限 |
| <img class="gem-px" src="/img/gems/xuanwu.png" alt=""> 青莲·玄武 | 格挡 + 格挡上限突破(原版 75%) | +2.5% | 85%(4 颗到顶) | <mark>武器 / 头盔 / 护手 / 盾</mark> |
| <img class="gem-px" src="/img/gems/liehun.png" alt=""> 青莲·裂魂 | 暴击伤害 + 暴伤上限突破(原版 500%) | +25% | 不封顶 | 不限 |
| <img class="gem-px" src="/img/gems/shixue.png" alt=""> 青莲·嗜血 | 暴击时吸取伤害为生命 | 2.5% | — | 不限 |

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅳ 御兽嘲讽 · Beast Taunt

| 物品 | 说明 |
|---|---|
| <img class="gem-px" src="/img/gems/xiangquan.png" alt=""> 青莲·御兽嘲讽项圈 | 宠物项圈装备;佩戴后宠物方可响应嘲讽令 |
| <img class="gem-px" src="/img/gems/modian.png" alt=""> 魔典:御兽·嘲讽令 | 使用后学会主动技能:周围 10m 的敌人转而攻击你的宠物,持续 4 秒 |

> 项圈和嘲讽令**分别判定**,可能同时掉、也可能都不掉。BOSS 各 **1%**(【史诗·传说级】翻倍);两者现已进入通用掉落池,其它渠道也可能出 —— 完整数值见 §Ⅴ。青莲灵石的设计取舍详见[完整设计稿](/ideas/qinglian-haste-lingshi/)。

<div class="diamond-rule"><span>◆ ◆ ◆</span></div>

## Ⅴ 材料掉落 · Drops

两条铸造线共用的根料全部由怪物掉落、可堆叠。下表为**每只怪的实际概率**。

| 材料 | 归属 | 杂兵 | 精英 | BOSS | 史诗·传说级 ★ | 地图BOSS ★★ |
|---|---|:-:|:-:|:-:|:-:|:-:|
| <img class="gem-px" src="/img/gems/jade.png" alt=""> 青莲玉髓 | 冷却线 · 根料 | 0.08% | **4.26%** | **4.26%** | **4.46%** | **7.78%** |
| <img class="gem-px" src="/img/gems/jiehui.png" alt=""> 青莲·劫灰 | 突破线 · 通用根料 | 0.04% | 2.13% | **4.18%** | **6.32%** | 3.89% |
| 五系符(指定某一种) | 突破线 · 引子 | 0.006% | 0.24% | **0.38%** | **0.42%** | **0.65%** |
| <img class="gem-px" src="/img/gems/xiangquan.png" alt=""> 御兽嘲讽项圈 | 御兽嘲讽 | — | — | **1%** | **2%** | — |
| <img class="gem-px" src="/img/gems/modian.png" alt=""> 魔典:御兽·嘲讽令 | 御兽嘲讽 | 0.009% | 0.25% | **1.25%** | **2%** | **5.2%** |

★ 【史诗级】【传说级】BOSS 来自「群魔堕落」组件 —— 那批怪本就"为高手准备",材料掉率给**双倍**。
★★ 地图BOSS 指「暗黑传奇」的秘境 / 地图工厂 BOSS。项圈另可从宠物项圈掉落池出(约 2.7%)。

- **想攒材料就打硬怪**:杂兵到精英之间差约 **50 倍**,刷精英和 BOSS 的效率完全不是一个量级。
- **劫灰**每次命中固定 1 枚(BOSS 是 4.18% 命中,不是必掉)。
- **符为随机池**:命中「符」时从下列五符中**随机开出一种**,上表已是**指定某一种**的概率。
- **不再只从怪物掉** —— 这批材料现已进入通用掉落池,桶、箱子、地上的杂物也可能出,商人货架上同样会上架(见下方售价)。

### 商人售价

材料现在可以直接买,但价格是**金币黑洞**级别的 —— 设计上是保底途径,不是捷径。价格随物品等级线性上涨,下表按**等级 100** 计:

| 物品 | 买价 |
|---|---:|
| <img class="gem-px" src="/img/gems/jade.png" alt=""> 青莲玉髓 | **900 万** |
| <img class="gem-px" src="/img/gems/jiehui.png" alt=""> 青莲·劫灰 | 1,800 万 |
| 五系符(每张) | 2,700 万 |
| <img class="gem-px" src="/img/gems/modian.png" alt=""> 魔典:御兽·嘲讽令 | 1,800 万 |
| <img class="gem-px" src="/img/gems/xiangquan.png" alt=""> 御兽嘲讽项圈 | **900 万** |

同一件东西在 1 级时约为上表的 1/19,180 级时约 1.77 倍。

五系符各对应一颗突破石:

| <img class="gem-px" src="/img/gems/fu_jingang.png" alt=""> 金刚符 | <img class="gem-px" src="/img/gems/fu_xuanwu.png" alt=""> 玄武符 | <img class="gem-px" src="/img/gems/fu_fengying.png" alt=""> 风影符 | <img class="gem-px" src="/img/gems/fu_liehun.png" alt=""> 裂魂符 | <img class="gem-px" src="/img/gems/fu_shixue.png" alt=""> 嗜血符 |
|:-:|:-:|:-:|:-:|:-:|
| → 青莲·金刚 | → 青莲·玄武 | → 青莲·风影 | → 青莲·裂魂 | → 青莲·嗜血 |

**熔铸**:青莲·劫灰 ×9 + 对应符 ×1,于炼金师处熔铸即成对应突破石(首次投入正确材料自动习得配方)。

> **两线难度对齐**:单颗凝华 ≈ 81 玉髓 ≈ **1,900 只精英/BOSS**(打地图BOSS 约 1,040 只);单颗突破石 ≈ 9 劫灰 + 1 指定符,**瓶颈在符** ≈ **420 只精英 / 260 只 BOSS / 240 只【史诗·传说级】**——中段互为对标;顶配(太虚 / 单属性顶满 4–8 颗)同为毕生目标。

## 获取与更新 · Download

随**挑战者大陆整合包**分发,在 [Mikuro 启动器](/tools/mikuro-launcher/) 勾选「MIKURO 游戏增强」即自动挂载。版本变更见 [Mikuro 启动器更新日志](/changelog/mikuro-launcher-changelog/)。

<figure class="shot">
  <img src="/img/mod-order.png" alt="挑战者大陆最新 MOD 加载排序">
  <figcaption>fig.1 — 挑战者大陆整合包的最新 MOD 加载排序,启动器内请照此顺序摆放。</figcaption>
</figure>
