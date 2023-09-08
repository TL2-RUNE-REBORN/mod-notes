---
title: "TL2 MPP Research"
date: 2023-08-30T10:48:11+10:00
draft: false
---

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

