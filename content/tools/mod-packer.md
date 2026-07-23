---
title: ".MOD 打包器 · 网页版"
date: 2026-07-23T14:06:32+10:00
author: "Mikuro"
summary: "浏览器内把 mod 文件夹打包成 .MOD:与桌面版打包器同一套 Rust 代码编译成 WebAssembly,纯本地、零上传、零安装。"
weight: 5
params:
  rarity: "magic"
  icon: "cube"
  link: "/tools/packer/"
  typeline: "魔法 · 网页版 MOD 打包器 · WebAssembly"
  affixes:
    - "与桌面版 tl2-mikuro-mod-packer 同一套 Rust 代码编译成 wasm,DAT / LAYOUT 编译与 .MOD 封装逐字节一致"
    - "纯客户端:选文件夹 → 打包 → 下载,文件不上传、无需安装,资源加载后断网也能用"
    - "附带全量 Runic base 数据(UNITS 模板 + 关卡碰撞几何),BASEFILE 继承与 MPP 走格都在浏览器内烘焙"
    - "跨源隔离环境走 wasm threads 多线程,大 mod 打包约为单线程的 1/4 ~ 1/6"
  flavor: "同一座熔炉,换了一扇窗。"
  status: "已上线"
  metaline: "web · chrome / edge / firefox"
---

<script>location.replace("/tools/packer/")</script>

工具已内置在打包页本身,**[▶ 打开 .MOD 打包器](/tools/packer/)** —— 无需安装,浏览器直接用。
