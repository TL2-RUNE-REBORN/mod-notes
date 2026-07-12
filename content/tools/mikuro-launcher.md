---
title: "Mikuro 启动器"
date: 2026-07-12T15:02:54+10:00
author: "Mikuro"
summary: "无上限 MOD 启动器,内置 MIKURO 游戏增强(掉落过滤 / 存档修复 / DXVK)。"
weight: 1
params:
  rarity: "legendary"
  icon: "flame"
  typeline: "传奇 · MOD 启动器 · 游戏增强"
  affixes:
    - "突破官方 10 个 MOD 加载上限"
    - "DXVK 双版本按显卡驱动自动选择,减少黑屏 / 秒退"
    - "MIKURO 游戏增强:掉落过滤 / 存档崩溃修复 / 灵石限位"
    - "存档解绑:安全卸下职业 MOD 不废存档"
  flavor: "上限只存在于旧启动器的一条指令里。"
  status: "已发布"
  metaline: "windows · 整合包内置"
---

## 简介

Mikuro 启动器是为火炬之光2写的替代启动器:官方 ModLauncher 最多挂 10 个 MOD,
这个上限只存在于启动器一侧 —— 引擎本身没有。Mikuro 启动器直接扫描 `.MOD`
文件头、生成加载 scheme 并启动游戏,想挂多少挂多少。

## MIKURO 游戏增强

启动器内置的一整套增强层,一个开关全挂载:

- **掉落过滤** —— 按稀有度/类型过滤地面物品,自动识别 MOD 自定义稀有度(EPIC/RUNE),任务物品永不误吞
- **金币自动拾取**
- **存档崩溃修复** —— 大背包存档、过图闪退,默认常开
- **疾速灵石限位** —— 带冷却缩减的灵石只能镶入武器/头盔/护手,与描述一致
- **DXVK 显卡兼容** —— 双版本自动选择,老驱动黑屏/秒退的救星

## 获取与更新

启动器随挑战者大陆整合包分发,版本变更见 [Mikuro 启动器更新日志](/changelog/mikuro-launcher-changelog/)。
