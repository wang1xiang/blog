---
title: 定义react ref子组件
published: 2022-06-10T00:00:00.000Z
description: react ref使用
tags:
  - work
  - react
category: work
author: 翔子
---

定义react ref子组件

```jsx
// 子组件
export interface RefFunType {
  changeText: (data) => void;
  replaceCaret: () => void;
}
// 暴露事件
useImperativeHandle(ref, () => ({
  changeText,
  replaceCaret,
}));

// 父组件
const refEdit = useRef<RefFunType>();
```
