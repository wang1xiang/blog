---
date: 2022-9-21
title: vite创建项目找不到svg标签问题
tags:
  - vite
describe: 
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