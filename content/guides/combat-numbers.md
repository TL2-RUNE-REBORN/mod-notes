---
title: "战斗数值全解"
date: 2026-07-21T12:20:19+10:00
author: "Mikuro"
summary: "四属性 → 派生战力 → 造成伤害 → 承受伤害(护甲平减 / 承伤%)→ 飘字颜色 → 攻击顺序 → 承伤收口,附一场 50 级狂战士 vs 大区长 Eldrayn 的实战对照。全程逆向实证。"
---
<div class="combat">
<p class="g-en">How Combat Numbers Work<span>属性 · 攻击 · 承伤</span></p>
<p class="g-lede">从<b>四个主属性</b>怎么变成战力,到<b>一次攻击</b>如何拆成多股伤害算出去,再到伤害<b>落在目标身上</b>怎么一层层被减免、最后扣掉多少血 —— 一张图讲清游戏里每个数字的来龙去脉。面向想搞懂机制、想调数值的模组玩家与作者。</p>
<!-- Ⅰ 属性 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅰ</span>
    <h2>四个属性,四种战力 <span class="en">The Four Stats</span></h2>
    <p class="lede">角色面板上的<b>力量 / 敏捷 / 专注 / 体力</b>不是摆设 —— 每一点都按固定规则换算成具体战斗数值。升级每级给 <b>5</b> 点。</p>
  </header>
  <div class="attr-grid">
    <article class="attr str">
      <div class="ah"><h4>力量</h4><span class="en">Strength</span></div>
      <div class="role">主攻输出 —— 越高打得越狠、暴击越疼</div>
      <hr>
      <ul>
        <li>武器物理伤害 <span class="val">+0.5% / 点</span></li>
        <li>暴击伤害 <span class="val">+0.4% / 点</span></li>
      </ul>
    </article>
    <article class="attr dex">
      <div class="ah"><h4>敏捷</h4><span class="en">Dexterity</span></div>
      <div class="role">精准与灵巧 —— 决定命中、暴击、躲避</div>
      <hr>
      <ul>
        <li>暴击<b>几率</b> <span class="val">曲线</span></li>
        <li>闪避几率 <span class="val">曲线</span></li>
        <li>命中率 <span class="val">+2.5% / 点</span></li>
        <li>减少"失手"惩罚</li>
      </ul>
    </article>
    <article class="attr foc">
      <div class="ah"><h4>专注</h4><span class="en">Focus</span></div>
      <div class="role">法术与元素 —— 技能流的核心</div>
      <hr>
      <ul>
        <li>技能伤害 <span class="val">+0.5% / 点</span></li>
        <li>元素武器伤害 <span class="val">+0.5% / 点</span></li>
        <li>最大法力 <span class="val">+0.5 / 点</span></li>
        <li>双击几率(斩杀)· 招架几率 <span class="val">曲线</span></li>
      </ul>
    </article>
    <article class="attr vit">
      <div class="ah"><h4>体力</h4><span class="en">Vitality</span></div>
      <div class="role">生存 —— 血、甲、盾三合一</div>
      <hr>
      <ul>
        <li>最大生命 <span class="val">+3.6 / 点</span></li>
        <li>护甲放大 <span class="val">+0.25% / 点</span></li>
        <li>格挡几率 <span class="val">曲线</span></li>
      </ul>
    </article>
  </div>
  <div class="callout">
    <b>关于"曲线":</b> 标着<span class="em">曲线</span>的几率都不是线性的,而是<b>越加涨得越慢(边际递减)</b>。而且它们不止一条 —— <b>暴击 / 闪避 / 格挡 / 招架是【完全相同】的一条</b>(50 点 ≈9.5%、100 点 ≈18%、堆到极限 500 也就 <b>50.1% 封顶</b>,所以这四个单看性价比一模一样,差别只在触发场景);<b>双击(斩杀)是另一条、更高</b>(0 点就有 ≈10%、500 到 <b>60%</b>);<b>失手正相反,是往下掉的</b>(越堆属性越不失手)。下面是从游戏数据文件直接读出来的原版曲线,<b>都能改</b>。
  </div>
  <h3 class="mini">原版曲线,直接从数据文件读出来</h3>
  <div class="mermaid-wrap">
<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, ui-monospace, monospace" role="img" aria-label="原版属性→几率曲线">
<line x1="62" y1="338.0" x2="550" y2="338.0" stroke="#2C241B" stroke-width="1"/>
<text x="54" y="338.0" fill="#675B48" font-size="10.5" text-anchor="end" dominant-baseline="middle">0%</text>
<line x1="62" y1="234.0" x2="550" y2="234.0" stroke="#2C241B" stroke-width="1"/>
<text x="54" y="234.0" fill="#675B48" font-size="10.5" text-anchor="end" dominant-baseline="middle">20%</text>
<line x1="62" y1="130.0" x2="550" y2="130.0" stroke="#2C241B" stroke-width="1"/>
<text x="54" y="130.0" fill="#675B48" font-size="10.5" text-anchor="end" dominant-baseline="middle">40%</text>
<line x1="62" y1="26.0" x2="550" y2="26.0" stroke="#2C241B" stroke-width="1"/>
<text x="54" y="26.0" fill="#675B48" font-size="10.5" text-anchor="end" dominant-baseline="middle">60%</text>
<line x1="62.0" y1="26" x2="62.0" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="62.0" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">0</text>
<line x1="159.6" y1="26" x2="159.6" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="159.6" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">100</text>
<line x1="257.2" y1="26" x2="257.2" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="257.2" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">200</text>
<line x1="354.8" y1="26" x2="354.8" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="354.8" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">300</text>
<line x1="452.4" y1="26" x2="452.4" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="452.4" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">400</text>
<line x1="550.0" y1="26" x2="550.0" y2="338" stroke="#2C241B" stroke-width="1"/>
<text x="550.0" y="354" fill="#675B48" font-size="10.5" text-anchor="middle">500</text>
<text x="306.0" y="396" fill="#94856D" font-size="10.5" text-anchor="middle" letter-spacing="1">属性点数 · 单项投入</text>
<polyline points="62.0,338.0 86.4,312.5 110.8,288.6 135.2,265.7 159.6,244.4 184.0,224.1 208.4,205.4 232.8,187.7 257.2,171.6 281.6,156.5 306.0,143.0 330.4,130.5 354.8,119.1 379.2,109.7 403.6,100.9 428.0,93.6 452.4,87.9 476.8,83.2 501.2,80.1 525.6,78.0 550.0,77.5" fill="none" stroke="#FF9A3C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="550.0" cy="77.5" r="3.2" fill="#FF9A3C"/>
<text x="559.0" y="77.5" fill="#FF9A3C" font-size="11" dominant-baseline="middle">暴击·闪避·格挡·招架</text>
<text x="559.0" y="90.5" fill="#FF9A3C" font-size="9.5" opacity="0.8" dominant-baseline="middle">末端 50%</text>
<polyline points="62.0,287.0 86.4,261.6 110.8,237.6 135.2,214.8 159.6,193.4 184.0,173.2 208.4,154.4 232.8,136.8 257.2,120.6 281.6,105.6 306.0,91.5 330.4,79.6 354.8,68.1 379.2,58.8 403.6,49.9 428.0,42.6 452.4,36.9 476.8,32.2 501.2,29.1 525.6,27.0 550.0,26.0" fill="none" stroke="#7CC96E" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="550.0" cy="26.0" r="3.2" fill="#7CC96E"/>
<text x="559.0" y="26.0" fill="#7CC96E" font-size="11" dominant-baseline="middle">双击(斩杀)</text>
<text x="559.0" y="39.0" fill="#7CC96E" font-size="9.5" opacity="0.8" dominant-baseline="middle">末端 60%</text>
<polyline points="62.0,228.8 86.4,239.2 110.8,249.1 135.2,258.4 159.6,267.3 184.0,275.6 208.4,283.4 232.8,290.7 257.2,297.4 281.6,303.7 306.0,309.4 330.4,314.6 354.8,319.3 379.2,322.9 403.6,326.6 428.0,329.7 452.4,331.8 476.8,333.8 501.2,335.4 525.6,335.9 550.0,336.4" fill="none" stroke="#6FA8FF" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="550.0" cy="336.4" r="3.2" fill="#6FA8FF"/>
<text x="559.0" y="336.4" fill="#6FA8FF" font-size="11" dominant-baseline="middle">失手</text>
<text x="559.0" y="349.4" fill="#6FA8FF" font-size="9.5" opacity="0.8" dominant-baseline="middle">末端 0%</text>
<line x1="110.8" y1="26" x2="110.8" y2="338" stroke="#453724" stroke-width="1" stroke-dasharray="3 3"/>
<text x="110.8" y="22" fill="#94856D" font-size="9" text-anchor="middle">50点</text>
</svg>
  </div>
  <p class="mermaid-cap">数据源 <b>GRAPHS/STATS/*.DAT</b>(每 25 点采样)。★暴击=闪避=格挡=招架四条<b>完全重合成一条</b>;双击(EXECUTE)更高、失手(FUMBLE)向下走。横轴=单项属性投入点数,纵轴=几率%。</p>
  <h3 class="mini">代入数字看看</h3>
  <div class="quickcalc">
    <div><span class="qk">力量 100</span><span class="qv">武器伤害 ×1.5 (+50%)</span></div>
    <div><span class="qk">力量 100</span><span class="qv">暴击伤害 +40%</span></div>
    <div><span class="qk">敏捷 50</span><span class="qv">暴击/闪避 ≈ 9.5%</span></div>
    <div><span class="qk">专注 100</span><span class="qv">技能伤害 +50%</span></div>
    <div><span class="qk">体力 100</span><span class="qv">最大生命 +360</span></div>
    <div><span class="qk">体力 100</span><span class="qv">护甲 ×1.25 (+25%)</span></div>
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅱ 攻击 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅱ</span>
    <h2>一次攻击是怎么打出去的 <span class="en">Dealing Damage</span></h2>
    <p class="lede">很多人以为"打一下 = 一个伤害数"。其实<b>一次攻击天生是多股伤害</b>:一把武器可以同时带物理 + 火 + 冰,命中时<b>每种元素各算各的</b>,互不干扰。</p>
  </header>
  <h3 class="mini">同一次攻击,五种元素各走各的</h3>
  <div class="prose"><p>武器和技能的伤害都拆成<b>五个独立通道</b>。你砍一刀,如果武器带火附魔,那就是"物理一股 + 火焰一股"同时飞过去,落地时分别被对方的<b>物理护甲</b>和<b>火焰抗性</b>减免。所以"一次攻击有多次结算"是<span class="em">对的</span> —— 但那不是攻击了好几次,而是<b>一次攻击被拆成几股元素分量</b>,一起结算。</p></div>
  <div class="elem-row">
    <div class="elem phys"><div class="ei">◆</div><div class="el-n">物理</div><div class="el-e">Physical</div></div>
    <div class="elem fire"><div class="ei">✦</div><div class="el-n">火</div><div class="el-e">Fire</div></div>
    <div class="elem ice"><div class="ei">❄</div><div class="el-n">冰</div><div class="el-e">Ice</div></div>
    <div class="elem elec"><div class="ei">⚡</div><div class="el-n">电</div><div class="el-e">Electric</div></div>
    <div class="elem pois"><div class="ei">☣</div><div class="el-n">毒</div><div class="el-e">Poison</div></div>
  </div>
  <h3 class="mini">从"挥一刀"到"伤害数字"的四步</h3>
  <ol class="flow">
    <li>
      <div>
        <div class="st-t">合成武器伤害<span class="en">Weapon Damage</span></div>
        <div class="st-d">取武器面板伤害,乘上<span class="em">稀有度加成</span>和<span class="em">攻速加成</span>,再过一条按角色等级放大的曲线。加上力量给的 <b>+物理%</b>、专注给的 <b>+元素%/技能%</b>。</div>
      </div>
    </li>
    <li>
      <div>
        <div class="st-t">拆成五元素<span class="en">Split</span></div>
        <div class="st-d">按武器/技能的元素配比,把总伤害分到<b>物理·火·冰·电·毒</b>五个通道,在 MIN~MAX 区间内各自 roll 一个值。</div>
      </div>
    </li>
    <li>
      <div>
        <div class="st-t">暴击判定<span class="en">Critical</span></div>
        <div class="st-d">先用<b>敏捷</b>决定的暴击几率掷骰。中了 → 整发攻击乘上<b>暴击伤害</b>(力量决定,基础起步 <b>×1.5</b>,上限 <b>×6</b>=+500%)。暴击会把你攒的累计伤害<span style="color:var(--dmg-blue)">立即刷成蓝</span>、并跳一个"暴击!"(见 Ⅴ)。</div>
        <div class="branch"><span class="chip bal">暴击几率 ← 敏捷</span><span class="chip bal">暴击伤害 ← 力量</span><span class="chip del">硬上限 +500%</span></div>
      </div>
    </li>
    <li>
      <div>
        <div class="st-t">命中判定<span class="en">Hit / Miss</span></div>
        <div class="st-d">攻击方的<b>命中率</b>对上防御方的<b>闪避</b>:被<span class="em">闪避</span>=这下完全落空(只有近战武器攻击能被闪避)。武器攻击还要再过防御方的<b>格挡</b>。都没躲过 → 命中,进入承伤结算(见下一段)。</div>
        <div class="branch"><span class="chip opt">命中 ← 敏捷</span><span class="chip fix">闪避只挡近战</span><span class="chip fix">格挡挡得更宽</span></div>
      </div>
    </li>
  </ol>
  <blockquote>一次挥砍,可能同时是"物理 + 火 + 冰"三股伤害、每股独立被减、还叠一层暴击 —— 头顶那一个数字,其实是这几股加起来的总和。</blockquote>
  <div class="calc">
    <div class="ct"><span>算例 · 一次暴击打怪</span><span class="setup">力量 100 · 武器物理 100</span></div>
    <div class="cbody">
      <div class="step"><div class="desc">武器基础物理伤害</div><div class="eq"><span class="out">100</span></div></div>
      <div class="step"><div class="desc"><span class="k">力量 100</span> → 物理伤害 +50%</div><div class="eq"><span class="in">100 × 1.5 =</span> <span class="out">150</span></div></div>
      <div class="step"><div class="desc"><span class="k">暴击!</span> 基础 +50% 叠力量给的 +40% = ×1.9</div><div class="eq"><span class="in">150 × 1.9 =</span> <span class="out">285</span></div></div>
      <div class="step final blue"><div class="desc">打在怪身上 · 暴击 → 你的累计伤害(含这一击)被<b>立即刷成蓝</b>(见 Ⅴ)</div><div class="eq"><span class="out">285</span></div></div>
    </div>
    <div class="cnote"><b>套路就三步:</b> 面板伤害 → ×(1 + 力量×0.5%) → ×(1 + 暴伤%)。不暴击就省掉第三步;带火附魔的话,火那一股另走专注、单独再算一遍加上去。</div>
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅲ 承伤 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅲ</span>
    <h2>伤害落地,一层层减下来 <span class="en">Taking Damage</span></h2>
    <p class="lede">命中之后,伤害不是直接扣血,而是按<b>固定顺序</b>过好几道关卡。每一关都可能把它削掉一截,甚至归零。</p>
  </header>
  <h3 class="mini">减免的先后顺序</h3>
  <div class="chain">
    <div class="node"><div class="cn-t">① 格挡</div><div class="cn-d">先看挡不挡得住</div></div>
    <div class="arw">→</div>
    <div class="node"><div class="cn-t">② 护甲 / 抗性</div><div class="cn-d">五元素各自减免</div></div>
    <div class="arw">→</div>
    <div class="node"><div class="cn-t">③ 护盾缓冲</div><div class="cn-d">吸掉一部分</div></div>
    <div class="arw">→</div>
    <div class="node"><div class="cn-t">④ 扣血</div><div class="cn-d">剩下的进 HP</div></div>
  </div>
  <div class="tbl-wrap">
  <table>
    <thead><tr><th>关卡</th><th>怎么减</th><th>要点</th></tr></thead>
    <tbody>
      <tr>
        <td>格挡</td>
        <td>掷格挡骰,成功则拦下</td>
        <td><b>玩家格挡 = 这一下整发免疫</b>(不是减一点,是全免);<b>怪物的盾</b>则是吸收一个固定的"盾值",超过就把盾打碎、余下穿透。玩家格挡需要<b>装盾</b>,上限 75%(我们的模组可提到 85%)。</td>
      </tr>
      <tr>
        <td>护甲 / 抗性</td>
        <td>五元素各自被对应护甲减</td>
        <td><span class="chip bal">关键</span> 护甲减伤<b>带随机</b> —— 每次实际生效的护甲是面板值的 <b>50%~100%</b> 之间随机取一个。所以<b>同样护甲挡同一击,每次减的量都不一样</b>。火伤只被火抗减,物理只被护甲减,互不通用。</td>
      </tr>
      <tr>
        <td>减伤%</td>
        <td>各种"减少X%受到伤害"叠加</td>
        <td>护甲算完后再乘一道总减伤。玩家硬上限 <b>75%</b>(我们的金刚灵石可破到 95%);怪物可以到 100%(免疫)。</td>
      </tr>
      <tr>
        <td>护盾缓冲</td>
        <td>某些技能给的护盾条</td>
        <td>在护甲之后、扣血之前,直接吸掉一截。吸满了就"护盾破碎",余下的才进血。</td>
      </tr>
    </tbody>
  </table>
  </div>
  <div class="callout">
    <b>为什么护甲要随机?</b> 这是原版就有的设计 —— 让"同样的甲、同样的攻击"每次结果略有浮动,数字不会永远一模一样。<span class="em">Godot 重制若要还原手感,这个 50%~100% 的随机必须照搬</span>,否则减伤会显得"太死板"。
  </div>
  <div class="calc">
    <div class="ct"><span>算例 · 你挨一记火球</span><span class="setup">来袭 200 火焰 · 你 −40% 减伤</span></div>
    <div class="cbody">
      <div class="step"><div class="desc">火球打到你身上</div><div class="eq"><span class="out">200</span> <span class="in">火焰</span></div></div>
      <div class="step"><div class="desc">火焰<span class="k">抗性/护甲</span>减免(护甲随机 50–100%,这一击约减到)</div><div class="eq"><span class="in">≈</span> <span class="out">150</span></div></div>
      <div class="step"><div class="desc">你的<span class="k">减伤 −40%</span></div><div class="eq"><span class="in">150 × 0.6 =</span> <span class="out">90</span></div></div>
      <div class="step final red"><div class="desc">扣血 · 红字(受到的伤害)</div><div class="eq"><span class="out">90</span></div></div>
    </div>
    <div class="cnote"><b>护甲那步每次都不一样</b> —— 同一发火球、同样的抗性,因为护甲 50–100% 随机,这次减到 150、下次可能 130。减伤% 玩家最多堆到 −75%(再高被截),我们的金刚灵石能破到 −95%。</div>
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅳ 来源 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅳ</span>
    <h2>伤害到底从哪来 <span class="en">Where Damage Comes From</span></h2>
    <p class="lede">武器、技能、燃烧、中毒、反弹…看着五花八门,其实<b>都汇进同一条扣血通道</b>。分清它们只在于"怎么产生"和"要不要过抗性"。</p>
  </header>
  <div class="tbl-wrap">
  <table>
    <thead><tr><th>来源</th><th>怎么产生</th><th>特点</th></tr></thead>
    <tbody>
      <tr><td>武器攻击</td><td>武器伤害合成 → 五元素</td><td>能被闪避 + 格挡;近战按挥砍弧命中</td></tr>
      <tr><td>技能直伤</td><td>弹道 / 范围命中</td><td><b>命中之后和武器攻击完全同一条链</b> —— 只是前面产生方式不同</td></tr>
      <tr><td>持续伤害 DOT<br><span style="color:var(--muted);font-weight:400;font-size:12px">燃烧 / 中毒 / 触电 / 冰缓</span></td><td>命中时先 roll <b>元素抗性</b>,中了才挂上</td><td><b>不是当场算完</b> —— 挂上之后<b>每一帧跳一次伤害</b>,持续几秒。着火的怪头顶不停跳数字,就是这个</td></tr>
      <tr><td>控制效果<br><span style="color:var(--muted);font-weight:400;font-size:12px">击晕 / 减速 / 定身 / 击退</span></td><td>命中时 roll <b>对应抗性</b></td><td>不直接扣血,是施加状态。你面板上的"<b>减速抗性 / 定身抗性</b>"挡的就是这类,<b>挡不了直接伤害</b></td></tr>
      <tr><td>反弹伤害</td><td>受击时按反弹%弹回攻击者</td><td>沿同一条扣血通道打回去</td></tr>
    </tbody>
  </table>
  </div>
  <div class="callout">
    <b>DOT 和多元素的区别:</b> 多元素是<span class="em">一次命中在空间上拆成几股</span>(物理+火同时到);DOT 是<span class="em">一次命中在时间上拆成几跳</span>(中毒后每帧掉一点,掉好几秒)。两者可以叠加 —— 一发带毒的火球,既是"火+毒两股直伤",命中后还可能再挂一层"毒 DOT"每帧跳。
  </div>
  <blockquote>不管伤害从哪来 —— 武器、技能、DOT 的每一跳、反弹 —— 真正扣血永远走同一个出口。这也是为什么模组要做"全局减伤 / 吸血 / 伤害统计",只要接住这一个出口,就能覆盖<em>所有</em>伤害。</blockquote>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅴ 飘字 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅴ</span>
    <h2>头顶那个数字什么颜色,什么意思 <span class="en">Floating Numbers</span></h2>
    <p class="lede">游戏里跳的伤害字有几种颜色 —— 引擎把你的<b>连续伤害攒成一堆</b>汇总显示,再叠上<b>暴击</b>和<b>失手(伤害打折的命中)</b>两种特殊情况。跟远近、元素、"能不能格挡"都无关。</p>
  </header>
  <div class="legend">
    伤害飘字 ——
    <em class="o">■ 橙 = 普通累计伤害</em> ·
    <em class="b">■ 蓝 = 暴击</em> ·
    <em class="p">■ 紫 = 失手/擦过(伤害打折)</em> ·
    <em class="r">■ 红 = 落在你身上的失手命中</em>
  </div>
  <div class="float-demo">
    <div class="fd orange">
      <div class="num">247</div>
      <div class="lbl">橙色 · 主色</div>
      <div class="desc"><b>普通命中</b> —— 引擎把你短时间的伤害攒成一堆,<b>约半秒到点</b>就汇总成一个橙数字</div>
    </div>
    <div class="fd blue">
      <div class="num"><small>暴击!</small>512</div>
      <div class="lbl">蓝色</div>
      <div class="desc"><b>暴击</b> —— 这堆累计伤害被你的<b>暴击立即刷出来</b>,显示成蓝,并跳"暴击!"</div>
    </div>
    <div class="fd purple">
      <div class="num">2</div>
      <div class="lbl">紫色 · 品红</div>
      <div class="desc"><b>失手 / 擦过(fumble)</b> —— 这一击伤害被<b>打了折、砍得很小</b>,命中就单画一个紫数字(所以数字往往很小)</div>
    </div>
    <div class="fd red">
      <div class="num">88</div>
      <div class="lbl">红色</div>
      <div class="desc"><b>失手命中落在你身上</b> —— 打折的那种命中,落到角色头上是红</div>
    </div>
  </div>
  <div class="callout">
    <b>为什么会变色:</b> 引擎把你打出的伤害先<span class="em">攒成一堆</span>(累加器):<b>到点(约0.5秒)自动刷</b> → <b>橙</b>;要是打出<b>暴击</b>,就立刻把这堆刷出来 → <b>蓝</b>(所以暴击是蓝、不是另一个颜色)。而<b>失手/擦过</b>(fumble —— 引擎把这一击伤害<b>打了折</b>)是<b>单独即时画</b>的:打怪<b>紫</b>、落你身上<b>红</b>。所以那个"<b>2 点紫</b>"其实是一次<b>失手</b>——伤害被砍到只剩 2 点,才会又小又紫。<b>跟武器远近、跟暴击、跟"能不能格挡"都没关系。</b>屏幕角落<b>战斗日志</b>的黄字是另一回事。
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅵ 攻击计算 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅵ</span>
    <h2>一次攻击,引擎按顺序算了这么多 <span class="en">The Attack Sequence</span></h2>
    <p class="lede">你点一下攻击,引擎不是"算个伤害"这么简单 —— 它按<b>固定顺序</b>掷好几次骰、算好几层,而且这些骰之间还<b>互相排斥</b>。把顺序捋清,前面那些颜色、数字就全串起来了。</p>
  </header>
  <div class="mermaid-wrap">
<!-- flow6: emberworks 内联 SVG(scratchpad/gen_flowcharts.py 生成,替代原 mermaid;站点无 mermaid runtime) -->
<svg viewBox="0 0 700 660" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, ui-monospace, monospace" role="img" aria-label="攻击结算顺序流程图">
<defs><marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7a6b52"/></marker></defs>
<rect x="70" y="22" width="190" height="44" rx="8" fill="#17150f" stroke="#BDB4A4" stroke-width="1.4"/>
<text x="165.0" y="37.0" fill="#d9cdb6" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">普通攻击</text>
<text x="165.0" y="51.0" fill="#d9cdb6" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">武器基础伤害</text>
<rect x="440" y="22" width="190" height="44" rx="8" fill="#1a1509" stroke="#D8B26A" stroke-width="1.4"/>
<text x="535.0" y="37.0" fill="#e6c987" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">技能攻击</text>
<text x="535.0" y="51.0" fill="#e6c987" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">技能定义 伤害·元素·效果</text>
<rect x="250" y="104" width="200" height="48" rx="24.0" fill="#17130d" stroke="#6b5a40" stroke-width="1.4"/>
<text x="350.0" y="128.0" fill="#dcd0b8" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">命中率 vs 对方闪避</text>
<rect x="500" y="106" width="180" height="44" rx="8" fill="#141210" stroke="#675B48" stroke-width="1.4"/>
<text x="590.0" y="128.0" fill="#94856D" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">落空 · 完全未命中</text>
<rect x="250" y="190" width="200" height="44" rx="22.0" fill="#17130d" stroke="#6b5a40" stroke-width="1.4"/>
<text x="350.0" y="212.0" fill="#dcd0b8" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">失手判定</text>
<rect x="20" y="188" width="200" height="48" rx="8" fill="#1b0f1a" stroke="#ff4af0" stroke-width="1.4"/>
<text x="120.0" y="205.0" fill="#ff9af5" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">伤害被打折</text>
<text x="120.0" y="219.0" fill="#ff9af5" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">→ 紫字</text>
<rect x="250" y="272" width="200" height="44" rx="22.0" fill="#17130d" stroke="#6b5a40" stroke-width="1.4"/>
<text x="350.0" y="294.0" fill="#dcd0b8" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">暴击判定</text>
<rect x="12" y="270" width="208" height="48" rx="8" fill="#0f1723" stroke="#6FA8FF" stroke-width="1.4"/>
<text x="116.0" y="287.0" fill="#a9ccff" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">伤害大涨 上限 ×6</text>
<text x="116.0" y="301.0" fill="#a9ccff" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">→ 蓝字</text>
<rect x="250" y="356" width="200" height="48" rx="8" fill="#1e1710" stroke="#FF9A3C" stroke-width="1.4"/>
<text x="350.0" y="373.0" fill="#ffc26b" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">正常伤害</text>
<text x="350.0" y="387.0" fill="#ffc26b" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">→ 橙字</text>
<rect x="240" y="444" width="220" height="48" rx="8" fill="#191410" stroke="#453724" stroke-width="1.4"/>
<text x="350.0" y="461.0" fill="#D9CDB6" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">五元素合成</text>
<text x="350.0" y="475.0" fill="#D9CDB6" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">物理·火·冰·电·毒</text>
<rect x="240" y="528" width="220" height="52" rx="8" fill="#0f1610" stroke="#7CC96E" stroke-width="1.4"/>
<text x="350.0" y="547.0" fill="#a9dfa0" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">护甲 / 抗性减免</text>
<text x="350.0" y="561.0" fill="#a9dfa0" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">实际护甲 50~100% 随机</text>
<rect x="250" y="604" width="200" height="44" rx="8" fill="#221a0e" stroke="#FF9A3C" stroke-width="1.4"/>
<text x="350.0" y="626.0" fill="#ffc26b" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">扣血 → 见 Ⅶ 承伤</text>
<path d="M165,66 C165,88 305,86 332,103" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M535,66 C535,88 395,86 368,103" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M450,128 H500" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,152 V190" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M250,212 H222" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,234 V272" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M250,294 H222" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,316 V356" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,404 V444" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M120,236 V468 H240" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M116,318 L150,342 V460 H240" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,492 V528" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M350,580 V604" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<rect x="461.4" y="111" width="27.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="475" y="120" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">被闪避</text>
<rect x="355.6" y="162" width="20.8" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="366" y="171" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">命中</text>
<rect x="225.6" y="195" width="20.8" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="236" y="204" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">失手</text>
<rect x="358.4" y="244" width="27.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="372" y="253" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">没失手</text>
<rect x="225.6" y="277" width="20.8" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="236" y="286" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">暴击</text>
<rect x="360.4" y="327" width="27.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="374" y="336" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">没暴击</text>
</svg>
  </div>
  <p class="mermaid-cap">★ <b>失手判定在暴击判定之前</b> —— 一旦失手,就不再掷暴击。这就是"失手 ↔ 暴击互斥"。</p>
  <div class="callout">
    <b>普通攻击 vs 技能攻击 —— 差别在起点,不在过程:</b> 命中之后<span class="em">全走完全一样的结算</span>(命中/失手/暴击/五元素合成/减免/扣血/飘字颜色,一模一样),区别只在<b>伤害怎么进来</b>。而且引擎里"出手方式"其实分好几种、最后<b>全汇到同一套结算</b>:
    <br>· <b>近战平砍</b>(左键点怪):是<b>武器自己"直接挥一下"</b> —— ★不是技能、不耗资源、<b>即时命中</b>(碰到就算,没有飞行物)。
    <br>· <b>远程平砍</b>(弓 / 枪 / 法杖):看着也是"普通攻击",其实是<b>发射一个内置技能</b>,打出一颗弹道飞过去。
    <br>· <b>技能攻击</b>:伤害 / 元素 / 形状由<b>技能自己定义</b>,耗魔力 / 充能;还能带<b>专属属性</b>(不可格挡、范围 AOE、多段命中)。
    <br>· <b>范围 AOE / 持续伤害(燃烧中毒)</b>等还有各自的出手方式。—— 这么多入口,<b>命中后一律汇入上面那条流程</b>。所以暴击/失手/元素减免这些规律,<b>近战平砍、远程、放技能全都一样成立</b>;换出手方式只改"打出多少、什么元素、什么特效",不改"怎么结算"。
  </div>
  <h3 class="mini">按顺序,一步步掷</h3>
  <ol class="flow">
    <li><div>
      <div class="st-t">命中判定<span class="en">Hit / Miss</span></div>
      <div class="st-d">你的<b>命中率</b>对上对方<b>闪避</b>。被闪避 → 这下<span class="em">完全落空</span>,后面都不算(只有近战武器攻击能被闪避)。</div>
      <div class="branch"><span class="chip opt">命中 ← 敏捷</span><span class="chip del">被闪避=落空</span></div>
    </div></li>
    <li><div>
      <div class="st-t">失手 或 暴击(★互斥)<span class="en">Fumble XOR Crit</span></div>
      <div class="st-d">命中之后掷一次决定这击的"性质":要么可能<b>失手</b>(伤害被<b>打折</b>,跳<span style="color:var(--dmg-purple)">紫</span>字),要么可能<b>暴击</b>(伤害<b>大涨</b>,跳<span style="color:var(--dmg-blue)">蓝</span>字)。<span class="em">引擎二选一,同一击不会既失手又暴击。</span></div>
      <div class="branch"><span class="chip bal">暴击 ← 敏捷几率 / 力量倍率</span><span class="chip fix">失手 ← 失手率</span></div>
    </div></li>
    <li><div>
      <div class="st-t">合成五元素<span class="en">Split</span></div>
      <div class="st-d">把这击拆成<b>物理·火·冰·电·毒</b>五股,在 MIN~MAX 区间各 roll 一个值(见 Ⅱ)。暴击时整发再 ×(1+暴击伤害),硬上限 <b>+500%</b>。</div>
    </div></li>
    <li><div>
      <div class="st-t">护甲 / 抗性减免<span class="en">Mitigate</span></div>
      <div class="st-d">每股被对方<b>对应元素</b>的护甲减免 —— ★护甲是<b>直接扣掉一坨</b>(平减,不是减百分比)。扣的量 = 面板护甲的 <b>50%~100% 随机</b>,同护甲每次都不同(见 Ⅶ)。</div>
      <div class="branch"><span class="chip bal">平减 · 非百分比</span><span class="chip bal">护甲随机 50–100%</span></div>
    </div></li>
    <li><div>
      <div class="st-t">扣血<span class="en">Apply</span></div>
      <div class="st-d">五股加起来落到血条。这里就接上了 Ⅶ 的"承伤收口"。</div>
    </div></li>
  </ol>
  <div class="callout">
    <b>★失手 ↔ 暴击是互斥的:</b> 一次命中,引擎要么让它"可能暴击"、要么"可能失手",<b>不会两者都来</b>(甚至有二次判定:某些情况会把已经暴击的这击<b>降级成失手</b>)。这正是 Ⅴ 里那个"又小又紫"数字的来历 —— 失手把伤害<b>砍小了</b>、又走瞬时紫;而暴击是又大又蓝。<b>失手 ≠ 未命中</b>:失手是"打中了但打轻了",未命中(被闪避)是压根没碰到。
  </div>
  <div class="callout">
    <b>★"命中"其实过两道关(逆向实证):</b> 第一关你的<b>命中率</b>对上对方<b>闪避</b>;第二关你自己还背着一条<span class="em">失手率(Miss Chance)</span> —— <b>两道都过</b>才算"结实命中"。装备 / 致盲 / 诅咒能拉高你的失手率,让你更常打空。★对<b>玩家</b>而言,没过这两关<b>多半是降级成"擦伤"</b>(打中了但伤害被砍小、跳<span style="color:var(--dmg-purple)">紫</span>字),而<b>整发落空</b>(碰都没碰到)是更早一层的过滤。所以 Ⅴ 里手枪那"又小又紫的 2 点"= 一次擦伤,<b>不是脱靶</b>。
    <br><span class="dim" style="font-size:12px">模组向:第二关那条 stat 叫 <b>MISS CHANCE</b>(攻击方自身),不是对方的属性。</span>
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅶ 承伤结算 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅶ</span>
    <h2>所有伤害,最后都走同一个出口 <span class="en">Taking the Hit</span></h2>
    <p class="lede">不管伤害从哪来 —— 武器、技能、燃烧中毒、反弹 —— 落到血条前都汇到<b>同一个收口</b>。搞懂这个收口,就搞懂了"改伤害"的所有开关在哪拧。</p>
  </header>
  <div class="mermaid-wrap">
<!-- flow7: emberworks 内联 SVG(scratchpad/gen_flowcharts.py 生成,替代原 mermaid;站点无 mermaid runtime) -->
<svg viewBox="0 0 700 512" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, ui-monospace, monospace" role="img" aria-label="承伤收口流程图">
<defs><marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7a6b52"/></marker></defs>
<rect x="120" y="20" width="440" height="44" rx="8" fill="#191410" stroke="#453724" stroke-width="1.4"/>
<text x="340.0" y="42.0" fill="#D9CDB6" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">来源:武器 / 技能 / 燃烧中毒 DOT / 反射</text>
<rect x="280" y="98" width="120" height="40" rx="8" fill="#191410" stroke="#453724" stroke-width="1.4"/>
<text x="340.0" y="118.0" fill="#D9CDB6" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">命中</text>
<rect x="210" y="168" width="260" height="50" rx="25.0" fill="#17130d" stroke="#6b5a40" stroke-width="1.4"/>
<text x="340.0" y="186.0" fill="#dcd0b8" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">双持同类武器?</text>
<text x="340.0" y="200.0" fill="#dcd0b8" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">概率触发 EXECUTE 双击</text>
<rect x="500" y="170" width="190" height="50" rx="8" fill="#1d1708" stroke="#FFD24A" stroke-width="1.4"/>
<text x="595.0" y="188.0" fill="#ffe08a" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">副手也打一下</text>
<text x="595.0" y="202.0" fill="#ffe08a" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">这一击 ×2 伤害</text>
<rect x="240" y="262" width="200" height="54" rx="8" fill="#0f1610" stroke="#7CC96E" stroke-width="1.4"/>
<text x="340.0" y="282.0" fill="#a9dfa0" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">减免层</text>
<text x="340.0" y="296.0" fill="#a9dfa0" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">格挡→护甲/抗性→护盾</text>
<rect x="20" y="256" width="180" height="54" rx="8" fill="#1b0f1a" stroke="#ff4af0" stroke-width="1.4"/>
<text x="110.0" y="276.0" fill="#ff9af5" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">反射:一部分伤害</text>
<text x="110.0" y="290.0" fill="#ff9af5" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">原路打回自己</text>
<rect x="240" y="356" width="200" height="54" rx="8" fill="#221a0e" stroke="#FF9A3C" stroke-width="1.4"/>
<text x="340.0" y="376.0" fill="#ffc26b" font-size="11.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">★承伤收口</text>
<text x="340.0" y="390.0" fill="#ffc26b" font-size="10.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">唯一扣血出口</text>
<rect x="280" y="436" width="120" height="44" rx="22.0" fill="#17130d" stroke="#6b5a40" stroke-width="1.4"/>
<text x="340.0" y="458.0" fill="#dcd0b8" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">血条 HP</text>
<rect x="500" y="438" width="180" height="44" rx="8" fill="#1c0f0a" stroke="#E0592E" stroke-width="1.4"/>
<text x="590.0" y="460.0" fill="#f0855e" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">死亡 / 肢解</text>
<rect x="40" y="438" width="170" height="44" rx="8" fill="#191410" stroke="#453724" stroke-width="1.4"/>
<text x="125.0" y="460.0" fill="#D9CDB6" font-size="11.5" font-weight="400" text-anchor="middle" dominant-baseline="middle">存活</text>
<path d="M340,64 V98" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M340,138 V168" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M470,193 H500" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M340,218 V262" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M595,220 V289 H440" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M110,310 V383 H240" fill="none" stroke="#7a6b52" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#ah)"/>
<path d="M340,316 V356" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M340,410 V436" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M400,458 H500" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<path d="M280,458 H210" fill="none" stroke="#7a6b52" stroke-width="1.4" marker-end="url(#ah)"/>
<rect x="441.4" y="151" width="91.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="487" y="160" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">触发 · Focus 提升</text>
<rect x="330.4" y="231" width="59.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="360" y="240" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">不触发 / 单持</text>
<rect x="148.0" y="363" width="40.0" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="168" y="372" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">走同一收口</text>
<rect x="441.6" y="441" width="20.8" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="452" y="450" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">归零</text>
<rect x="231.4" y="441" width="27.2" height="16" rx="3" fill="#100e0b" opacity="0.9"/><text x="245" y="450" fill="#94856d" font-size="10" text-anchor="middle" dominant-baseline="middle">尚有血</text>
</svg>
  </div>
  <p class="mermaid-cap">任何来源命中后都汇到<b>同一个承伤收口</b>扣血 —— hook 这个收口,一次覆盖所有伤害来源。</p>
  <div class="prose"><p>五种来源(武器攻击、技能直伤、持续伤害 DOT、控制、反射)产生方式各不同,但命中<b>之后</b>全走同一条:先过减免(格挡→护甲→护盾),再由这个<b>收口</b>真正扣血。所以要做"全局减伤 / 吸血 / 伤害统计"这类 MOD,只要盯住这个收口就覆盖了<b>所有来源</b>,不用去追每一个产生点。</p></div>
  <div class="callout">
    <b>EXECUTE 双击(游戏里叫"斩杀",但其实不是秒杀):</b> 双持<b>两把同类武器</b>(近战 / 手枪 / 法杖 / 匕首,各配一套),攻击时有几率<span class="em">同时用两把武器各打一下</span> —— 官方原话是 "striking with both weapons at one time",<b>就是这一击打出约两份伤害</b>,再照常走减免、扣血。<b>不是秒杀、没有"斩杀抗性"、对 Boss 也没有免疫这回事</b> —— 能不能打死,只看这两份伤害够不够。<b>专注(Focus)</b>提升触发几率,堆满 100% 就每次攻击都双击。(简中把 Execute 误译成了"斩杀",容易让人以为是处决秒杀。)
  </div>
  <div class="callout">
    <b>反射:</b> 对方带反伤(荆棘类)时,你打出的<b>一部分伤害会原路打回你自己</b> —— 反弹的这份也走上面同一个收口扣你的血。所以"高攻速 + 撞反伤怪"会莫名其妙掉血,就是它。
  </div>
  <div class="callout">
    <b>★护甲 / 抗性是"减一坨",不是"减百分比"(逆向实证):</b> 直觉里护甲像"减 X% 伤害",但 TL2 的护甲其实是<span class="em">直接从这一击里扣掉一块固定值</span>(像盾吸收),再落到血条。扣掉的量 = <b>你护甲的 50%~100% 随机</b> × 攻击方的一个"咬合系数",所以<b>同护甲、同一发,每次扣的都不一样</b>(伤害数字一直跳就是它)。<br>★由此推出一条反直觉的结论:护甲对<b>小额高频</b>伤害超值(可能几乎全免),对<b>单发巨伤</b>杯水车薪 —— 跟"减百分比"到处等效的想法正相反。真正的<b>百分比</b>减伤是另一层(见下条),上限 −75%。元素"抗性"= 每个元素各有一条自己的护甲,走完全相同的这套平减。
    <br><span class="dim" style="font-size:12px">模组向:逆向挖穿了这个"咬合系数"—— 它<b>不是一个通用常数</b>,而是 <b>SOAKSCALEPCT</b>(每个技能自带,实测 <b>20~80%</b>,主旋钮)× 武器 <b>SECONDARY_DMG_PCT</b>(0/25/33/50/100)× 伤害标量。所以不同技能"咬"护甲的深浅是<b>刻意调出来的</b>:同一身护甲,挨这个技能掉得多、挨那个少。</span>
  </div>
  <div class="callout">
    <b>护甲之后还有一层"承伤%":</b> 平减完,再乘一个<b>百分比承伤</b>(装备 / buff / 词缀堆的"受到伤害 −X%"),玩家<b>硬上限 −75%</b>(想突破得动引擎)。最后若身上有<b>技能护盾缓冲</b>,先吸这层再扣血。顺序固定:<b>格挡 → 平减护甲 → 承伤% → 护盾缓冲 → 扣血</b>。
  </div>
</section>
<div class="diamond-rule"><span>◆ ◆ ◆</span></div>
<!-- Ⅷ 实战对照 -->
<section class="block">
  <header class="sec">
    <span class="num">Ⅷ</span>
    <h2>真打一场:狂战士 vs 大区长 <span class="en">A Real Fight</span></h2>
    <p class="lede">前面全是规则,这里拿原版<b>第一章尾的 BOSS —— 大区长 Eldrayn</b> 当靶子,把一个 50 级狂战士的完整面板摆在旁边,一次攻击两边的数字怎么走 —— 一目了然。<b>怪物数值直接从游戏 DAT 读出</b>,玩家派生值按前面的真实公式逐条算出。</p>
  </header>
  <div class="versus">
    <article class="cbt player">
      <div class="cbt-hd">
        <div class="cbt-role">玩家 · Player</div>
        <div class="cbt-name"><span class="glyph">⚔</span>狂战士</div>
        <div class="cbt-sub">Berserker · 50 级 · 双持近战 · 示例配点</div>
      </div>
      <div class="cbt-body">
        <div class="grp-t">主属性 · 面板配点</div>
        <div class="mini-attrs">
          <div class="sline"><span class="sk">力量</span><span class="sv">140</span></div>
          <div class="sline"><span class="sk">敏捷</span><span class="sv">70</span></div>
          <div class="sline"><span class="sk">专注</span><span class="sv">40</span></div>
          <div class="sline"><span class="sk">体力</span><span class="sv">50</span></div>
        </div>
        <div class="grp-t">派生战力 · 按真公式算</div>
        <div class="sline"><span class="sk">最大生命</span><span class="sv">3420 <span class="dim">职业3240+体力180</span></span></div>
        <div class="sline"><span class="sk">最大法力</span><span class="sv">285</span></div>
        <div class="sline"><span class="sk">武器伤害<small>每手</small></span><span class="sv">100–150 物理</span></div>
        <div class="sline"><span class="sk">武器物理加成<small>力量</small></span><span class="sv">+70%</span></div>
        <div class="sline"><span class="sk">暴击 几率 · 伤害</span><span class="sv">12.9% · ×2.06</span></div>
        <div class="sline"><span class="sk">闪避几率</span><span class="sv">12.9%</span></div>
        <div class="sline"><span class="sk">双击 斩杀<small>双持</small></span><span class="sv">17.5%</span></div>
        <div class="sline"><span class="sk">招架几率</span><span class="sv">7.7%</span></div>
        <div class="grp-t">防御</div>
        <div class="sline"><span class="sk">基础护甲<small>体力</small></span><span class="sv">56 <span class="dim">+装备</span></span></div>
        <div class="sline"><span class="sk">命中 vs 该 BOSS</span><span class="sv">≈95% <span class="dim">封顶</span></span></div>
      </div>
    </article>
    <article class="cbt boss">
      <div class="cbt-hd">
        <div class="cbt-role">BOSS · 远程施法(电)</div>
        <div class="cbt-name"><span class="glyph">☬</span>大区长 Eldrayn</div>
        <div class="cbt-sub">Grand Regent Eldrayn · 第一章尾 BOSS</div>
      </div>
      <div class="cbt-body">
        <div class="grp-t">核心数值 · DAT 授权值</div>
        <div class="sline"><span class="sk">最大生命</span><span class="sv">2200 <span class="dim">=22×曲线</span></span></div>
        <div class="sline"><span class="sk">攻击伤害</span><span class="sv">100–125 电</span></div>
        <div class="sline"><span class="sk">攻击速度</span><span class="sv">100</span></div>
        <div class="sline"><span class="sk">暴击几率</span><span class="sv">5%</span></div>
        <div class="sline"><span class="sk">物理护甲</span><span class="sv">100</span></div>
        <div class="grp-t">元素护甲 · 抗性的本体</div>
        <div class="res-row">
          <span class="res fire">火 100</span>
          <span class="res ice">冰 100</span>
          <span class="res elec">电 100</span>
          <span class="res pois">毒 100</span>
        </div>
        <div class="grp-t">控制免疫 · BOSS_RESISTS 词缀</div>
        <div class="cc-list">眩晕 <b>92%</b> · 定身 <b>88%</b> · 减速 <b>85%</b> · 致盲 <b>90%</b> · 击退 <b>95%</b> · 魅惑/沉默/打断/拉拽/恐惧 <b>100%</b></div>
        <div class="grp-t">主要技能</div>
        <div class="cc-list">风暴长矛 · 电弧闪电 · 召唤守卫</div>
      </div>
    </article>
  </div>
  <div class="callout">
    <b>先破两个常见误解:</b> ① TL2 的<span class="em">元素抗性 = 元素护甲</span> —— 火/冰/电/毒各有一个<b>独立的护甲值</b>(这里都是 100),走和物理护甲<b>完全相同</b>的减免公式,<b>不是</b>一个"减 X% 伤害"的百分比数字。② 名字唬人的 <b>BOSS_RESISTS</b> 词缀管的是<span class="em">控制免疫</span>(眩晕/定身/沉默…),跟元素减伤<b>毫无关系</b> —— 想让 BOSS 抗火,得堆它的<b>火护甲</b>,不是这条词缀。
  </div>
  <h3 class="mini">怪物数值不是写死的 —— 三层缩放</h3>
  <div class="prose"><p>大区长面板写着 HP <b>2200</b>,但你在游戏里几乎不会正好打它 2200 血。怪物 DAT 里的 HP/护甲/伤害其实是<b>相对等级曲线的百分比</b>(base = 100 = 100% = 1.0×),真实数值要过三层:</p></div>
  <div class="chain">
    <div class="node"><div class="cn-t">① DAT 授权</div><div class="cn-d">大区长写 HP 2200 = <b>22×</b>、伤害 125%、护甲 100%。普通杂兵(强盗等)全是 100% = 1.0×,直接吃默认</div></div>
    <div class="arw">×</div>
    <div class="node"><div class="cn-t">② 等级曲线</div><div class="cn-d">×冠军血曲线(按区域等级):1 级 50 → 105 级 44133。<b>同一个 BOSS,越深的区域血越厚</b></div></div>
    <div class="arw">×</div>
    <div class="node"><div class="cn-t">③ 难度 / 周目</div><div class="cn-d">交换乘数:BOSS <b>只吃</b>玩家伤害,最低 <b>0.075×</b>;<b>还手</b>伤害最高 <b>2.86×</b></div></div>
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr><th>档位(难度 / 周目 →)</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead>
      <tbody>
        <tr><td>BOSS 承受玩家伤害 ×</td><td><span class="n">1.0</span></td><td><span class="n">0.51</span></td><td><span class="n">0.315</span></td><td><span class="n">0.195</span></td><td><span class="n">0.14</span></td><td><span class="n">0.105</span></td><td><span class="n">0.09</span></td><td><span class="n">0.075</span></td></tr>
        <tr><td>BOSS 还手伤害 ×</td><td><span class="n">1.0</span></td><td><span class="n">1.4</span></td><td><span class="n">1.74</span></td><td><span class="n">2.05</span></td><td><span class="n">2.31</span></td><td><span class="n">2.52</span></td><td><span class="n">2.71</span></td><td><span class="n">2.86</span></td></tr>
      </tbody>
    </table>
  </div>
  <div class="prose"><p><span class="em">这就是"BOSS 是伤害海绵"的真正来源</span> —— 不是它血特别多,而是到了高难度 / 高周目,同一发伤害它<b>只吃 7.5%</b>、回敬你<b>近 3 倍</b>。曲线文件 <b>都能改</b>。</p></div>
  <h3 class="mini">一次交手,两边的数字</h3>
  <div class="calc">
    <div class="ct">算例 · 玩家一击打向大区长<span class="setup">狂战士 L50 · 主手 100–150 物理 · 普通周目 · 假设这击暴击</span></div>
    <div class="cbody">
      <div class="step"><div class="desc"><b>①</b> 主手武器基础物理伤害(MIN–MAX 区间)</div><div class="eq"><span class="out">100–150</span></div></div>
      <div class="step"><div class="desc"><b>②</b> × <span class="k">力量</span>武器加成 —— 140 力量 × 0.5%/点 = <b>+70%</b></div><div class="eq"><span class="in">×1.70</span> → 170–255</div></div>
      <div class="step"><div class="desc"><b>③</b> 命中 · <span class="k">第一掷</span>:你的命中率 vs 大区长<b>闪避</b>(BOSS 闪避极低)</div><div class="eq">过 ✓</div></div>
      <div class="step"><div class="desc"><b>④</b> 命中 · <span class="k">第二掷</span>:你自己的<b>失手率</b>(没中诅咒/致盲 = 0)→ <b>结实命中</b></div><div class="eq">过 ✓</div></div>
      <div class="step"><div class="desc"><b>⑤</b> 掷暴击 —— 敏捷 70 → 暴击几率曲线 <b>12.9%</b>;这击命中</div><div class="eq"><span class="k">12.9%</span> → 暴击!</div></div>
      <div class="step"><div class="desc"><b>⑥</b> × 暴击伤害 —— 力量 140 × 0.4%/点 = +56%,加 <b>+50% 基础</b> = <b>+106%</b></div><div class="eq"><span class="in">×2.06</span> → <b>350–525</b></div></div>
      <div class="step"><div class="desc"><b>⑦</b> 大区长<b>物理护甲平减</b> —— effArmor = 护甲 100 的 <b>50~100% 随机</b> = 50~100,减掉 effArmor × <b>咬合比例</b>(该技能的 SOAKSCALEPCT,实测 20~80%)</div><div class="eq"><span class="in">− (50~100)×SOAKSCALEPCT</span></div></div>
      <div class="step"><div class="desc"><b>⑧</b> × 周目交换乘数(普通 <b>1.0×</b>;噩梦最低 0.075×)</div><div class="eq"><span class="in">×1.0</span></div></div>
      <div class="step final blue"><div class="desc">落到大区长血条 · <b>蓝字</b>暴击(每击在跳,因护甲随机)</div><div class="eq"><span class="out">350–525</span> <span class="in">− 护甲一坨</span></div></div>
    </div>
    <div class="cnote"><b>蓝字 = 暴击。</b> 每一步都是真公式:+70% 来自<b>力量×0.5%</b>、12.9% 来自<b>敏捷</b>的暴击曲线、×2.06 = <b>力量暴伤(+56%)+ 基础 50%</b>。护甲是<b>平减</b>(减一坨,effArmor 每击 50–100 随机 × 该技能<b>咬合比例 SOAKSCALEPCT</b>),所以数字一直跳。⑧ 普通周目影响小;<b>噩梦周目</b>那 <b>×0.075</b> 才是让 BOSS 变肉的关键。<span class="dim" style="font-size:12px">(逆向挖穿:咬合系数 = <b>SOAKSCALEPCT</b>(该技能 20~80%,主旋钮)× 武器 SECONDARY_DMG_PCT × 伤害标量 —— <b>每攻击自带,没有通用常数</b>,所以填的是"真旋钮名"而非一个假数。)</span></div>
  </div>
  <div class="calc">
    <div class="ct">算例 · 大区长电弧闪电打向玩家<span class="setup">电系 100–125 · 普通周目 · 玩家 3420 HP · 裸抗</span></div>
    <div class="cbody">
      <div class="step"><div class="desc"><b>①</b> 电弧闪电基础伤害(<span style="color:#ffd84d">电</span>)</div><div class="eq"><span class="out">100–125</span></div></div>
      <div class="step"><div class="desc"><b>②</b> × 周目交换乘数 —— 普通 <b>1.0×</b>(噩梦最高 ↑<b>2.86×</b> → 286–357)</div><div class="eq"><span class="in">×1.0</span> → 100–125</div></div>
      <div class="step"><div class="desc"><b>③</b> 命中 · <span class="k">第一掷</span>:大区长命中率 vs 你<b>闪避 12.9%</b> —— 过则<b>整发闪掉 = 0</b>;这次没闪</div><div class="eq">命中 ✓</div></div>
      <div class="step"><div class="desc"><b>④</b> 命中 · <span class="k">第二掷</span>:大区长自己的失手率 → 命中</div><div class="eq">过 ✓</div></div>
      <div class="step"><div class="desc"><b>⑤</b> 你的<b>电系护甲平减</b> —— 裸抗、电护甲 ≈ 0 → 几乎不减(★换套<b>满电抗</b>装,这里能扣掉一大坨)</div><div class="eq"><span class="in">− ≈0</span></div></div>
      <div class="step"><div class="desc"><b>⑥</b> × (1 + <b>% 承伤减免</b>/100) —— 没减伤装 = ×1.0(堆满硬上限 <b>−75%</b> → ×0.25)</div><div class="eq"><span class="in">×1.0</span></div></div>
      <div class="step"><div class="desc"><b>⑦</b> 技能<b>护盾缓冲</b> —— 没开盾 → 不吸收</div><div class="eq"><span class="in">−0</span></div></div>
      <div class="step final"><div class="desc">扣血 · <b>橙字</b>普通伤害 —— 3420 →</div><div class="eq"><span class="out">剩 ~3300</span></div></div>
    </div>
    <div class="cnote"><b>橙字 = 普通伤害。</b> 这发<b>裸抗</b>硬吃了 ~100–125。三个"变肉"开关都在:③ <b>闪避</b>成功直接 0;⑤ <b>电护甲</b>(元素抗性本体,平减)能扣掉一大坨;⑥ <b>% 承伤减免</b>最多 −75%。<span style="font-style:normal;color:var(--gold)">想扛这个电系 BOSS,优先堆的是电护甲</span> —— 因为它的伤害是电,堆物理甲没用。★到<b>噩梦周目</b>同一发先 ×2.86 变 286–357,才是真正致命的地方。</div>
  </div>
  <h3 class="mini">同一次攻击,可能打出什么(玩家 → 大区长)</h3>
  <div class="tbl-wrap">
    <table>
      <thead><tr><th>这一击的结果</th><th>触发</th><th>打出伤害 · 护甲前</th><th>飘字</th></tr></thead>
      <tbody>
        <tr><td>结实命中(普通)</td><td>主要情况</td><td><span class="n">170–255</span></td><td>橙</td></tr>
        <tr><td>暴击</td><td>12.9% · 敏捷</td><td><span class="n">350–525</span></td><td><span style="color:var(--dmg-blue)">蓝</span></td></tr>
        <tr><td>双击 / 斩杀</td><td>17.5% · 专注 · 双持</td><td>上面再叠一份 ≈ 翻倍</td><td>—</td></tr>
        <tr><td>失手擦伤</td><td>没过命中两掷</td><td>打折(× 失手系数)</td><td><span style="color:var(--dmg-purple)">紫</span></td></tr>
      </tbody>
    </table>
  </div>
  <div class="prose"><p>所以"一次攻击"从来不是一个固定数字,而是一<b>组</b>可能:大多数时候普通命中,偶尔暴击翻倍跳蓝字,双持还有几率<b>双击</b>再叠一份,偶尔失手<b>擦伤</b>跳紫字 —— 再各自过<b>护甲平减 + 周目乘数</b>才落到血条。这就是你盯着同一只怪、伤害数字却一直在跳的全部原因。</p></div>
  <blockquote>规则是抽象的,一场仗是具体的。同一套公式,换个 BOSS、换套配点,数字全变 —— 但流向永远是这一条。</blockquote>
</section>
</div>
