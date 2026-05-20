---
title: "react-router如何监听路由改变"
published: 2022-08-16
description: "监听路由改变，触发相应事件"
tags: ["react"]
category: "前端框架"
image: api
draft: false
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
  