---
title: "如何禁用ctrl + A全选功能"
published: 2022-09-29
description: "windows和mac不同的操作"
tags: ["work"]
category: "工作"
image: api
draft: false
---

```ts
const handleKeyDown = (e) => {
  // 禁用全选
  if (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
  }
}
window.addEventListener('keydown', handleKeyDown)
```

<!-- click-event.jpg 原图已丢失 -->
mac上的全选和windows上的全选不同，mac上需要判断`e.metaKey`