---
date: 2022-9-29
title: 如何禁用ctrl + A全选功能
tags:
  - work
describe: windows和mac不同的操作
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

![click-event.jpg](./images/click-event.jpg)
mac上的全选和windows上的全选不同，mac上需要判断`e.metaKey`
