---
title: "TL2 TAG 系统逆向:引擎零校验,与 property key 排查"
date: 2026-07-24T16:40:00+10:00
author: "Mikuro"
summary: "引擎按 rghash 匹配 tag、运行时零校验 TAGS.DAT —— mod 里任意 tag 都能用;附 GUTS 那条刷屏 no-match 警告的真相,与两个整合 mod 的 property key 实测排查。"
---

> 起因很俗:一个老整合 mod 的加载日志刷满 `Found property name with a hashcode (…) that has no match in tags.dat`。
> 问题是——这到底是 mod 用了"非法 tag",还是别的什么?顺着这条警告,把 TL2 的 tag 系统从 `Torchlight2.exe` 挖到底。
>
> **方法**:IDA(idalib MCP)反编译 `Torchlight2.exe`(32 位,imagebase `0x400000`)与 `EditorGuts.dll`(imagebase `0x10000000`)+
> 对 `MEDIA/TAGS.DAT` 基线(3631 个 tag 名)做 rghash 对账 + 扫两个真实整合 mod 的**全部** DAT property key。所有 `sub_XXXXXXXX` 是绝对地址。
>
> **一句话结论**:引擎按名字哈希(**rghash**)匹配 tag,运行时**根本不查** `TAGS.DAT`。所以 mod 里想写什么 tag 都行;
> `TAGS.DAT` 只是 GUTS 的下拉列表 + hash→名字的**显示反查表**,不是校验门。那条刷屏的警告也不是游戏发的——是 **GUTS 编辑器**发的,
> 而且属性数据一个字节都没丢。

---

## 0. 结论先行

1. **引擎支持任意 tag(rghash 匹配,零校验)。** `TAGS.DAT` = GUTS 下拉列表 + hash→name 显示反查表,不是校验集。GUTS 里选不到某 tag,只因它不在这张表里;绕过 GUTS 直接写 DAT / 直接打包,任何 tag 都认。
2. **引擎硬编的 tag = 0 个。** 68 个候选 tag 的 hash 立即数搜遍整个 exe 代码段,0 命中;rghash 的 56 个调用者全是 DAT 字段键解析器。tag 100% 数据驱动——boss/hero 之类的特殊行为走 `UNITTYPES` / `MONSTERCLASS` / 显式 DAT 标志(如 `ISBOSS`),**不是 tag**。
3. **`no match in tags.dat` 警告是 GUTS 专属,数据不丢。** 游戏本体 `Torchlight2.exe` 里根本没有这条字符串。真正的风险不是"警告"本身,而是**用 GUTS 打开再保存**会把不认识的 key 名洗成 hash 数字,还可能顺手丢掉你编辑过的别的字段。

下面是每条的 exe 证据。

---

## 1. 引擎怎么认一个 tag:rghash + 纯哈希比较

**rghash = `sub_4C9FE0`**(`0x4C9FE0`)。djb2 的一个变体,逐 wchar 滚动:

```
h = len(s)
for wchar c in s:
    h = (h >> 27) ^ (h << 5) ^ c        # 逐指令确认:shr ecx,0x1B  shl esi,5  xor ecx,esi  xor ecx,edx
```

它和 `EditorGuts.dll` 里的 `sub_100CA9A0` 是同一个算法——这点很关键,因为 GUTS 编译 DAT 时用它算 key/name 的 hash,游戏运行时也用它算,两边必须一致才对得上。

**tag 匹配 = 一次纯 hash 比较**。`sub_4CA070` 反出来就一行:

```c
return rghash(a2) == this[2];   // this[2] 是这个 tag 对象加载时存下的 hash
```

没有注册表查询,没有成员校验。**任何字符串,只要它的 rghash 等于存下的那个值,就匹配。** 结构键(key)也一样:`sub_4CA7D0` 里硬编了 `BASEOBJECT` / `PROPERTIES` / `NAME` / `ID`,每个都是先 rghash 再比。

这就够定性了:比较的那一端是**加载数据时算出来的 hash**,从来不是"这个 tag 在不在合法集合里"。合法集合这个概念在运行时不存在。

---

## 2. TAGS.DAT 是什么:一张 hash→名字的反查表

那 `TAGS.DAT` 到底干嘛用的?`sub_65BBF0` 是它的运行时解析器(debug 串 `"Loading tag file:"` / `"Tags parsed. Total count:"`),逻辑很直白:

```
读 COUNT
循环读 TAG0..TAGn 的名字字符串:
    hash = rghash(name)
    entry = sub_4FF760(&hash)      # 在 map 里取/建这个 hash 的项
    entry+4 = name                 # 把名字挂上去
```

结果是一张 **`hash → name`** 的表,**给 UI/tooltip 反查显示名用的**。不是校验门:未登记的 tag 照样按 hash 匹配,只是缺一个好看的显示名。

顺带把 Q4(tag hash 到底是不是 rghash)钉死:对 3631 个 baseline tag 名逐个算 rghash,**3568 个(98%)命中 `TAGS.DAT` 里那 3692 个整数**。剩下 2% 的不命中是解码损坏 / 本地化碎片——`TAGS.DAT` 的字符串池里还混着非 tag 的本地化 UI 串(像 `', EINGANG'` 这种)。也就是说:**`TAGS.DAT` 里那些整数,就是名字的 rghash。** 这张表两个方向都能查(名字↔hash),GUTS 的下拉列表也从它来。

> 补一个容易踩的锚点:游戏里的 tag 注册**不走一条显式加载 `TAGS.DAT` 字符串的路径**。exe 里 `"MEDIA/TAGS.DAT"` 宽串(`@0x2182044`)只被 `sub_65B310`(一个 DAT→文本反编译工具)引用;`"TAGS"` 宽串(`@0x21821f4`)只被 `sub_789B00`(控制台命令分发器)引用,是个 debug 命令。都不是游戏性 tag 系统。

---

## 3. 引擎硬编了几个 tag?—— 0 个

"零校验"还留了个尾巴:万一引擎**特殊处理**某个 tag(比如看到 `HERO` 就触发特殊 AI)呢?两个独立角度收敛到同一个答案。

**角度一:56 个 rghash 调用者,逐个看。** 把 `sub_4C9FE0` 的全部 56 个调用点反编译、提传入的字符串常量,分类下来**全是各类 DAT/LAYOUT 的字段键解析器 + `TAGS.DAT` 加载器**,没有任何"魔法 tag":

- **结构/布局键**:`NAME` / `ID` / `PROPERTIES` / `BASEOBJECT` / `DESCRIPTOR` / `LOGICGROUP` / `PIECE` / `GUID` / `MESH` …
- **各内容类型的字段键**:SKILL(`SKILL_TYPE` / `ACTIVATION_TYPE` / `TARGET_ALIGNMENT` …)、AFFIX/EFFECT(`TARGET` / `IGNORE_UNITTYPE` / `DURATION` …)、QUEST(`TASK` / `REWARD` …)、以及 EMOTE/FEATURE/THEME/KEYBIND 等。
- **tag 注册表加载**:`sub_65BBF0`(`COUNT` / `TAG<i>`)。

结论:rghash 是个**通用的"DAT 字段键按哈希匹配"函数**,不是给某个具体 tag 开小灶的地方。

**角度二:直接搜 hash 立即数。** 引擎若要特殊处理某 tag,只能用**预计算好的 hash 立即数**去比(运行时不会临时哈希一个字符串常量)。于是:对 68 个候选 tag 算 rghash——28 个常见的游戏性猜测(`HERO` / `BOSS` / `CHAMPION` / `PET` / `SUMMONED` / `MALE` / `FEMALE` / `ELITE` / `MINION` …)+ 40 个真实 baseline 单词 tag——把它们的 little-endian u32 在**全 exe** `find_bytes` 搜一遍:**代码段 0 命中**。唯一那个"命中"是 `PET@0x253b69d`,但它无 xref、地址还不是 4 字节对齐 = 纯巧合的数据字节,不是 tag-hash 引用。

**→ tag 100% 数据驱动。** 一个自定义 tag 有没有意义,完全取决于你有没有**同时写好引用它的数据规则**(affix/loot/spawn DAT)。只有载体、没人检查 = 惰性死数据(无害,也没用)。想"白嫖"引擎现成的特殊行为?没有捷径——那些行为走 `UNITTYPES` / 类 / 显式标志,不认任何 tag 字符串。

---

## 4. 那条刷屏警告的真相:GUTS 专属,数据不丢

回到起因的那条日志。先做个决定性的事实核对:**`Found property name with a hashcode (…) that has no match in tags.dat:` 这条字符串,在 `Torchlight2.exe` 里搜不到**(ASCII、宽字节都 0 命中)。它只活在 `EditorGuts.dll` 里——宽串 `@0x11E93868`「Found property name with a hashcode (」+ 窄串 `@0x11E938BF`「) that has no match in tags.dat: 」。发出者是 `sub_10289D20`。

`sub_10289D20` 逐属性读流(每条属性 = `key_hash(4) + type(4) + value`),顺序是这样的:

```
sub_10287DD0(key_hash, value, …, type)     # ① 无条件先调用 —— 属性+值原样存下,永不丢
在 tags.dat 的 hash→name 树里查 key_hash:        # ② 之后才查
    命中  → 用真名(sub_10288C10(node+5))
    未命中 → 打这条警告,并 sub_10296760 把 hash 格式化成字符串,拿它当"名字"用
```

三点定论:

1. **这是 GUTS 编辑器的诊断信息。** 游戏引擎从不发、也不 care——和第 1 节"引擎按 hash 零校验匹配任意 tag"完全自洽。
2. **属性值不丢。** 存值那步(`sub_10287DD0`)在查表**之前**就无条件跑了。GUTS 只是没有友好名可显示,退化成拿 hashcode 当名字。
3. **真风险 = 过 GUTS 往返。** 一旦在 GUTS 里重存,这些"只剩 hash 名"的属性会以 hash **数字**写回(dev 的原话:GUTS 用 hash 数字替换不认的 key、还在此基础上重算 hash),而且 GUTS 可能**顺带丢弃你编辑过的其它字段**。绕开 GUTS——文本编辑 + 直接打包(mikuro packer)——这一整类问题根本不发生。

---

## 5. 实测:两个整合 mod 的 property key 排查

理论说完,拿真东西验。方法:把一个 mod 里出现的**每一个 property key** 拿去和 `TAGS.DAT` 的 3692 个登记 hash 对账,把"没登记"的自动分三桶——**GUTS 数字损坏 / 编辑距离 1 的 typo / 真·自定义**。

### 5.1 老 IMBA 整合(48,869 DAT)= typo 叠 GUTS 损坏

扫出来的"自定义 key",一细看全是**原版键漏了词尾 D 的坏版**:

| 坏 key | rghash | 文件数 | 判定 |
|---|---|---|---|
| `DEXTERITY_REQUIRE` | 1970490181 | 2720 | typo of `DEXTERITY_REQUIRED` |
| `STRENGTH_REQUIRE` | 2034231625 | 2517 | typo of `STRENGTH_REQUIRED` |
| `MAGIC_REQUIRE` | 4272869367 | 2272 | typo of `MAGIC_REQUIRED` |
| `DEFENSE_REQUIRE` | 1284104295 | 1638 | typo of `DEFENSE_REQUIRED` |
| `SHOULDERS_OVERRIDE` | 786463860 | 29 | 真自定义 / TL2 无护肩槽 → 惰性 |

前四个是原版的装备需求键 `*_REQUIRED`(引擎运行时按字符串算 hash 读:exe 宽串 `STRENGTH_REQUIRED@0x2174364` / `DEXTERITY_REQUIRED@0x2174304`)去掉词尾 D 的坏版。**引擎只读带 D 的**,所以这些缺 D 的键 = 死数据,它们写的属性需求**根本不被强制执行**。

全仓一算更触目:`*_REQUIRE`(坏)3439 文件、`*_REQUIRED`(原版)9412 文件、**两者并存仅 304 文件**。也就是说约 **3135 个物品只有缺 D 的坏键、没有原版键** —— 这些物品的属性需求被引擎静默忽略。

在这之上还叠了一层 GUTS 损坏:**53 个 key 被写成了纯十进制 hash 数字**(某次在 GUTS 里重存,文本 key 名被换成了它的 hash)。其中 5 个还能反查回原名(就是上面那几个 `*_REQUIRE` + `SHOULDERS_OVERRIDE`),另外 **48 个名字已经永久丢失**——不可逆,只能从别处副本找回或保留数字(还能跑,只是失去可读名)。

### 5.2 challenger-continent(72,740 DAT,走 mikuro packer、不过 GUTS)= 干净

同样的扫描,对照组结果:

- `*_REQUIRE`(坏)**0** 文件;`*_REQUIRED`(原版)14,615 文件;两者并存 0;需求失效 0。
- **GUTS 数字损坏 0 个。**
- 扫描器的原始 flag 经人工复核,**逐条落到"良性 / WIP"**:
  - `TIER4_DESCRIPTION`(3):★误报,非 typo。`TAGS.DAT` 只登记 `TIER1/2/3_DESCRIPTION`,`TIER4` 是有意的第 4 层扩展(纯显示,引擎按 1-3 读,无害)。
  - `MOD_ID` / `VERSION` / `AUTHOR` / `WEBSITE` / `MOD_FILE_NAME`(各 10):`MOD.DAT` 的清单头字段(10 个子库各一份),本就不属于游戏数据键,不在 `TAGS.DAT` 是对的。
  - `chest_OVERRIDE`(3)/ `belt_OVERRIDE`(6)/ `shoulders_OVERRIDE`(6),小写、在 `实验内容/` 下:真隐患但当前无害。**rghash 大小写敏感** → 小写版引擎读不到(原版是 `CHEST_OVERRIDE` 大写;`BELT`/`SHOULDERS` 压根没有原版槽位)。属 WIP。
  - `SHOULDERS_OVERRIDE`(76,大写):有意的自定义护肩槽键;TL2 无原版护肩槽,除非本 mod 另加槽位,否则惰性。
  - `INCLUDE_DEAD`(1):一次性自定义键,需确认意图。

对照很说明问题:**同一个引擎、同一张 `TAGS.DAT`、两个 mod**。过 GUTS 打包的那个,满身 typo + 53 处 hash 数字疤;走 mikuro packer 直接打包、不过 GUTS 的那个,两样都是 0。**"绕开 GUTS = 零损坏"** —— 在 7 万多个文件上被实证。

---

## 6. 配套工具

- **`scan_mod_problems.py`**:对着一个 mod 的 MEDIA 树 + `TAGS.DAT`,列出所有未登记的 property key,自动分桶(GUTS 数字损坏 / 编辑距离 1 typo / 真自定义)。上面两份报告就是它出的。注意"自定义/typo"这桶仍需人工复核——`TIER4_DESCRIPTION` 那个误报就是例子。
- **mikuro packer 的 DAT 反编译**:把编译后的 BINDAT / `.DAT` 还原成可读文本,好看清一个 shipped 或 GUTS 存过的 DAT 里**实际**装着哪些 key —— 那 53 个 hash 数字键就是这么抓出来的。

---

## 7. 给 modder 的三条实操

1. **想用 GUTS 里选不到的 tag?** 直接写 DAT / 直接打包就行,引擎认。但要让 tag "做事",你得自己写引用它的数据规则(affix/loot/spawn DAT);引擎不给任何 tag 白送行为。想补个显示名,把 tag 加进 `TAGS.DAT` 即可(仅影响 UI 显示)。
2. **别拿 GUTS 往返编辑第三方老 mod。** 它会把不认识的 key 洗成 hash 数字、还可能丢字段。要改就走文本 + 直接打包。
3. **看到满屏 `no match in tags.dat`?** 先分清是谁在打——如果是 GUTS,数据没丢,只是显示名退化;真要担心的是别把这些"只剩 hash 名"的属性再过一次 GUTS。

---

## 8. 诚实边界

- Q1 / Q3 / Q4 已用 exe 反编译实证:rghash `sub_4C9FE0`、匹配 `sub_4CA070`、注册表 `sub_65BBF0`、3568=98% 的 hash 对账、68 个 hash 立即数 0 命中。
- 注意区分两个不同问题:"**哪些 tag 能用**" = 全部(本文已答);"**哪些 tag 触发引擎特殊行为**" 需另搜预计算 hash 立即数——本轮只对 68 个候选搜过(0 命中),不是对全 hash 空间的证明。
- Q2(item/unit 的 tag 是**存的**还是**派生的**)本轮未收口:DAT 里几乎没有显式 `<>TAG:` 键,初步疑为派生,留待后续。
- rghash 是 32 位,理论上存在碰撞;baseline 那 3631 个名里混着 PAK 字符串池的非 tag 本地化串(就是对账里那 2% 不命中的来源)。

---

## 附录:关键地址

**`Torchlight2.exe`**(imagebase `0x400000`)

| 功能 | 地址 |
|---|---|
| rghash(名字/键哈希) | `sub_4C9FE0` |
| tag/key 匹配(纯 hash 比较) | `sub_4CA070` |
| 结构键解析(`BASEOBJECT`/`PROPERTIES`/`NAME`/`ID`) | `sub_4CA7D0` |
| `TAGS.DAT` 加载器(hash→name 反查表) / map 取建 | `sub_65BBF0` / `sub_4FF760` |
| 原版需求键宽串 | `STRENGTH_REQUIRED@0x2174364` / `DEXTERITY_REQUIRED@0x2174304` |
| `"MEDIA/TAGS.DAT"` 宽串(仅 DAT 反编译工具引用) / `"TAGS"` 控制台命令 | `@0x2182044`·`sub_65B310` / `@0x21821f4`·`sub_789B00` |

**`EditorGuts.dll`**(imagebase `0x10000000`)

| 功能 | 地址 |
|---|---|
| rghash 孪生 | `sub_100CA9A0` |
| 属性流读取 / 发那条 no-match 警告 | `sub_10289D20` |
| 查表前无条件存属性+值 | `sub_10287DD0` |
| hash→字符串(退化显示名) / 名字取值 | `sub_10296760` / `sub_10288C10` |
| 警告格式串 | 宽 `@0x11E93868` / 窄 `@0x11E938BF` |

**配套资源**:`原版游戏分析/TAGS_RE/`(`TAGS_ENGINE_SET.md` 主结论、`IMBA_custom_keys.txt` 与 `challenger_key_problems.txt` 两份排查报告、`_LEDGER.json` 逆向账本、`tags_dat_baseline.txt` 3631 名基线)。
