---
date: 2024-4-1
title: Yjs 使用报错
tags:
  - tiptap
describe: tiptap-tutorial8
---

## 问题

1. 报错 Yjs was already imported. This breaks constructor checks and will lead to issues!

   通过 [issue](https://github.com/yjs/yjs/issues/438)得知：出现此消息的另原因是项目的某些部分使用了 Yjs 的 cjs 版本，而某些部分使用 Yjs 的 es 版本。

   当更新依赖它的 yjs 或库时，我们经常遇到这个错误。特别是在翻新更新拉取请求中。对我们来说，解决方案很简单：检查您的 yarn.lock 或 package-lock.json 是否有多个条目！

   [解决方案](https://github.com/facebook/lexical/issues/2153)

   仅仅只需要添加别名即可。

   ```js
   // https://vitejs.dev/config/
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         yjs: path.resolve('./node_modules/yjs/src/index.js'),
       },
     },
   })
   ```

   有时会安装嵌套的 yjs 包。可能地，node_modules 中可以有嵌套的 yjs 安装：例如节点模块 & 节点模块/@lexical/yjs/节点模块/yjs)。

   出现错误消息的另一个原因是某些复杂的构建系统同时导入 Yjs 的 commonjs (.cjs) 和模块 (.mjs) 版本。

   您可以通过明确指定要使用的版本来解决这两个问题。在 webpack 和其他捆绑器中，您可以设置别名：yjs: "node_modules/yjs/dist/yjs.mjs"。

   vite 配置中的别名建议解决了重复导入的错误。

2.
3.
