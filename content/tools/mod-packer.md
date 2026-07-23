---
title: ".MOD 打包器 · 网页版"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "浏览器内把 mod 文件夹打包成 .MOD:与桌面版打包器同一套 Rust 代码编译成 WebAssembly,纯本地、零上传、零安装。"
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  typeline: "魔法 · 网页版 MOD 打包器 · WebAssembly"
  affixes:
    - "与桌面版 tl2-mikuro-mod-packer 同一套 Rust 代码编译成 wasm,DAT / LAYOUT 编译输出逐字节一致"
    - "纯客户端:选文件夹 → 打包 → 下载,文件不上传、无需安装,资源加载后断网也能用"
    - "附带全量 Runic base UNITS 模板,BASEFILE 单位继承链在浏览器内完整解析"
    - "内置自检样例,一键验证输出与桌面版参照逐字节一致(SHA-256)"
  flavor: "同一座熔炉,换了一扇窗。"
  status: "已上线"
  metaline: "web · chrome / edge / firefox"
---

## 打开工具

**[▶ 打开 .MOD 打包器](/tools/packer/)** —— 无需安装,浏览器直接用。

## 是什么

把[桌面版 MOD 打包器](/tools/tl2-mikuro-tool/)的核心整个搬进了浏览器:同一套 Rust 打包代码编译成
**WebAssembly(wasm32-wasip1)**,在页面里跑一个内存文件系统,选一个 mod 文件夹就能在本地把
`DAT` / `LAYOUT` 编译成引擎二进制格式(`BINDAT` / `BINLAYOUT`)并封装成 `.MOD`:

- **纯本地**:打包全程在浏览器 WebAssembly 沙箱内完成,任何文件都不会离开你的电脑;
- **输出一致**:编译与容器封装和桌面版同源同构,内容逐字节一致
  (manifest 里的文件时间戳按浏览器可见的毫秒精度写入,与桌面版产物相比该字段可有微小差异,不影响游戏加载与 MOD 激活);
- **BASEFILE 继承**:附带全量 Runic base UNITS 模板(7731 个文件,gzip 760 KB),
  装备 / 单位类 mod 的 `BASEFILE` 继承链在浏览器内完整解析;
- **内置自检**:页面里一键跑内置样例,输出与桌面版参照逐字节比对(SHA-256),随时验证你当前浏览器里的打包链是否可信。

## 怎么用

点「选择 MOD 文件夹」选中 mod 根目录(需含 `MOD.DAT` 与 `MEDIA/`),确认输出文件名后点「打包为 .MOD」,
完成后直接下载。Chrome / Edge 用原生文件夹选择器;Firefox 等浏览器自动改走目录上传(同样只在本地读取)。

## 边界

- **MPP 关卡寻路数据不生成**(等价于桌面版 `--mpp none`)。含关卡 `LAYOUT` 的 mod(新地图 / 改地图)请用桌面版打包——
  MPP 烘焙需要 base 游戏的关卡几何,网页版只附带了 UNITS 模板。纯数值 / 单位 / 物品 / 技能类 mod 不受影响。
- 整棵 mod 目录会读入内存,数百 MB 的巨型整合组件建议直接用[桌面版](/tools/tl2-mikuro-tool/)。
