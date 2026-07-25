---
title: "TL2 MPP Research"
date: 2023-08-30T10:48:11+10:00
author: "Mikuro"
summary: "Why cleaning up .MPP files breaks dungeon walkability — repro steps and findings. (2026-07-25: the black-box model below is correct; the mechanism behind it is now reversed — see the notice at the top.)"
---

> **⚠ 2026-07-25 — the observations below are correct, and the mechanism behind them is now reversed.**
> Full write-up in [\"TL2 .MOD Packing, Fully Analyzed\" §8.2](/en/devlog/tl2-mod-packing-full-analysis/#82-why-guts-sometimes-needs-two-builds). In short:
>
> - "Function 1 runs before Function 2" is simply the **order inside `CreateMod`** (`sub_103FA610`): the pathing
>   step (`Pathing_RegenAll_worker` @`0x10018750`) runs **before** the LAYOUT→BINLAYOUT compile (`sub_1029C9A0`).
> - MPP needs BINLAYOUT because the pathing step drives the **runtime level loader**
>   (`CLevel_LoadLevelData` @`0x1020AB90`), not a text parser — and the loader only eats `.BINLAYOUT`.
>   No BINLAYOUT → level load fails → it degrades to a default 50×50 box → an all-`0xFF` stub.
> - The stub is **2524 bytes** = 24-byte header + 50×50, which matches the "exact 2.5kb" below. The quoted
>   header bytes `4B 00 00 00 4B 00 00 00`, though, contradict that size (`0x4B` = 75, and 75×75 would be
>   5649 bytes); a 50×50 header reads `32 00 00 00 32 00 00 00`. Trust the size.
> - **The offline packer has none of this**: it compiles BINLAYOUT from text on every run and bakes MPP offline,
>   so there is no stale-intermediate chicken-and-egg and no need to build twice.

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

