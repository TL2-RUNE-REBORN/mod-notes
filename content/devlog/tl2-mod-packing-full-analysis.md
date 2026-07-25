---
title: ".MOD 里到底装了什么 —— Torchlight II 打包格式完全解析"
date: 2026-07-25T10:30:00+10:00
author: "Mikuro"
summary: "从一个 mod 文件夹到一个能进游戏的 .MOD,中间发生的每一件事:容器怎么装、五种二进制格式各是什么、游戏究竟校验哪一个哈希、寻路走格怎么烘出来。附上那些看起来玄学的故障(能勾选却没效果 / 头像变成别的图 / 进副本走不动)背后的真实机理。"
aliases: ["/devlog/tl2-mod-packing-full-analysis/"]
---

> 你在启动器里勾上一个 mod,点开始,游戏就多了一个职业、一把武器、一张地图。
> 中间那个 `.MOD` 文件到底是什么?它怎么被造出来,又怎么被读进去?
>
> 这篇把整条链路拆开讲清楚:**一个 mod 文件夹 → 五种二进制格式 → 一个容器 → 游戏加载**。
> 既有格式层面的完整规格(字节布局、哈希算法、函数地址),也有"为什么我的 mod 明明勾上了却没反应"
> 这类具体故障的答案 —— 它们几乎都能追到本文某一节的某一个字段上。
>
> **材料来源**:IDA 反汇编 `EditorGuts.dll`(官方编辑器 GUTS 的核心,32 位,imagebase `0x10000000`)与
> `Torchlight2.exe`(读取侧,imagebase `0x400000`);frida 活体探针挂真实烘焙进程抓运行时真值;
> 对官方 shipped 数据与原生打包产物做逐字节比对;全语料 A/B 回归。文中所有 `sub_XXXXXXXX` 是绝对地址。
>
> **阅读建议**:只关心"怎么避免踩坑"的读者,读 §0、§2.4、§2.5、§4、§8.2、§8.6 就够了;
> 想自己写工具的读者,格式规格在 §2、§5–§7,附录 A 是地址速查表。

---

## 0. 十句话看懂 .MOD 打包

1. **`.MOD` 本质上是一个自带目录的压缩档 + 一张身份证。** 三段结构:头部(mod 元信息)、
   数据段(所有文件的 zlib 块)、清单(文件树 TOC)。
2. **打包不是单纯地压缩,还要"编译"。** 五种扩展名的**文本源**会被编成二进制:
   `.DAT`/`.TEMPLATE`/`.ANIMATION`/`.HIE` → BINDAT,`.LAYOUT` → BINLAYOUT。其余原样打包。
3. **除此之外还会生成两类东西**:7 个 RAW 聚合索引(游戏启动时按类型快速找单位/技能/词缀的目录卡片),
   以及关卡布局旁边的 `.mpp` 寻路走格。
4. **游戏只校验一个哈希 —— `rollingHash`。** 算错 = 整个 mod 被静默丢弃。
   "启动器能勾选、进游戏一点效果没有"绝大多数就是它。
5. **清单里的文件名必须全大写。** 游戏查文件时把请求路径转大写,再跟清单里存的名字**按原样**比。
   磁盘上小写的 `.dds` 原样存进去,就永远查不到 —— 表现是贴图/图标静默换成别的图。
6. **激活靠 `MOD_ID`,不靠文件名。** 存档目录下的 `modlauncher.sch` 列的是一串 MODGUID,
   顺序即优先级,而且 TL2 是**先挂载者胜**(不是常见的后挂胜)。
7. **`.mpp` 是唯一"烘"出来的东西**,也是唯一无法离线做到逐字节精确的东西 —— 但按"玩家能不能走过去"这个口径,
   离线已经做到 **99.850%**,且没有任何会困住玩家的大缺口。
8. **官方 `DATA.PAK` 里存的不是文本。** 条目 `FOO.LAYOUT` 里躺的是**编译后的** BINLAYOUT 二进制;
   社区散装 MEDIA 目录里那些能直接看的文本,是解包工具**反编译**出来的。
9. **GUTS 打包时会悄悄扔掉 13 类后缀的文件**(`.XML`/`.MAX`/`.LOG`/缩略图/工程文件…),
   所以一棵脏工作树在官方编辑器和第三方工具下会打出不同的包。
10. **整条链路现在可以完全离线复刻**:不需要装编辑器,不需要 D3D9 设备,
    甚至可以在**浏览器里**跑完(同一套 Rust 代码编成 WebAssembly)。

---

## 1. 全景:从一个文件夹到一个 .MOD

一个 mod 的源码长这样:

```
我的MOD/
├─ MOD.DAT              ← 身份证:名字、作者、MOD_ID、版本、依赖、要删的文件
└─ MEDIA/               ← 内容树,镜像游戏自己的 MEDIA/ 结构
   ├─ UNITS/…*.DAT      ← 单位/物品/怪物定义(文本)
   ├─ SKILLS/…*.DAT
   ├─ LAYOUTS/…*.LAYOUT ← 关卡瓦片、UI 布局、粒子特效(文本)
   ├─ MODELS/…*.MESH    ← 模型、骨骼(已经是二进制)
   └─ …*.DDS/*.PNG/*.OGG/*.MATERIAL/…
```

打包要做四件事,顺序有讲究:

```
① 烘寻路      MEDIA/LAYOUTS/** 下的每个 .layout  →  同名 .mpp(哪些格子能走)
② 编译        5 类文本源  →  BINDAT / BINLAYOUT
③ 生成索引    扫全树  →  7 个 RAW 聚合索引
④ 装箱        header + [所有文件的 zlib 块] + 文件树清单  →  .MOD
```

官方编辑器 GUTS 走的就是这条路。它的导出函数 `CreateMod`(`0x100DE830`)只是个守卫壳,
真正的编排在 `sub_103FA610`:

```
CreateMod @0x100DE830  (守卫壳)
└─ BuildMod_orchestrate @0x103FA610
   ├─ A. 读 MOD.DAT 元数据 → header 槽位
   │     NAME / MOD_ID / VERSION / MOD_FILE_NAME / DESCRIPTION / AUTHOR /
   │     WEBSITE / DOWNLOAD_URL / REQUIRED_MODS(校验+哈希) / REMOVE_FILES
   │
   ├─ B. "Generating Path Nodes"  →  Pathing_RegenAll_worker @0x10018750
   │     只扫 <mod>/MEDIA/LAYOUTS/**,逐 .layout 烘 .mpp
   │     ★ 注意它排在编译之前 —— §8.2 会讲这个顺序造成的经典疑难
   │
   └─ C. "Compiling Mod" → CompileRawPack @0x103F5DA0
         ├─ PrePack @0x103F50D0
         │   ├─ 编译派发 @0x1029C9A0    5 类源 → BINDAT / BINLAYOUT,然后 DeleteFileW 删源
         │   ├─ RAW 派发  @0x1029BFA0    7 个聚合索引,子树非空才写
         │   ├─ 扫 MEDIA "*.*" + PNG→DDS 去重 + 剥 "MEDIA/" 前缀
         │   └─ 打包排除黑名单 @0x103F4340(静态表 @0x11D44D40)  ← 13 条后缀
         ├─ 建目录树 @0x102A6430   (type 码 @0x102A1EA0 + 最终解析 @0x102A24F0)
         ├─ Pack 编排 @0x1029BBB0
         └─ 写盘器  @0x102A7100   数据段 + zlib + rollingHash
         最后:3 个临时文件拼接 [header][pakdata][manifest],回填偏移,移入 <install>/mods/
```

这条闭包是从 `CreateMod` 逐节点 BFS 提取出来的,每个节点都跟一份离线实现做过对账。
几个容易踩的细节先说在前面:

- `sub_103F5DA0` 的**返回极性是反的**:0 = 成功,非零 = 错误码(2 无路径 / 3 无文件 / 4 打开失败 /
  5 临时文件重开失败 / 6 依赖 mod 加载失败 / 7 版本或递归依赖 / 8 读不到 `Torchlight2.exe` 版本)。
  `CreateMod` 再把 0 翻成 1 返回给调用者。
- 工作目录里放一个 `devbuild.txt` 会翻转 manifest+88,**逐文件 mtime 就不写了**。ftime 游戏不校验,
  所以无害,但它是一个会改变输出字节的隐藏构建模式。
- GUTS 是**增量编译**(`sub_1028FC00` 看到 `.BIN*` 已存在且新鲜就跳过)。这带来了缓存不一致的风险,
  离线工具的做法是每次从文本全编 —— 编译器本身是 byte-verified 的,产物一致,没有代价。

---

## 2. 装箱:`.MOD` 容器

### 2.1 三段结构

```
out = header(可变长)          # off_data = len(header)
    + PAK 数据段              # [off_data, off_man)
    + manifest 文件树          # 从 off_man 起
```

拿 zip 类比:数据段相当于 zip 的压缩数据区,manifest 相当于中央目录,header 是 zip 没有的东西 ——
一张描述"这个 mod 是谁、多少版本、依赖谁"的身份证。

`off_data` / `off_man` 在写入时先填 0 占位,三段拼完再 fseek 回填。

### 2.2 Header:mod 的身份证

写入器 `sub_103F5DA0`,读取器 `sub_103FA610`:

```
<HHQII>  ver(=4), modver, gamever, off_data, off_man
SS title; SS author; SS descr; SS website; SS download    # SS = u16 码元数 + UTF-16LE
<QIQ>    modid, flags, reqHash
<H> reqs_count;  每项: SS(name) <QH> mod_id, version
<H> dels_count;  每项: SS(path)
```

`MOD.DAT` 里的字段是这样落进槽位的:`NAME`→title、`AUTHOR`、`DESCRIPTION`、`WEBSITE`、
`DOWNLOAD_URL`、`MOD_ID`→modid、`VERSION`→modver、`REQUIRED_MODS`→reqs、`REMOVE_FILES`→dels。

三个反直觉的地方:

- **`MOD_FILE_NAME` 不是 header 字段**,它是**输出文件名**。
- **modver = VERSION + 1**。publish 路径执行 `++*(this+256)`,所以你在 MOD.DAT 里写 3,包里存的是 4。
- **gamever 不来自 MOD.DAT**,而是打包时**实读 `Torchlight2.exe` 的 VS_FIXEDFILEINFO**
  (`sub_103F8CD0`,词序 (minorMS, majorMS, privLS, buildLS))。1.25.9.5 = `0x0005000900190001`,
  对一个安装来说是常量。GUTS 会用实读值**覆盖**你写的任何东西。

还有一条给写启动器的人:**`modid` 是有符号 i64,可能为负**。当无符号处理会在某些 mod 上算出错误的 GUID。

### 2.3 reqHash:依赖图的指纹

如果一个 mod 在 `MOD.DAT` 里声明了 `REQUIRED_MODS`(按 GUID + 最低版本依赖别的 mod),
header 里就会多出一个 8 字节的指纹。写入点在 `sub_103F5DA0`:
`v48 = sub_103F5500(this, 0)` → 存 `this+248` → fwrite,位置在 `flags` 与 REQUIRED_MODS 计数之间。

算法 `sub_103F5500` 是一条折叠链:

```
acc = 34832                       # 低半初值;空集提前返回 0
for (guid, ver) in REQUIRED_MODS: # 条目 stride 40:guid u64 / ver u16 / name wstring @+12
    t1  = H(guid_le_u64,  seed=0x22D0)
    t2  = H(ver_le_u16,   seed=lo32(t1))
    acc = H(t2_le_u64,    seed=lo32(acc))
return acc
```

`H` = `sub_10285330` = **MurmurHash64B**(m = `0x5BD1E995`,r = 24)。三个细节是逐条汇编钉死的,
照抄一份网上的 MurmurHash64B 是对不上的:

1. 种子是 **32 位**,所以 `h2` 从 0 起,而不是常见实现里的 `seed >> 32`;
2. 链式传递**只取上次结果的低 32 位**当种子,但哈希本身返回 EDX:EAX 的**完整 64 位**;
3. `name` 字段**不参与**哈希。

端到端实测:两条 REQUIRED_MODS 的 mod 打出的 header 值 = `0x42E3B27898608F92`。

**一条边界值得说明**:GUTS 解析到一个已安装的依赖时,哈希的是**已安装那份的版本**,并且会把该依赖
自身的 reqHash 递归折进去。离线工具看不到"装了什么",只能用 MOD.DAT 里**声明**的版本、且不递归。
所以扁平依赖(声明版本 == 已安装、依赖自身无 REQUIRED_MODS)两边一致,更深的依赖图离线不可复现。

顺带一提,`REQUIRED_MODS` 在实践中用得比想象的少 —— 多数系列 mod 改用**手动加载顺序**替代
(在 mod 描述里写"放在 XX 上方"),靠 §2.7 的覆盖规则生效。

### 2.4 Manifest:文件树,以及那个大写陷阱

写入器 `sub_102A5860`:

```
<HI>  版本(=2), mhash
SS    root("MEDIA/")
<II>  file_count, dir_count
每目录: SS(dirname) <I> rec_count
        每条: <IB> crc32, type   SS(name)   <IIQ> off, size, filetime
```

- 目录树:文件按父目录 key 进 `std::map<wstring,…>` → 目录按 **UTF-16 路径序**输出;
  每个目录给自己的子目录留一个 **type-7 占位条目**。根是 `MEDIA/`。
- 条目里的 `off` 是**相对数据段起点**的偏移,`off_data + off` 才是文件内的绝对位置。
- `filetime` 是源文件 mtime 转成的 Windows FILETIME。游戏不校验,纯元数据。

**⚠️ 文件名必须全大写 —— 这条会造成最难查的一类故障。**

GUTS 在收集文件时就把名字 `upper()` 了(`sub_103F50D0`)。而游戏的 PAK 查找是这样做的:
把请求路径转大写,然后跟清单里存的名字**按原样**比对(它假定存的已经是大写)。
于是磁盘上一个小写的 `QLJX_F.dds`,如果原样存进清单,游戏拿 `QLJX_F.DDS` 去查就永远匹配不到。

它的症状极具迷惑性:**职业本身正常、名字正常、技能正常,只有头像变成了别的图**。
因为职业和名字走的是不区分大小写的查找,只有贴图那一步是敏感的。追下去的链路是
`CLASS_XXX_F.DAT` 的 `<STRING>ICON:` → `.IMAGESET` → `Imagefile="…/QLJX_F.dds"`,
`.IMAGESET` 在磁盘上恰好是大写(匹配上了),而它引用的那个 `.dds` 是小写(没匹配上)。

`str.upper()` 与 GUTS 行为一致:ASCII 转大写,CJK 与其它非 ASCII 字符不变。

**另一个只有做工具的人会踩的坑**:清单记了每个文件的 mtime。所以两份产物做字节比对时必须打**同一棵树**;
`cp -r` 复制两份再分别打包,一定会因为 mtime 不同而产生字节差 —— 那不是回归,是测量方法错了。

### 2.5 数据段与 rollingHash:全文最重要的一个数

写入器 `sub_102A7100`:

```
<II>  maxCompressedBlockSize, rollingHash          # 8 字节头
每文件(manifest 序): <II> 解压尺寸, 压缩尺寸(0=stored) + 字节流
```

`maxCompressedBlockSize` 是最大压缩块尺寸,喂给游戏解压时的读缓冲。

存储还是压缩,由一张表 `byte_11E94CD8[type]` 决定:type 0..23 全是 1,**只有 type 24(`.JPG`)是 0**。
另外任何 block ≥ `0x1900000`(26 MB)也直接 stored —— 这个常量在 `sub_102A7100` 里出现 5 次。
所以规则一句话:**除 `.JPG` 和超大块外,全部 zlib**。

**现在说 `rollingHash`。这是游戏唯一会校验的哈希,也是"能勾选但没效果"的真凶。**

如果它不对,加载器会**静默**放弃整个 mod:没有弹窗,没有玩家可见的报错,mod 的整张文件表被丢掉,
于是游戏里什么都没多出来 —— 但启动器里它还好好地打着勾。

写入(`sub_102A7100` 末尾)与校验(`sub_102A2690`)的算法对称且确定:

```
N       = 数据段长度
divisor = 25 + (695696193 * N  mod 2^32) mod 51
stride  = max(2, N // divisor)
h = N
for off in range(8, N, stride):     # 偏移 0..7 的头不参与
    h = (int8)data[off] + 33*h      # mod 2^32
h = (int8)data[N-1] + 33*h          # 再叠加最后一字节
rollingHash = h
```

这里有个漂亮的细节。第一眼看反汇编,`divisor` 是从一个随机数发生器取的 —— 那这个哈希岂不是不可复现?
不是。那个 LCG(`sub_10285B30`)在调用前被 `sub_10285A50` **用 N 当种子**重置过
(`sub_10285450` 负责存旧状态、算完恢复),所以"随机"除数其实是**数据段长度的确定函数**。
已对 30 个官方 shipped / 编辑器产出的 `.MOD` 逐字节吻合。

另一个值得记住的性质:它**只采样约 50 个字节**(stride 大约是 N/25 到 N/75)。
这个性质后来救了浏览器版一命 —— 见 §10.2。

### 2.6 三个哈希/计数,哪个是真的

容器里一共有三个看起来像校验的字段,但只有一个真的会被校验:

| 字段 | 位置 | 游戏是否校验 | 说明 |
|---|---|---|---|
| **PAK rollingHash** | 数据段头第 2 个 u32 | **是** | 错了整包静默丢弃 |
| manifest mhash | manifest 头 | 否(读而不校) | 原生由 `sub_1028E6F0` 随机派生,写 0 也能跑 |
| manifest FileCount | manifest 头 | 否(容量提示) | 官方自己的值(如 862)都 ≠ 实际记录数(~618),照样加载 |

游戏遍历时走的是 DirCount + 各目录自己的计数,`fc` 从不用来界定边界。
换句话说,**mhash 和 FileCount 写错不会有任何后果,rollingHash 写错就全没了** —— 这个不对称非常反直觉。

### 2.7 游戏怎么加载、怎么激活

加载链路:`sub_103FB240`(报 `"Unable to load mod.\nFailed because :"`)→ `sub_103F8BC0` →
**`sub_103F83C0`**(真正的校验)。它依次做:

1. 已加载则直接返回;
2. **文件表或 offMan 为空 → 静默失败**(注意,没有报错);
3. 解析 `REQUIRED_MODS` 依赖,缺失或版本不对会记日志;
4. 比对 reqHash;
5. `sub_102A3320` 读 manifest 版本(> 2 拒绝)、读 mhash(不比对)、
   然后 **`sub_102A2690` 重算并比对 rollingHash** —— 不等就 `fclose; return 0`,又是静默。

**激活按 `MOD_ID`,与文件名和哈希都无关。** 存档目录下的 `modlauncher.sch`
(UTF-16LE + BOM + CRLF)里一行一个 `<INTEGER64>MODGUID:<modid>`,游戏加载 header modid 匹配的那个 `.MOD`。

**顺序即优先级,而且 TL2 是"先挂载者胜"。** 这一点跟大多数游戏相反,值得单独强调:

- 引擎先按 scheme 顺序挂 mod PAK(`sub_7DEA10`),**之后**才挂 vanilla 的基础 PAK;
- 路径 VFS(`sub_68F630`)的文件条目按挂载顺序尾部 append,查找时**从头正序扫、命中第一个就返回**。

⇒ mod 覆盖 vanilla;mod 之间,`.sch` 里靠前的覆盖靠后的。
**用户视角:启动器列表里越靠上 = 优先级越高。** 覆盖粒度是**整文件替换**,不做字段合并。

---

## 3. 打包会悄悄扔掉哪些文件

GUTS 在收集文件时,会按后缀剥掉 13 类(`sub_103F4340` + 静态表构造于 `sub_11D44D40` @ `unk_13E51C50`):

| 类别 | 后缀 |
|---|---|
| 工具与中间产物 | `.CMP` `.THUMBNAIL.PNG` `.XLS` `.XML` `.MAX` `.MPD` `.LNK` `.LOG` |
| 编译源 | `.DAT` `.LAYOUT` `.ANIMATION` `.HIE` |
| 编译产物别名 | `.LAYOUT.BINDAT` |

第一类很好理解:美术的 `.MAX` 工程、策划的 `.XLS` 表、日志、快捷方式、缩略图 ——
这些是工作树里的杂物,不该进发行包。**如果你的工具不剥,打出来的包就会比官方大一圈,还多带一堆源资产。**

第二类不是"扔掉",是**换了名字**。GUTS 编译后把文本源剥掉、带着 `<源名>.BINDAT` 走,
写清单时再把名字改回源名。所以最终清单里是 `FOO.DAT` 这个**源名**,里面装的却是**编译后的 BINDAT 字节**。

**怎么确认这一点?** 与其只读反汇编,不如**拿真 GUTS 的产物当 ground truth**。
`EDITORMOD.MOD` 是 GUTS 编辑器的默认输出名,任何用编辑器打开过的 mod 目录里都有一个。
扫它清单区的 UTF-16LE 名字,数一数就清楚了:

```
.DAT       936 条
.LAYOUT    160 条
.ANIMATION   6 条
.BINDAT      0 条     ← 编译产物不单独出现
.BINLAYOUT   0 条
.XLS / .XML / .MAX / .LOG / .THUMBNAIL / .CMP / .MPD / .LNK   全 0    ← 黑名单确实剥了
```

一锤定音,而且比读反编译更 robust。

---

## 4. 哪些文件会被编译

打包时对每个文件要回答两个问题:它是什么类型(type code,写进清单),以及要不要编译。
两个答案来自同一张表 —— `sub_102A1EA0`(原始码)+ `sub_102A24F0`(最终解析 + 追加编译后缀),共 20 个 type:

| type | 扩展名 | | type | 扩展名 |
|---|---|---|---|---|
| **0** | `.DAT` `.TEMPLATE` → **BINDAT** | | 11 | `.IMAGESET` |
| **1** | `.LAYOUT` → **BINLAYOUT** | | 12 | `.TTF` `.TTC` |
| 2 | `.MESH` | | 13 | `.FONT` |
| 3 | `.SKELETON` | | **16** | `.ANIMATION` → **BINDAT** |
| 4 | `.DDS` | | **17** | `.HIE` → **BINDAT** |
| 5 | `.PNG` | | 18 | 未知/无扩展名 |
| 6 | `.WAV` `.OGG` | | 19 | `.SCHEME` |
| 7 | 目录(占位) | | 20 | `.LOOKNFEEL` |
| 8 | `.MATERIAL` | | 21 | `.MPP` |
| 9 | `.RAW` | | 23 | `.BIK` |
| 10 | `.UILAYOUT` | | 24 | `.JPG`(唯一 stored) |

⇒ **会被编译的只有 5 个扩展名**。编译发生在 `sub_1029C9A0`(GUTS 内部叫 "convert text files to binary"),
它编完就 `DeleteFileW` 删掉源文本。

这条规则看着简单,踩起来很疼。两个真实事故:

**事故一:`.TEMPLATE`/`.ANIMATION`/`.HIE` 漏编。** 早期一个离线实现只编了 `.DAT`,
但类型表已经把这三个也标成 BINDAT(0)了。结果是**原始文本被打进了一个标着 BINDAT 类型的条目**,
游戏拿文本当二进制节点树去读。发现它的手法是做一次"原生 DLL vs 离线"的全系列对照:
这三类扩展名在每个 mod 里都显示为 "only-native",而且计数精确匹配。

**事故二:UI 整个消失。** LAYOUT→BINLAYOUT 的编译曾被"旁边有没有现成 `.BINLAYOUT`"这个条件 gate 住。
在一个纯源码仓库上(`.gitignore` 排除了 `*.BINLAYOUT`)它编译出 **0 个** layout,
打出来的包里一个 UI 布局都没有 —— 而基础游戏的 UI 目录是 61 个 `.LAYOUT` 配 61 个 `.LAYOUT.BINLAYOUT`,
游戏读的是后者。于是进游戏 **UI 整个不见了**。

两个 bug 的教训是同一条:**类型分类和编译覆盖面必须来自同一张表**,不能一个查表、一个靠启发。

最后一个特例:`.IMAGESET` 看着像该编译,其实不用。基础游戏 ships 55 个 `.IMAGESET`、
**0 个** `.BINIMAGESET`,游戏直接读文本,原样打包即可。

---

## 5. BINDAT:游戏所有数值的容器

物品、怪物、技能、词缀、配方、掉落表…… 游戏里几乎所有"数据"都住在 `.DAT` 里,编译后就是 BINDAT。
它是一棵递归的节点树,每个节点有一组属性。

### 5.1 格式

```
Header 12B: <III> version(=2), string_count, first_id
String table(按 id 升序):
   entry0 = <H>len + wchar[]        # 第 0 个无 id 前缀(id 在 header 的 first_id)
   entryN = <I>id <H>len + wchar[]
Body = 递归节点:
   <II> name_hash(rg_hash), prop_count
   每 prop: <II> key_hash(rg_hash), type + value(type ∈ {3,7} 为 8B,否则 4B)
   <I> child_count + 子节点…       # 源文本顺序
```

类型编号:`INTEGER`→1、`FLOAT`→2、`UNSIGNED INT`→4、`STRING`→5、`BOOL`→6、`INTEGER64`→7、`TRANSLATE`→8。

### 5.2 键名不存字符串,存哈希

这是 BINDAT 最重要的设计。节点名和属性名(`[UNIT]`、`NAME`、`LEVEL`…)**不进字符串表**,
而是用 **rg_hash** —— GUTS 的 32 位串哈希(`sub_100CA9A0`;游戏侧是同算法的 `sub_4C9FE0`)——
算成一个 u32 写进去。

好处是任何 key 都能序列化,没有"字典完整性"风险:你的 mod 发明一个全新的属性名,照样编得出来。
全语料实证:901025 / 901028 个 key 等于 `rg_hash(name)`(3 个例外全在一个本来就损坏的文件里)。

代价是**不可逆** —— 见 §5.5。

顺带一个编码细节:字符串走 **surrogatepass**,编辑器逐 wchar 原样读写、不校验 UTF-16 代理对。
官方 `TAGS.DAT` 里就有把浮点色块拼进 `<STRING>:` 值的脏数据(会被重解释成孤代理),
必须 surrogatepass 才能字节往返。

### 5.3 字符串值的 id:逐文件解析

STRING / TRANSLATE 类型的**值**不内联,存的是字符串表里的一个 id。

官方产物里这个 id 看起来是**全局会话计数器**分配的 —— 编译整个游戏时一路 `counter++`。
但游戏**是逐文件解析的**:每个 BINDAT 自带一张表,body 里的 id 用**本文件的表**去查。

铁证:官方基础游戏自带 **565 处跨文件 id 撞号**(同一个 id 在不同文件里指向不同的串),
而游戏照常加载运行。如果是全局合并表,它早就崩了。

⇒ **id 的具体值无所谓,只要文件内唯一。** 所以离线打包用 **per-file hash**
(`rg_hash(s)` + 文件内线性探测保唯一):无共享状态、天然并行、确定性。已进游戏验证。

如果你要的是**逐字节复刻官方产物**(比如做兼容性测试),还有第二种模式:
切到 **corpus 全局 id**,即 `sub_10289A40` / `sub_1023E9F0` 的确切语义
(已知串查重建的字典、未知串按首现序 `max_id+1` 递增)。对 shipped 语料 **15976 / 16084 字节精确**,
性能反而略快(免掉每文件的排序探测)。默认不用它,因为那张字典带 715 处需要 majority-vote 的 id 碰撞,
hash 模式的"文件内唯一"更安全。

### 5.4 精度:那 31 个「差异」其实是官方数据自己的毛病

全 16084 文件语料的成绩:**15976 字节精确(99.329%)**;
另有 77 个字节不同但语义完全相同(串 id / 表序噪声)= **99.807% 语义正确**;
真结构差只有 31 个(0.19%),0 个编译错误。

那 31 个值得展开,因为它是个有趣的例子。其中 30 个是 **shipped BINDAT 跟它自己的文本对不上**:
一个正确的编码器就是 `struct.pack('<f', float(text))`,产物**按构造**就是该文本的规范 float32。
最干净的证据是一个叫 `QUAKE1` 的条目 —— 文本字面写 `"1"`,正确编码是 `1.0` / `0x3F800000`,
而 shipped 是 `1.0000001` / `0x3F800001`。没有任何正确的 parser 会从 `"1"` 吐出这个值,
它是编辑器 GUI 导出时的有损痕迹。剩下的是 GRAPHS/STATS 和 POTIONS 曲线的 Y 值,同一类问题。

第 31 个是 `TAGS.DAT`:GUTS 把空 `[]` 根节点按**文件名**命名(shipped 根 `name_hash = rg_hash("TAGS")`),
而且它的源本来就是坏的(就是 §5.2 提到的那个孤代理)。

### 5.5 反过来:BINDAT 反编译器

既然 key 只存单向哈希,BINDAT 能不能变回可读文本?值可以(串表 + 内联都在),名字得靠**查表反推**。

做法是内嵌一张词表:把基础游戏全部 16084 个 DAT 的 1678 个 distinct key/section 名收进来
(23 KB,而且 **rghash 零碰撞**),按哈希反查即可。查不到的发 `UNK_<hex>`。
输出是递归的 `[name]…[/name]` 文本、tc→类型标签、bool→true/false、GUID int64→十进制,UTF-16LE + BOM。

**`UNK_<HEX8>` 是一个正式转义,不是占位符。** 编译侧特判它:识别到这个形状就**把原哈希原样写回**,
所以反编译→重编译是逐字节相同的。匹配是严格的(长度精确 + 大写十六进制),形状不对就当普通名字处理。

> ⚠️ **永远不要手改 `UNK_` 里的那串数字** —— 你改的是哈希本身,改完指向的是另一个属性,而且不会报错。

词表缺口的真实形状值得说清楚,因为它跟直觉不一样:**缺的不是 identifier,是数字家族卡在了原版用量**。
`LEVEL1..16` / `CHILD1..5` / `ENCHANTCOST1..4` / `VALUE1..5` / `TIER1..3_DESCRIPTION` ——
而大型 mod 早就用到了 `LEVEL100`、`CHILD7`、`ENCHANTCOST5`、`TIER4`。
扫 80505 个 mod DAT 的结果:全新 key 只有 20 个,而 104 个新 section 里几乎全是 `LEVEL17..100`。
往词表里再灌 3006 条 exe 字面量(0 碰撞)只是保险,治不了 mod 现造的名字 ——
所以工具在打包时会列出文件并给出占位名警告。

---

## 6. BINLAYOUT:场景、UI 与特效

`.LAYOUT` 描述"东西摆在哪":关卡瓦片里的每块石头、UI 的每个控件、粒子特效的每个发射器。
它编译成 BINLAYOUT,格式是 schema 驱动的、逐 descriptor 编码:

```
Header: <B>0x0B <B>flag(=4) <I>dg_off <H>obj_count(顶层)
Object(递归):
   <I> block_size  <B> descriptor  <q> id
   str NAME(仅当 != descriptor 默认名时写)
   <B> prop_count   每 prop: <H>mem <B>code + value
   <I> adprop_region   <H> child_count   + 子对象…
```

### 6.1 schema 从哪来 —— 一个关于「别从数据里学」的教训

BINLAYOUT 的编码完全依赖一张 schema:**哪个 descriptor 有哪些属性、每个属性的 mem 编号和类型**。

一个自然的想法是从数据里学:扫遍所有官方 `.LAYOUT` 和 `.BINLAYOUT`,把对应关系归纳出来。
**这个做法是错的,而且错得很隐蔽。**

- 它只能覆盖官方数据**恰好用过**的属性。遇到没见过的属性就**静默丢弃** ——
  丢了属性,`block_size` 就写错,进游戏 CEGUI 直接崩。
- 它还会学进污染:Music descriptor 被学出 48 个属性,真实只有 4 个。

正确做法是去 DLL 里把**运行时 descriptor 注册表**整个 dump 出来:headless `InitEditor` →
descriptor-mgr 全局 `unk_12670228` → `*(mgr+0x1C)` BST 根 → 中序遍历,
每个 descriptor 取 code(`+0x58`)、属性列表(`+0xE4`[0..`+0xE8`])、每个属性的 code / flag / name / group / type。
结果是 **159 个 descriptor / 2258 个可序列化属性**,零语料输入。

效果差距是数量级的:mod 语料从 **18/13224** 变成 **13214/13224**。

### 6.2 序列化规则

- **过滤器**(写入器 `sub_10115320`,逐对象):一个属性被写出当且仅当
  `(prop->flag@0x50 & 0x10040200) == 0`(bit9 = 编辑器专用、bit18 = 走 datagroup、bit28)。
- **变换默认跳过**:FORWARD(40) 在 Z==1.0 时丢、RIGHT(41) 在 X==1.0 时丢、UP(95) 在 Y==1.0 时丢
  (POSITION 42 从不丢)。GUTS 在编译时把 identity 朝向丢掉,手写的 layout 尤其要注意这条。
- **Group 的属性走另一条路**:CHOICE / RANDOMIZATION / NUMBER / TAG / ACTIVE+DEACTIVE THEMES /
  LEVEL UNIQUE / GAME MODE **不进对象属性**,而是写进文件尾部的 datagroup 节点。
- Logic Group 的连线图和 Timeline 事件放在 ADPROP 区,链接的输入输出名是**内联字符串**而非解析后的 id。

精度:基础 MEDIA **8965 / 8985 字节精确**。那 20 个不匹配是 shipped 文件里不可复现的未初始化垃圾 ——
源文件把一个属性误写成 `<STRING>`,写入器读到了陈旧的 `prop_value[+8]`,非确定性,
语义上其实是 8985/8985。mod 语料 **13214 / 13224**。

对着 DLL 逐函数审计还修出过几个精微点,列出来给同样在写编码器的人:
`CHOICE @16` 是**大小写敏感的精确匹配** `["ALL","Weight","Random Chance"]`;
`GAME MODE @27` 是非空值 `2-(v=="NORMAL")` 的精确比较(其它非空值 = 2,不是 0);
`@25` 是 Group 自己的 `NO TAG FOUND` bool(默认 0),不是硬编 0。

---

## 7. 7 个 RAW 索引:引擎的目录卡片

游戏启动时不会去遍历整棵 MEDIA 树找"有哪些技能"。它读的是 7 个预生成的聚合索引。
写入分派器 `sub_1029BFA0`,各扫对应子树、非空才写:

| RAW | 写入器 | 源 | 结构要点 |
|---|---|---|---|
| AFFIXES | `sub_103C4170` | `*.DAT` | `<H>count`;每项 SS(FILE) SS(NAME↑) 4×i32(MIN_SPAWN/MAX_SPAWN/WEIGHT/DIFF)+ UNITTYPES / NOT_UNITTYPES 两个字符串列表 |
| SKILLS | `sub_102ECFD0` | `*.DAT` | `<I>count`(仅非空 NAME);SS(NAME↑) SS(FILE) `<q>`UNIQUE_GUID |
| MISSILES | `sub_102FB490` | `*.LAYOUT` | `<H>count`;SS(FILE) + 每个 `DESCRIPTOR:Missile` 对象的 MISSILE NAME↑ |
| TRIGGERABLES | — | `*.DAT` | `<H>count`;SS(FILE) SS(NAME) |
| UI | `sub_103178E0` | `*.LAYOUT` | `<I>count`(Menu Definition 且 MENU NAME 非空、非 DO NOT CREATE);含 TYPE/GAME STATE 枚举与 KEY BINDING |
| UNITDATA | `sub_1026CC50` | `*.DAT` | 4 类(ITEMS/MONSTERS/PLAYERS/PROPS);**字段走完整 BASEFILE 继承链** |
| ROOMPIECES | — | `*.DAT` | `<I>count`;每项 SS(FILE) + GUID 列表 |

**扫描序有两种**,而且必须分清楚,否则字节对不上:
AFFIXES / SKILLS / UNITDATA / MISSILES 是 **name-interleaved DFS**(文件与子目录按名字混排、就地递归);
TRIGGERABLES / UI / ROOMPIECES 是 files-before-dirs。7 个全部能逐字节复现官方产物。

**一个实践上很关键的结论:只有 UNITDATA 依赖基础游戏数据。**

`EncodeUnits`(`sub_1026CC50`)会沿 `BASEFILE` 继承链**读基础游戏的文件内容**,
取出 UNITTYPE / LEVEL / RARITY / CREATEAS。读取侧 `sub_660560`(经 `sub_661480` CUnitResourceList)
把这些值全存下来并**按 UNITTYPE 建索引** —— 游戏是真的会用,少了会影响 spawn 和掉落。

这就是为什么一个纯浏览器的打包器必须携带基础游戏的 UNITS 模板:
一件继承自 `UNITS/ITEMS/BASE.DAT` 的装备,没有 base 就会丢掉 `CREATEAS=EQUIPMENT` 那个 flag 位。
反过来,其余 6 个 RAW 完全不碰 base,所以**纯职业/技能类 mod 在零 base 环境下也能打出字节一致的产物**。

顺便提一个老坑:同一个 GUID,在 `.DAT` 里是 `<INTEGER64>GUID:`,在 `.LAYOUT` 里是 `<STRING>GUID:` ——
值一样,类型不同,两边都要认。

---

## 8. MPP:玩家能不能走过去

### 8.1 一张格子图

每个关卡 `.layout` 旁边有一个同名 `.mpp`(基础游戏一共 1293 个),写入器 `sub_10200920`:

```
24B header: <iiffff> gridW, gridH, worldExtX, worldExtZ, boundsX, boundsZ
然后 gridW*gridH 字节,行主序(X 变化最快)
```

**一个 cell = 0.4 世界单位;取值只有三个:`0x00` 可走 / `0x01` 墙 / `0xFF` 出界或无地面。**
文件大小 = 24 + gridW·gridH,就这么简单。

区域盒来自各 region 的**碰撞** AABB —— 注意不是渲染 mesh 的 bound,后者被刻意夸大过,用了会算错。
逐 region snap 到 10 并留 0.2 pad,网格尺寸由存储的 float32 origin 推出。

**分类器**(`sub_10200920` 内)对每个格子做三步:

1. 从 `y+200` 向下打一条竖直射线到 `−200`,取最近命中;
2. 如果 `|hit.y| > 80` 或者 hit-type == 100,判**墙**;
3. 否则在头顶高度(+1.5)向 ±X / ±Z 四个方向各探 0.30000001,任一命中 NOPATH 就判**墙**;都不中判**可走**。

最后还有一遍 enclosure 二次扫描,把被夹角封死的格子补成墙。

两个反直觉的点:

- **没有坡度判定。** 直觉上"太陡就走不上去"是合理的,但 DLL-patch 实验证明第 2 步里的 `|y|>80`
  这个门在正常模板上是**死的**;墙 100% 由 NOPATH 驱动。
- **NOPATH 只有两个来源**:piece 的 NOPATH 属性(`[+0x192]`),或者碰撞 submesh 的**材质名里含 `nocollide`**。
  后者是个字符串子串匹配,而且资产里实际是**小写**的 `multi_collision/nocollide`。

### 8.2 为什么 GUTS 有时要 build 两次

这是 mod 作者圈里流传最久的一条工作流忌讳,症状很吓人:**玩家进副本后动不了**。

复现方法:在 GUTS 里打开一个 mod 工程,点 build 之前先把 `.BIN*`、`.MPP` 这些中间产物删干净
(很多人习惯保持工作区整洁),然后 build。你会发现新生成的 `.mpp` **全都恰好 2.5 KB**。
拿去玩,那张图就走不动了。修复方法:再 build 一次。

黑箱观察归纳出来的模型是这样的:

```
Function 1:  IF BINLAYOUT 存在 → 从 BINLAYOUT 生成 MPP;  ELSE → 生成默认(2.5 KB)
Function 2:  IF BINLAYOUT 存在 → 校验 CRC32,不过则重编;  ELSE → 从 LAYOUT 编 BINLAYOUT
```

打开工程时 GUTS 只跑 Function 2;点 build 时先跑 Function 1、再跑 Function 2。
所以"先开 GUTS 再改文本"和"改完文本再开 GUTS"结果不同。

**现在可以把机理说死了:**

- "Function 1 先于 Function 2"不是什么奇怪的设计,就是 `sub_103FA610` 里的**顺序** ——
  MPP 步骤(`Pathing_RegenAll_worker` @ `0x10018750`)排在 LAYOUT→BINLAYOUT 编译(`sub_1029C9A0`)**之前**。
- 为什么烘 MPP 需要 BINLAYOUT?因为寻路这一步走的是**运行时关卡加载器**
  (`CLevel_LoadLevelData` @ `0x1020AB90`),不是文本解析器。加载器只吃 `.BINLAYOUT`。
- 所以缺 BINLAYOUT → 关卡加载失败 → 退化成一个**默认 50×50 的盒子** → 写出一个全 `0xFF` 的 stub。
- stub 尺寸 = 24 + 50×50 = **2524 字节**,正是那个"恰好 2.5 KB"。全 `0xFF` = 全部不可走 = 玩家动不了。

顺带,这个鸡生蛋问题在做**无头烘焙**时也要绕:驱动真实 DLL 的工具需要跑两遍
(pass1 写 BINLAYOUT + stub,pass2 才是真 `.mpp`)。而且成功与否**只能看 `.mpp` 数量,不能看返回码** ——
宿主经常在写完全部文件之后才以 `0xC0000374`(堆损坏 teardown)退出。

> **纯离线的打包管线没有这个问题**:它每次都从文本全编 BINLAYOUT,MPP 也是离线烘的,
> 不存在陈旧中间产物,自然也不需要 build 两次。

### 8.3 离线复刻这张图:0.29% 的追凶

把烘焙搬到离线,难点不在分类器 —— 那三步逻辑照抄就行。难点在**喂给分类器的三角形汤是否一致**:
哪些 room piece 的碰撞几何会被烘进去,哪些不会。

第一版离线实现做到了 **99.71%** 的逐格一致率。剩下那 0.29% 一度被判定为"不可约" ——
理由是它高度集中在 `nocollide` 材质的洞穴装饰上(石笋、蘑菇、碎石、悬垂),
而且是**按实例**决定的:同一个 mesh,编辑器烘一部分摆放、丢另一部分,在 layout / DAT 上找不到干净的静态判据。
换句话说:这是运行时状态,静态文件推不出来。

**这个判断是错的。** 用 frida 挂上真实烘焙进程、逐 piece 抓 gate 的输入之后,
它被拆成了六个各自独立的、完全可以从文本推导的缺口:

| # | 缺口 | 真相 | 收益 |
|---|---|---|---|
| 1 | **DEACTIVE THEMES** | 离线判"这块几何是不是背景装饰"时只看了 `CHOICE` 和 `ACTIVE THEMES`,而 DLL 的 `sub_1022FF80` 还 gate 在 **DEACTIVE THEMES** 上(它有 5 个 theme 字符串字段)。被当成"运行时 nocollide"的那批,其实全都坐在 `DEACTIVE THEMES=…` 的 Group 下面。 | over-wall −6307 |
| 2 | **别按名字猜链接** | 旧实现用"链接名里有没有 SPAWNER / RANDOM / CHEST"来判断要不要烘 —— 这是经验设计,不是逆向出来的。DLL **从不按名字匹配**:它跟随所有链接,逐个 sub-piece 过同一个 gate。改成"跟随全部 + 真 gate"之后,整张名字表可以删掉。 | −5869,49 张图改善 / 0 回归 |
| 3 | **Room Piece 父不传变换** | Room Piece 挂在另一个 Room Piece 下面(GUTS clone 操作留下的痕迹)时,变换**不继承**。这在 exe 侧有代码级确证:按 `PARENTID` 递归组合世界变换的那个函数,全库唯一消费者是 QuestController,烘焙从来不走它。不修的话,一条 5 层克隆链的 scale 会累乘到 162 倍,region AABB 撑到 13 万单位,直接编译失败。 | 3 张图从"失败被 STUB"变正常;18/18 网格头与原作者产物一致 |
| 4 | **NEVERBAKE 反而是强制烘焙** | 这个名字极具误导性。`sub_10263280` 证明 NEVERBAKE 落在 `descriptor+0x40`,而 `SetMesh` 里 `if descriptor[+0x40] → piece[401]=1`,最终 gate 是 `ALWAYSBAKE ‖ piece[0x191]` ⇒ **原生会强制烘一个 NEVERBAKE 的 piece,即便实例上明写着 `BAKE:false`**。 | diff −5077,危险格 6284→1688 |
| 5 | **Controller DATA 字段** | `Layout Link Controller` 的 `DATA` 字段(`1,8,` 加 8 条 per-object 变换)会**覆盖**子布局对象自己写的变换 —— 原生用 DATA 定位,不用 POSITION。一张沙漠图"缺地板"的洞就是这么来的:我们把一个 mana_pit 放到了图外 Z=−146,而 DATA 里那条 (118,0,170) 正好把它拉回危险区。 | diff −2618,危险格 1688→**553** |
| 6 | **Path Bounds Extender** | type-19 的 Property Node 会并进网格的 **origin**(但不进 writer box)。要加一个 gate:仅当它真的改变了网格尺寸才采用,否则保持碰撞 origin。 | 尺寸匹配 +4,0 回归 |

外加一个 clearance 侧向门:`sub_100672B0` 在 in-tri 命中前还有一个 side-test,离线因为复用了另一个函数漏掉了,补上 over −2021。

**这里面没有一个是"运行时状态"。** 全部可以从文本 + descriptor 表推出来。

**一条方法论**,写下来是因为它会反复出现:当一个启发式是**基于名字**的,
先去查 DLL 真正的逐对象 gate 是不是已经表达了同一件事 —— 通常是的,
而且"跟随全部 + 真 gate"在健壮性和准确率上是双赢,不需要维护名字白名单。

### 8.4 剩下的是随机吗:三遍烘焙实验

修完六个缺口,还剩一层薄薄的残差。它看起来像随机 —— 追踪来源(provenance)发现赢家 68% 是树冠的
`nocollide` 几何。很容易顺着推理下去:树冠会随风摆动 → 摆动是运行时的 → 所以是非确定的浮点地板,修不了。

**这个推理跳步了,而且可以直接测。** 实验设计很朴素:
**让 DLL 自己独立烘 3 遍;我们的实现是确定的,跑两遍必然相同,正好当对照。
然后看两边各自"会变动的部分"是否一致。**

结果(1116 张图):

- DLL 三遍之间**自己跟自己**的分歧只有 **3826 格**;
- 分歧格里,我方判墙 / DLL 判走的一共 33841 格,其中 **DLL 三遍全走 = 33329 = 98.5%**,
  也就是说这是**稳定可复现的真差异**;真正非确定的只有 512 格(1.5%);
- 另一个方向(我方判走 / DLL 判墙)64953 格,确定性占 98.6%。

⇒ **残差不是掷硬币。** "风摆"这个解释被排除了。

顺着再做一次 mesh 裁决:给每个三角打上 mesh 标签,统计"我方因为某个 mesh 判墙的那些格子里,原生是怎么判的"。
结果是 **没有任何一个 mesh 被原生系统性地判可走**(各 mesh 的可走占比 0~4.6%,合计 0.5%)。
所以"跳过某一类 mesh"这种修法也一并出局 —— 残差是**跨所有 mesh 均匀分布的、约 1% 的位置性差异**。

### 8.5 真正的底:一条不竖直的射线

挖到最后,它是三件事的乘积:

1. **原生的向下射线不是竖直的。** 抓活体真值(1324 个 cell)发现它恒定为 `(−5e-6, −1, +8.6e-5)`。
2. **原生的三角形内测试是法线相关的**(用 mesh 存储的法线,不是顶点叉积):
   `v8 = E1·(N×E2)`,`v16 = E3·(N×E2)`,`v15 = N·(E3×E1)`,
   接受 ⟺ `v16≥0 && v8≥v16 && v15≥0 && v8≥v15+v16`。
3. 在**倾斜**的碰撞三角上,`dz/dy = 8.6e-5` 乘以 196 单位的下降距离 = `hp.z` 漂移 **0.0167**,
   足够把一个 razor-thin 的判定 margin 翻面。实测:原生 −0.00159 拒绝,我方竖直射线 +0.0275 接受。
   平面三角(法线竖直)不漂移,两边完全一致 —— 这解释了为什么只有斜面上出差异。

那把倾斜射线和这个公式照搬过来不就行了?**搬过了。** 拒绝 / 接受的分类在孤立测试下精确复刻
(49416 / 49417)。但整图 A/B 下来,某张图的差异从 1805 变成 1817 —— **不净改善**:
79 格从可走翻成墙,70 格从墙翻成可走,五五开。

原因是原生每个格子的倾斜量还带 ±0.001 的微噪,而那个 margin 本身就在 ±0.0017 量级。
**噪声 ≥ 信号**,固定一个倾斜值只会翻错另外一半格子。

⇒ 结论:要逐字节精确,只有两条路 —— **bit-exact 复刻原生的浮点计算**(需要照着 Ogre 1.7.4 源码逐操作校准,
是个大工程),或者直接**驱动真实 DLL 烘焙**。

同期还实证否决了四个"看起来该修"的方向,列出来省得别人重挖:

- **QUEST / DIFFICULTY 串 gate**:扫全语料 35376 个 Group,authored 的是 **0 个**,加检查等于 no-op。
  顺带,"GAME MODE 用来排除 NG+ 内容"这个假设被实测否定 —— shipped 的盒子比原生**更大**,
  说明引擎是**包含** NG+ 几何的,排除它是反方向。
- **prop→prop 全递归链接**:早就 A/B 过,净负(+191 over 换 −41 under),一层限制是刻意的。
- **float32 常数**:只把常数换成 float32 是半措施(float64 算术塞 float32 常数),全语料净回归 +318。
  真要匹配需要全 float32 算术,又回到上面那个不可导的问题。
- **`NOCOLLIDE` 改大小写敏感**:引擎规则确实是"材质名含 NOCOLLIDE 子串",
  但资产实际是**小写**的 `multi_collision/nocollide`(296 处),改成大小写敏感会直接毁掉一致率。

### 8.6 现在能用吗

对独立烘焙的 DLL 语料(生产配置)的最新成绩:

| 指标 | 值 |
|---|---|
| 逐格可走性准确率 | **99.850%**(1116 张图 / 91,704,677 格) |
| 危险方向(我方挡住、DLL 判可走) | 34,615 = **0.038%** |
| 安全方向(我方判走、DLL 挡住) | 103,356 = 0.113% |
| 最大残留 trap | **80 格**(没有 ≥100 的) |
| 危险格为 0 的图(离线已足够) | 156 / 1116 |

这里有个关键的判断:**换口径**。逐字节精确不可达,但"不困住玩家"可达,而且才是玩家真正在乎的东西。

于是加了一层 `reconnect_walkable` 安全后处理:用 0-1 BFS 找出那些"把一大片可走区切断"的薄墙 barrier
并把它们打通(默认开)。这把所有 ≥100 格的困人 trap 清零了。
剩下 31 张有真 trap 的图逐个用 Ogre 渲染出来人工核验过 ——
全是贴着碰撞几何边缘的窄带和死角,没有一处严格挡路。

实践建议:

- 有编辑器环境、要最高质量 → 驱动真实 DLL 烘焙(字节精确,全语料约 25 分钟);
- 想少依赖 DLL → 离线打底 + 只对那 31 张图用 DLL 覆盖;
- 无编辑器 / 跨平台(比如浏览器里) → 纯离线,99.8%+ 且没有大 trap。

> ⚠️ **带地图瓦片的 mod 千万别跳过 MPP 生成。** 源码树里通常一个 `.mpp` 都没有,
> 跳过就等于自定义瓦片(没有原版可回退)完全没有走格 —— 玩家进图直接动不了,
> 也就是 §8.2 那个 2.5 KB stub 的同款症状。

---

## 9. 原版数据长什么样:DATA.PAK 与三层 base

最后补一块背景知识,因为它长期被误解。

**官方 `DATA.PAK` 里存的不是文本。** 条目 `FOO.LAYOUT` 里躺的是**编译后的** BINLAYOUT 二进制
(等价于散装目录里那个 `.LAYOUT.BINLAYOUT` 兄弟文件)。
社区散装 MEDIA 目录里那些能直接用记事本打开的文本,是解包工具(pakunpack 一类)**反编译**出来的产物。

格式上,`DATA.PAK` 的数据段跟 `.MOD` 的数据段完全一样(offset 0 起 8 字节头 `[MaxCSize][Hash]`,
然后 `[u32 解压尺寸][u32 压缩尺寸][zlib]` 块);
**清单不在文件里,在独立的 sidecar `DATA.PAK.MAN`**,格式就是 `.MOD` 的 manifest
(ver=2 / mhash / root='MEDIA/' / fc / dirs)。格式的权威参照是社区库 `TL2Lib/rgpak.pas`。

知道这个之后,一个离线打包器就有了**三层 base 数据来源**:

```
散装 ./MEDIA          >   从 ./PAKS/DATA.PAK 抽取   >   工具内嵌的 bundle(gz 3 MB)
```

抽取集是 LEVELSETS 的 DAT(MPP 的 piece 表 + ROOMPIECES.RAW)+ UNITS 的 DAT
(§7 说的 UNITDATA BASEFILE 继承)+ piece 引用的碰撞 mesh,反编译成文本缓存在工具旁边。

**三层 base 打同一个关卡 mod,产物全部逐字节相同**(414110 字节):
编译、RAW(含 BASEFILE 继承)、MPP 寻路、容器封装,全部等价。
反编译器的 round-trip 覆盖了全部 34 个 LEVELSETS DAT / 4492 个 piece,与散装文本源逐条一致。

实践含义:**没有装游戏的机器上也能正确打包**,包括浏览器。

---

## 10. 工具现状

### 10.1 桌面版

生产打包器是 Rust 写的,三个二进制格式(BINDAT / BINLAYOUT / MPP)都是**真正的从零编译器**:
解析文本 → 序列化二进制,不读取任何已有的二进制文件,所以文本改动总能正确编译。

#### 对照一:vs 原生 GUTS 的 DLL

先跟"官方自己"比。这里的原生数据不是拿编辑器 GUI 掐表 —— 那样不公平。
测法是用一个 forked 无头宿主直接驱动真实的 `EditorGuts.dll`,调它自己的 `CreateMod` +
`EditorRegenPathingData`,并且把 `InitEditor` 那一次性的 3.85 s 启动开销**摊销掉**,只计**热打包**耗时。
换句话说,这是原生路径的**最好成绩**。Rust 侧跑在**同一批源副本**上,重复 5 轮取均值。

| 组件 | 文件数 | 原生 build | 原生 MPP | 原生合计 | Rust 5 次(s) | Rust 均值 | 加速 |
|---|--:|--:|--:|--:|---|--:|--:|
| 通用素材01 | 12712 | 164.05 | 208.77 | 372.82 | 6.46/11.75/12.37/6.25/6.05 | **8.58** | **43.5×** |
| 职业技能 | 68217 | 268.42 | 0.00 | 268.42 | 12.14/19.55/8.85/9.30/11.05 | **12.18** | **22.0×** |
| 群魔堕落 | 52438 | 169.36 | 0.51 | 169.87 | 12.79/7.56/7.66/8.09/16.58 | **10.54** | **16.1×** |
| 暗黑传奇 | 32020 | 97.86 | 6.02 | 103.88 | 9.46/5.21/5.36/9.76/10.18 | **7.99** | **13.0×** |
| 暗黑世界 | 354 | 9.68 | 17.26 | 26.94 | 0.89/0.76/2.10/2.30/1.73 | **1.56** | **17.3×** |
| 佣兵系统 | 2956 | 14.16 | 0.86 | 15.02 | 1.09/0.79/1.02/2.48/2.47 | **1.57** | **9.6×** |
| 至尊适配 | 1818 | 11.14 | 0.00 | 11.14 | 0.82/0.56/0.57/1.23/1.31 | **0.90** | **12.4×** |
| 实验内容 | 470 | 8.31 | 0.00 | 8.31 | 0.65/0.47/0.47/1.07/1.06 | **0.74** | **11.2×** |
| 护身符 | 1348 | 4.29 | 0.00 | 4.29 | 0.48/0.36/0.96/0.99/0.33 | **0.62** | **6.9×** |
| 宠物系统 | 431 | 1.96 | 0.17 | 2.13 | 0.51/0.43/1.83/1.76/0.38 | **0.98** | **2.2×** |
| **合计** | 172764 | 749.2 | 233.6 | **982.8 s** | | **45.66 s** | **21.5×** |

**原生要 16 分钟,Rust 要 46 秒。** 按各组件 5 次的最优值合计更是 31.0 s → **31.7×**;
逐次波动主要来自 Defender 实时扫描和写回缓存冲刷(每轮要落盘约 600 MB 的 `.MOD`)。

两条**必须说清楚**的口径:

- **MPP 不完全同口径。** 原生那一列是 `EditorRegenPathingData`(逐字节精确),Rust 走的是离线 `re` 后端
  (§8.6 的 99.850%)。要逐字节精确就用 `--mpp dll` —— 那时驱动的是同一个原生 DLL,速度也就等于
  "原生 MPP"那一列。所以这 21.5× 里,MPP 部分是"更快但口径不同";编译 + RAW + 装箱才是纯粹的同活对比,
  而那一栏是**原生 749.2 s vs Rust 连 MPP 一起 45.66 s**。
- 表里的文件数比 monorepo 大,因为这批源副本带着编译产物 sibling(`.BINDAT`/`.BINLAYOUT`),两边都得扫。
  另有两个组件(地图拓展 242.98 s、POE 52.72 s)的源副本已删除、无法复测,未计入合计 ——
  算进去原生总时长只会更长。

#### 对照二:vs Python 参考实现

Python 那一版本身已经是满优化的:isal 的 SIMD 压缩、numba JIT 的 MPP 内核、进程池 + 线程池。
这一轮跑在 monorepo 源树上(10 个组件,16 核,产物内容逐文件校验一致):

| | Python(isal + numba + 多进程) | Rust | 加速 |
|---|---|---|---|
| 全系列合计 | 63.9 s | **23.7 s** | **2.69×** |
| 暗黑世界 | 5.07 s | 0.64 s | 7.9× |
| 通用素材01(263 MB) | 18.14 s | 5.16 s | 3.5× |

三条管线放在一起大致是这个量级 —— **原生 GUTS ≈ 983 s / Python ≈ 64 s / Rust ≈ 46 s**。
这是**参考量级、不是单次受控实验**:983 与 46 来自同一批源副本(对照一),64 来自 monorepo 源树(对照二),
两批源的文件数不同。但方向没有含糊空间:**Rust 比原生快一个数量级以上,比满优化的 Python 还快一倍多。**

还有一个做字节对比时必须知道的点:不同实现的产物**唯一字节差异是 zlib 压缩流**
(压缩后端不同;游戏只做 inflate,无感知)。所以整包比对必须**比解压后的内容**,不能直接比字节。

MPP 侧另做过一轮优化:三角 AABB 预筛 + 跨图 layout 缓存 + CSR 稠密桶网格 + 换 allocator,
**9.8 s → 5.5 s**,每一步都复验全语料逐字节不变。也有证伪的:
把 gather 的顶点预先变换好是**净负**(分配 + 散读的代价 > 6 倍冗余乘法),回退了。

### 10.2 浏览器版

同一套代码编到 `wasm32-wasip1`,就是站内的 [**网页版 .MOD 打包器**](/tools/packer/):
选文件夹 → 打包 → 下载,纯本地、零上传、零安装。

**铁律是不改已验证的桌面 crate**:wasm crate 用 `#[path]` 只读复用桌面版的打包器和编译器模块
(单一真值源),用**同名 shim crate** 顶掉那些 C / OS 依赖(压缩库换纯 Rust 实现、注册表访问打桩、
驱动 EditorGuts 的模块换成同签名的空实现 —— 编辑器是桌面专用的)。

逐字节验证过:1 MB 的宠物 mod,桌面版与 wasm 版输出 **SHA256 完全相同**;
264 MB 的大素材包解包对账,非 MPP 文件的解压内容 **11035/11035 一致**。

**4 GB 线性内存那一关**值得单独讲,因为它是个有意思的工程问题。
桌面版的打包是并行全量物化的:所有解压内容 + 所有压缩块 + 整个输出缓冲同时在内存里。
786 MB 未压缩素材在 wasm32 的 4 GB 线性内存(而且**只增不还给 OS**)下必然 OOM。

解法是三遍临时文件流式:

- **Pass 1** 逐文件读 → 立即压/存 → 追加写进 `<out>.data.tmp`(内存里只持有一个文件),
  同时记下清单和最大压缩块尺寸;
- **Pass 2** 算 rollingHash —— 这里 §2.5 那个"只采样约 50 个字节"的性质成了救命稻草:
  ~50 次 seek 就能从临时文件上算出来,不需要整读回内存;
- **Pass 3** 组装 `header ++ [maxCsz][rollingHash] ++ 分块拷贝(tmp) ++ manifest`。

数据段落在磁盘 / WASI shim 的 JS 堆上(**不在 wasm 线性内存里**),峰值内存 ≈ 单个文件 + 清单。
真跑 264 MB 成功,111 秒,无 OOM,SHA256 与桌面版一致。

一个开发期的坑记在这里:**Node 的 uvwasi 缺 `fd_readdir`**(报 os error 52),
readdir 拿到 0 个文件 → 产物是空的。测试必须用 wasmtime。
浏览器里用的 `@bjorn3/browser_wasi_shim` **有** readdir,所以线上不受影响。

### 10.3 双击就能用的 TUI

不带参数启动打包器会起一个终端交互界面:扫当前目录的子目录 + `./mods/*`,
把带 `MOD.DAT` 的文件夹列为 mod 源,含 `MEDIA/LAYOUTS/*.LAYOUT` 的标成关卡 mod,
选中就打包到 Documents 下的 mods 目录。

设计上刻意保守:**TUI 只负责选择**。选完就恢复终端,用普通 console 输出跑转换和打包 ——
已验证的核心一行都不碰。非 TTY 环境(管道 / CI)裸跑会回退到 usage 提示而不是卡住。

---

## 附录 A:关键地址表(EditorGuts.dll,imagebase `0x10000000`)

| 功能 | 地址 |
|---|---|
| InitEditor / CreateMod / EditorSetWorkingMod / EditorRegenPathingData | `0x10001DD0` / `0x100DE830` / `0x100E3B50` / `0x100DDDE0` |
| 打包编排 / 编译打包主体 / PrePack | `sub_103FA610` / `sub_103F5DA0` / `sub_103F50D0` |
| MOD header 写 / 读 | `sub_103F5DA0` / `sub_103FA610` |
| Manifest 写 / mhash | `sub_102A5860` / `sub_1028E6F0` |
| PAK 数据段写(+rollingHash 计算) | `sub_102A7100` |
| 打包排除黑名单 / 静态表 | `sub_103F4340` / `sub_11D44D40` @ `unk_13E51C50` |
| 类型码 / 编译重映射 / 存储表 | `sub_102A1EA0` / `sub_102A24F0` / `byte_11E94CD8` |
| 编译派发(5 类源) | `sub_1029C9A0`(→ BINDAT `sub_1028FC00` / BINLAYOUT `sub_101169B0`) |
| RAW 派发 | `sub_1029BFA0` |
| 加载校验 / rollingHash 校验 | `sub_103F83C0` / `sub_102A3320` → `sub_102A2690` |
| reqHash / MurmurHash64B / gamever 读取 | `sub_103F5500` / `sub_10285330` / `sub_103F8CD0` |
| rollingHash 的种子 RNG:LCG / 设种子 / 存状态 | `sub_10285B30` / `sub_10285A50` / `sub_10285450` |
| BINDAT:序列化 / 串收集 / interner / 节点写 / WriteShortString | `sub_10289A40` / `sub_10289950` / `sub_1023E9F0` / `sub_10289860` / `sub_1028ED40` |
| BINLAYOUT:写入链 / 对象写 / datagroup / tag 注册 | `sub_101169B0…` / `sub_10115320` / `sub_101150F0` / `sub_10253630` |
| RAW:AFFIXES / SKILLS / MISSILES / UI / UNITDATA | `sub_103C4170` / `sub_102ECFD0` / `sub_102FB490` / `sub_103178E0` / `sub_1026CC50` |
| MPP:RegenAll / RegenSingleFile / LoadLevelData / GenPathing / **写出器** | `sub_10018750` / `sub_10015FA0` / `sub_1020AB90` / `sub_10203710` / **`sub_10200920`** |
| MPP:向下射线 / clearance / 三角内测试 / 几何合并 / 背景 gate | `sub_101EF170` / `sub_101EEEA0`·`sub_100672B0` / `sub_10066E50` / `sub_10068CB0` / `sub_1022FF80` |
| rg_hash(GUTS 侧 / 游戏侧) | `sub_100CA9A0` / `sub_4C9FE0`(imagebase `0x400000`) |

游戏侧(`Torchlight2.exe`,imagebase `0x400000`):
scheme 解析 `sub_7DEA10`、资源管理器初始化 `sub_64A590`、路径 VFS 查找 `sub_68F630`、
UNITDATA 读取 `sub_660560`(经 `sub_661480`)。

## 附录 B:工具

- **桌面打包器**:`tl2-mikuro-mod-packer` ——
  `[--in-place|--temp-copy] [--mpp {re,dll,none}] [--raw {auto,none}] [--deploy] <mod目录>`;
  子命令 `compile-dat` / `compile-layout` / `compile-mpp` / `extract-base` / `unpack-base`;无参数 → TUI。
- **网页版**:[/tools/packer/](/tools/packer/) —— 同一套代码编到 WebAssembly,纯客户端。
- **诊断环境变量**:`MIKURO_TIMING=1`(分阶段计时)、`MPP_TIMING`、
  `MPP_RECONNECT=0`(关掉走格安全后处理,做逐字节验证时必须关)、
  `MIKURO_BINDAT_DICT`(切到 corpus 全局 id 模式)、
  `TL2_MEDIA_DIR` / `TL2_INSTALL_DIR` / `TL2_MOD_GAMEVER`。
- **延伸阅读**:[TL2 TAG 系统逆向](/devlog/tl2-tags-re-and-mod-key-audit/) ——
  本文 §5.2 提到的 rghash 在 tag 与 property key 上的另一条线。
