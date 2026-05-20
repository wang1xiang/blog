---
title: react-router如何监听路由改变
published: 2022-08-15T16:00:00.000Z
description: 监听路由改变，触发相应事件
tags:
  - react
category: react
author: 翔子
---

话不多说，直接上代码

```tsx
// 路由改变
const history = useHistory();
useEffect(() => {
  const unListen = history?.listen(() => {
    console.log('onRouterChange')
  });
  return () => {
    unListen?.();
  }
}, [history])
```
  
