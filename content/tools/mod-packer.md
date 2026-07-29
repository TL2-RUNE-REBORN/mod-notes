---
title: ".MOD UN/PACKER · 网页版"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "浏览器内把 mod 文件夹打包成 .MOD,也能把 .MOD 解回可编辑的源目录:与桌面版同一套 Rust 代码编译成 WebAssembly,纯本地、零上传、零安装。"
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  link: "/tools/packer/"
  typeline: "魔法 · 网页版 MOD UN/PACKER · WebAssembly"
  affixes:
    - "与桌面版 tl2-mikuro-mod-packer 同一套 Rust 代码编译成 wasm,DAT / LAYOUT 编译与 .MOD 封装逐字节一致"
    - "纯客户端:选文件夹 → 打包 → 下载,文件不上传、无需安装,资源加载后断网也能用"
    - "附带全量 Runic base 数据(UNITS 模板 + 关卡碰撞几何),BASEFILE 继承与 MPP 走格都在浏览器内烘焙"
    - "跨源隔离环境走 wasm threads 多线程,大 mod 打包约为单线程的 1/4 ~ 1/6"
    - "反向解包:.MOD 还原成可编辑源目录,BINDAT / BINLAYOUT 反编译回文本源;Chrome / Edge 直接写出文件夹,其余走 ZIP"
    - "键名恢复:内置 46.5 万条分层反查表 + 文件自身上下文,救回的名字标绿、仍未知的标红;20 个第三方 MOD 实测 UNK_ 从 972 降到 871,零回归"
    - "要更快或处理几百 MB 整合包,用原生 Rust 版 tl2-mikuro-mod-packer-rs —— 多核并行、不受浏览器内存上限约束"
  flavor: "同一座熔炉,换了一扇窗。"
  status: "已上线"
  metaline: "web · chrome / edge / firefox"
---

<script>location.replace("/tools/packer/")</script>

工具已内置在打包页本身,**[▶ 打开 .MOD UN/PACKER](/tools/packer/)** —— 无需安装,浏览器直接用。

追求速度、或者要处理几百 MB 的整合组件,建议直接用**原生 Rust 版**
[tl2-mikuro-mod-packer-rs](https://github.com/heiybb/tl2-mikuro-mod-packer-rs):
单文件 exe、免安装,多核并行且不受浏览器 4 GB 内存上限约束,通常快数倍。
两边是同一套代码,产物逐字节一致 —— 网页版胜在随开随用、跨平台。
