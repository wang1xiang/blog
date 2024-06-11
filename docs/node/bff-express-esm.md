---
date: 2024-3-22
title: Express中使用ESM
tags:
  - node
describe: Express中使用ESM
---

## 前言

众所周知，nodeJs 使用的 CommonJS 规范，不能直接使用 ESM 模块的，那就需要使用 `module.export` 导出模块，并使用 `require` 导入模块，这对于习惯了使用 ES `import`、`export`的前端来说，算是有些不友好了，那么如何可以在 nodeJs 中使用 ES 模块的开发方式呢？

## 指定 package.json type

```json
"type": "module",
"main": "src/index.js",
```

配置好以后就可以直接在项目中使用 ESM 模块化规范了

## 使用 esm 包

[esm](https://github.com/standard-things/esm)

直接使用 esm 包是一种在 Node.js 中使用 ESM 的方法。esm 是一个 JavaScript 模块，它提供了对 ESM 模块的支持，使你可以在 Node.js 中使用 ESM 的语法和功能，而不需要手动配置或更改文件扩展名。

### 步骤

1. 安装 esm 包

   ```bash
   npm install esm
   ```

2. 在启动脚本中使用 esm

   在你的 Node.js 启动脚本中，通过 --require 或 -r 选项来加载 esm 包。例如，假设启动脚本是 index.js：

   ```bash
   nodemon -r esm index.js
   ```

3. 修改启动脚本 index.js

   ```js
   // index.js
   // 使用 esm 加载模块
   require = require('esm')(module /*, options*/)
   module.exports = require('./module.js')
   ```

4. 在 module.js 中就可以完全使用 es 语法了
