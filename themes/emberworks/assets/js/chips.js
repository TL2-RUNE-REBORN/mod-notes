// 更新日志 emoji 前缀 → 稀有度词缀 chip(仅展示层,内容文件不动)
(function () {
  var MAP = [
    ['✨', '新增', 'add'],            // ✨
    ['🐛', '修复', 'fix'],       // 🐛
    ['♻️', '优化', 'opt'],       // ♻️
    ['♻', '优化', 'opt'],
    ['🗑️', '移除', 'del'], // 🗑️
    ['🗑', '移除', 'del'],
    ['🎨', '视觉', 'art'],       // 🎨
    ['💬', '文本', 'txt'],       // 💬
    ['🚚', '迁移', 'txt'],       // 🚚
    ['📈', '数值', 'bal'],       // 📈
    ['⚗️', '实验', 'bal'],       // ⚗️
    ['⚗', '实验', 'bal'],
    ['💡', '想法', 'txt'],       // 💡
    ['🚀', '发布', 'add'],       // 🚀
    ['✏️', '修正', 'fix'],       // ✏️
    ['✏', '修正', 'fix'],
    ['🧑‍💻', '开发', 'txt'] // 🧑‍💻
  ];
  document.querySelectorAll('.article-body li').forEach(function (li) {
    var node = li.firstChild;
    if (!node || node.nodeType !== 3) return;
    var text = node.textContent;
    for (var i = 0; i < MAP.length; i++) {
      var m = MAP[i];
      var t = text.replace(/^\s+/, '');
      if (t.indexOf(m[0]) === 0) {
        var rest = t.slice(m[0].length).replace(/^\s*[:：]\s*/, ' ');
        var chip = document.createElement('span');
        chip.className = 'chip ' + m[2];
        chip.textContent = m[1];
        node.textContent = rest;
        li.insertBefore(chip, node);
        li.insertBefore(document.createTextNode(' '), node);
        break;
      }
    }
  });
})();
