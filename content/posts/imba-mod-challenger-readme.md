---
title: "IMBA-MOD-符文觉醒-挑战者大陆 使用说明"
date: 2023-08-15T16:03:54+10:00
draft: false
---

## 📝更新日志
请访问[MOD更新日志页面](https://tl2-mod.chr.moe/posts/imba-mod-changelog/)

## 📦️文件夹包含内容
```
│───IMBA-MOD-符文觉醒-宠物系统.MOD
│───IMBA-MOD-符文觉醒-暗黑传奇.MOD
│───IMBA-MOD-符文觉醒-职业技能.MOD
│───IMBA-MOD-符文觉醒-英雄系统.MOD
│───使用说明.url
└───移除原生装备职业要求
        MIKURO_VANILLA_CLASS_REQ_RM.DAT
        MIKURO_VANILLA_CLASS_REQ_RM.PAK
        MIKURO_VANILLA_CLASS_REQ_RM.PAK.MAN
```  

## 🔧MOD安装(👀眼睛看这里)
将你需要使用的MOD文件复制到以下目录即可，如果没有`mods`文件夹，自己新建一个即可  
`C:\Users\你的用户名\Documents\my games\runic games\torchlight 2\mods`  
**注意替换成你自己的用户名**  

## ⏪️MOD启动顺序(👀眼睛看这里)
专用补丁1.2已经合并，所以基础MOD由上到下顺序应该为：  
```
IMBA-MOD-符文觉醒-通用素材  
IMBA-MOD-符文觉醒-暗黑传奇  
IMBA-MOD-符文觉醒-职业技能  
```
如果需要使用宠物系统或英雄系统  
请将他们放置在`IMBA-MOD-符文觉醒-通用素材`的上方

## 💡移除原生装备职业要求PAK安装(👀眼睛看这里)
该内容是从原MOD中剔除出来的以便加快MOD编译加载速度    
使用PAK有个优势在于可以摆脱MOD启动器10个MOD的限制，这个问题我们后面再说  
将`移除原生装备职业要求`文件夹内的三个文件直接复制到火炬之光2根目录的`PAKS`文件夹内

### 🚩Steam用户
在STEAM的游戏列表内，右键火炬之光2->管理->浏览本地文件  
即可跳转至火炬之光2的根目录找到`PAKS`文件夹  

### 🚩其他用户
找到`Torchlight2.exe`你就找到了`PAKS`文件夹