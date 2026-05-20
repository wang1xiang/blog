---
title: vite创建项目找不到svg标签问题
published: 2022-09-20T16:00:00.000Z
description: ''
tags:
  - vite
category: vite
author: 翔子
---
  
代码中报错 `找不到模块“./logo.svg”或其相应的类型声明`

### 解决方式

添加src/types/svg.d.ts文件

```ts
declare module '*.svg' {
  const src: string;
  export default src;
}
```
