---
date: 2022-06-10
title: 定义react ref子组件
tags:
  - work
  - react
describe: react ref使用
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
