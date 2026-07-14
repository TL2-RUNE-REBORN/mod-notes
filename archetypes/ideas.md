---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
params:
  # 状态:spark 火种 / hatch 孵化 / forge 锻造 / ship 出炉 / hold 搁置
  status: spark
  summary: ""
---
