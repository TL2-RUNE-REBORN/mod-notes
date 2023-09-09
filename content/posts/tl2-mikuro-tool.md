---
title: "火炬之光2 MOD 打包/解包工具"
date: 2023-08-11T14:01:57+10:00
author: "Mikuro"
---

## 链接
https://github.com/heiybb/TL2-Mikuro

## 诞生之由
每次打包/解包MOD时，都必须启动编辑器，并忍受20秒的等待时间，因为它会加载许多无关的功能   
而TL2-Mikuro只需要3秒初始化  
但它是通过直接调用`EditorGuts.dll`中的函数来实现这一点，因此很遗憾`EditorGuts`仍然需要安装

## 安装
只需将`TL2-Mikuro.exe`放入`Editor.exe/Torchlight2.exe`同一文件夹即可。 

## 已知问题
受限于`EditorGuts.dll`内部的逻辑，MOD打包只接受`mods`文件夹下的项目，MOD解包也只接受目标目录下的`mods`。 
我是WPF和C#编程的新手，所以请原谅我代码中的不足之处。

## 待办事项
进一步分析`EditorGuts.dll`

## 许可证
本项目采用 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) 许可。
