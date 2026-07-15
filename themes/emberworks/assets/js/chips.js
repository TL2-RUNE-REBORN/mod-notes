// 更新日志 emoji 前缀 → 稀有度词缀 chip(仅展示层,内容文件不动)
// chip 标签按 <html lang> 切换:zh-CN 中文 / 其它英文
(function () {
  var en = (document.documentElement.lang || '').toLowerCase().indexOf('zh') !== 0;
  var MAP = [
    ['✨', '新增', 'Added', 'add'],
    ['🐛', '修复', 'Fixed', 'fix'],
    ['♻️', '优化', 'Improved', 'opt'],
    ['♻', '优化', 'Improved', 'opt'],
    ['🗑️', '移除', 'Removed', 'del'],
    ['🗑', '移除', 'Removed', 'del'],
    ['🎨', '视觉', 'Visual', 'art'],
    ['💬', '文本', 'Text', 'txt'],
    ['🚚', '迁移', 'Moved', 'txt'],
    ['📈', '数值', 'Balance', 'bal'],
    ['⚗️', '实验', 'Experimental', 'bal'],
    ['⚗', '实验', 'Experimental', 'bal'],
    ['💡', '想法', 'Idea', 'txt'],
    ['🚀', '发布', 'Release', 'add'],
    ['✏️', '修正', 'Corrected', 'fix'],
    ['✏', '修正', 'Corrected', 'fix'],
    ['🧑‍💻', '开发', 'Dev', 'txt']
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
        chip.className = 'chip ' + m[3];
        chip.textContent = en ? m[2] : m[1];
        node.textContent = rest;
        li.insertBefore(chip, node);
        li.insertBefore(document.createTextNode(' '), node);
        break;
      }
    }
  });
})();
