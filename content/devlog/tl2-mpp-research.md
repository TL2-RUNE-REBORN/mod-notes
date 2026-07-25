---
title: "TL2 MPP Research"
date: 2023-08-30T10:48:11+10:00
author: "Mikuro"
aliases: ["/posts/tl2-mpp-research/"]
summary: "Why cleaning up .MPP files breaks dungeon walkability — repro steps and findings.(2026-07-25:下面的黑箱模型是对的,机理现已逆完,见顶部说明。)"
---

> **⚠ 2026-07-25 —— 下面的观察完全正确,机理现在能说死了。**
> 完整版在[《TL2 .MOD 打包完全解析》§8.2](/devlog/tl2-mod-packing-full-analysis/#82-为什么-guts-有时要-build-两次)。摘要:
>
> - 「Function 1 先于 Function 2」不是什么奇怪逻辑,就是 `CreateMod`(`sub_103FA610`)里的**顺序**:
>   寻路步骤(`Pathing_RegenAll_worker` @`0x10018750`)排在 LAYOUT→BINLAYOUT 编译(`sub_1029C9A0`)**之前**。
> - MPP 需要 BINLAYOUT,是因为寻路这一步走的是**运行时关卡加载器**(`CLevel_LoadLevelData` @`0x1020AB90`),
>   不是文本解析器 —— 加载器只吃 `.BINLAYOUT`。缺 BINLAYOUT → 关卡加载失败 → 退化成默认 50×50 盒子 → 全 `0xFF` stub。
> - stub = **2524 字节** = 24 字节头 + 50×50,正好是下文说的 "exact 2.5kb"。但下文引的头部字节
>   `4B 00 00 00 4B 00 00 00` 与这个尺寸对不上(`0x4B` = 75,75×75 会是 5649 字节);
>   50×50 的头应该是 `32 00 00 00 32 00 00 00`。**以尺寸为准**。
> - **离线打包器没有这个问题**:每次都从文本全编 BINLAYOUT、MPP 也是离线烘,不存在陈旧中间产物,不需要 build 两次。

I have recently done some tests regarding the `.MPP` files.  
(Please be aware `MPP` files will only be generated for `LAYOUT` files in the `LAYOUTS` folder)
It is quite common that developers like to maintain their mod workspace clean.  
So, we usually clean up the `.BIN*`, `.MPP` files and ...  
But in some specific scenarios, it will introduce issues in.  
With the following steps, we can reproduce this issue.  
(Which normally causing player unable to move after entering a dungeon related to the layout file)  

Open GUTs, select a mod let’s say `TEST`, then before you click build, delete all the ".BIN*",".MPP" files and ...  
Then you will notice that all the new generated `MPP` file size will be exact 2.5kb  
They all start with `4B 00 00 00 4B 00 00 00 00` in hex viewer.  
To fix this, you will have to build again.  

Why this happen? Let's dig in further.  
After some tests, here is the weird logic GUTS uses:  
When you open a mod project using GUTS, while initializing GUTS will only invoke `Function 2`  
When you click the build button, GUTS will invoke `Function 1` first then `Function 2`  

`Function 1`
```
IF BINLAYOUT EXIST:
    Generate MPP from BINLAYOUT
ELSE:
    Generate MPP from DEFAULT(2.5Kb)
```

`Function 2`
```
IF BINLAYOUT EXIST:
    Check CRC32
    IF CHECK PASS:
        Done
    ELSE:
        Generate BINLAYOUT from LAYOUT
ELSE:
    Generate BINLAYOUT from LAYOUT
```

**Scenario 1**  
You open a mod project in GUTS, you make some changes in `LAYOUT` file from external editor, you delete `BINLAYOUT` and `MPP` files. You click build button.
What you will get:  
A valid `BINLAYOUT` file.  
An invalid `MPP` file (Size 2.5Kb start with `4B 00 00 00 4B 00 00 00 00`).

**Scenario 2**  
You open a mod project in GUTS, you make some changes in `LAYOUT` file from external editor, you click build button.
What you will get:  
A valid `BINLAYOUT` file.  
An invalid `MPP` file (Cuz it is generated using the out-of-date `BINLAYOUT`).

It is quite clear now, if you make changes to the `LAYOUT` file after you open the mod project, you will not be able to get the correct `MPP` file. You will have to build twice to get the correct one.  

**Solution?**  
- Option 1: Open GUTS after you finish making changes to the `LAYOUT` files. GUTS's initialization will update the `BINLAYOUT`, then when building process, you will get the correct `MPP` file.
- Option 2: Build twice

