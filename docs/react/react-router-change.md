---
date: 2022-8-16
title: react-router如何监听路由改变
tags:
  - react
describe: 监听路由改变，触发相应事件
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
  