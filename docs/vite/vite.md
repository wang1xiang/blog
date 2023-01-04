---
date: 2022-7-31
title: vite学习记录
tags:
  - vite
describe: vite基本概念及常用配置
---
  
### 概念

vite开发阶段是esbuild，构建阶段是rollup

以前浏览器不支持ES Modules，所以es6代码都是通过打包工具转成浏览器识别的语言才能正常工作

带来的问题是：

1. 当项目越来越大时，启动项目需要很长时间（经历一条很长的编译打包链条，从入口开始需要逐步经历语法解析、依赖收集、代码转译、打包合并、代码优化，最终将高版本的、离散的源码编译打包成低版本、高兼容性的产物代码）
2. 代码更新也需要时间（HMR 时需要把改动模块及相关依赖全部编译）

### vite如何解决这两个问题？

- 针对项目启动慢的问题，vite 在开发环境冷启动无需打包，无需分析模块之间的依赖，同时也无需在启动开发服务器前进行编译，vite启动时将代码分为依赖和源码
  
  `依赖`：指的是一些不变的东西。例如第三方库，这部分使用esbuild构建（go语言开发，比js编写的打包器预构建依赖快10-100倍）
  
  `源码`：项目代码，按需加载，并且以es moduel的方式直接交给浏览器
- 针对项目更新的问题，vite只需要更新改动的源码位置，依赖不需要重新加载
  
  源码部分根据协商缓存，依赖模块直接强缓存

### 配置

以下配置是我在项目中使用的配置

1. vite创建项目

   ```bash
   npm init vite@latest my-vue-app

   # 使用pnpm
   pnpm create vite my-vue-app --template vue-ts
   ```

2. 配置vite.config.ts

   path等node变量不生效时，安装ts-node 缺少node类型定义

   ```bash
   yarn add ts-node --dev
   yarn add @types/node --dev
   ```

3. 组件编写，想在当前组件中创建example文件夹测试当前组件

   vite.config.ts配置

   ```tsx
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react';
   import * as path from 'path';
   
   // https://vitejs.dev/config/
   export default defineConfig({
     resolve: {
       alias: {
         '@example': path.resolve('example'),
         '@': path.resolve(__dirname, './src'),
         // 确保example可以成功找到quick-email-editor
         'quick-email-editor': path.resolve(__dirname, './src/main.tsx'),
       },
     },
     plugins: [react()],
     build: {
       minify: true,
       manifest: true,
       sourcemap: true,
       target: 'es2015',
       rollupOptions: {
         output: {
           manualChunks(id) {
             if (/^\/src\/.*/.test(id)) {
               return 'quick-email-editor';
             }
             if (/^\/example\/.*/.test(id)) {
               return 'demo';
             }
           },
         },
       },
     },
   })
   
   ```

   index.html配置

   ```html
   <!-- 找到最外层HTML文件 -->
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Vite App</title>
     </head>
     <body>
       <div id="root"></div>
       <!-- 将此行隐藏 使用下面的文件  -->
       <!--<script type="module" src="/src/main.tsx"></script>-->
       <script type="module" src="/example/index.tsx"></script>
     </body>
   </html>
   
   ```

4. 打包分析 rollup-plugin-visualize

   ```sh
   yarn add rollup-plugin-visualizer --dev
   ```

   vite.config.js配置

   ```sh
   process.env.ANALYZE === "true" &&
         visualizer({
           open: true,
           gzipSize: true,
           brotliSize: true,
         }),
   ```

   package.json配置

   ```sh
   
   "analyze": "cross-env ANALYZE=true yarn lib",
   "analyze:build": "cross-env ANALYZE=true yarn build",
   ```

5. 预览preview

   package.json配置

   ```sh
   "preview": "npm run lib && vite --config vite.preview.config.ts --force",
   ```

   vite.lib.config.js配置

   ```sh
   plugins: [
       {
         ...typescript2({
           check: false,
           tsconfig: 'tsconfig.lib.json',
         }),
         apply: 'build',
       },
       process.env.ANALYZE === 'true' &&
       visualizer({
         open: true,
         gzipSize: true,
         brotliSize: true,
       }),
     ],
   ```

6. 编译生成.d.ts文件

   要确保tsconfig.json存在declaration

   ```sh
   {
     "compilerOptions": {
       "target": "ESNext",
       "useDefineForClassFields": true,
       "lib": ["DOM", "DOM.Iterable", "ESNext"],
       "allowJs": false,
       "skipLibCheck": true,
       "esModuleInterop": false,
       "allowSyntheticDefaultImports": true,
       "strict": true,
       "forceConsistentCasingInFileNames": true,
       "module": "ESNext",
       "moduleResolution": "Node",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       # 是否生成声明文件
       "declaration": true,
       "jsx": "react-jsx"
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   
   ```

   安装typescript2

   ```sh
   yarn add rollup-plugin-typescript2 typescript tslib --dev
   ```

   配置

   ```sh
   plugins: [
       {
         ...typescript2({
           check: false,
           # 默认加载tsconfig.json
           tsconfig: 'tsconfig.lib.json',
         }),
         apply: 'build',
       },
       process.env.ANALYZE === 'true' &&
       visualizer({
         open: true,
         gzipSize: true,
         brotliSize: true,
       }),
     ],
   ```

7. 静态文件还在public下，打包的时候会直接copy
8. vite进度条插件

   ```bash
   yarn add progress vite-plugin-progress -D
   ```

   ```javascript
   // vite.config.js
   import progress from 'vite-plugin-progress'
   import colors from 'picocolors'
   ...
   
   plugins: [
       {
         ...typescript2({
           check: false,
           tsconfig: 'tsconfig.lib.json',
         }),
         apply: 'build',
       },
       process.env.ANALYZE === 'true' &&
       visualizer({
         open: true,
         gzipSize: true,
         brotliSize: true,
       }),
       progress({
         format:  `${colors.green(colors.bold('Bouilding'))} ${colors.cyan('[:bar]')} :percent`
       })
     ],
     ...
   ```

   实现思路：

   webpack有对应的插件webpackBar，实现思路：webpack.progressPlugin事件钩子，可轻松获取进度
vite基于rollup打包，不知道进度

   第一次打包时，模拟并记录所有模块总数并缓存起来
9. 静态资源处理
   - 默认在public下的文件不打包
   - 引用：`public/icon.png`应该在代码中引用为`/icon.png`
10. new URL(url, import.meta.url)

    import.meta可以获取模块上的元数据属性

    ```javascript
    console.log(import.meta.env);
    console.log(import.meta.hot);
    console.log(import.meta.url);
    ```

    ![截图](./images/importmeta.png)

    与URL构造器组合使用可以通过相对路径得到一个被完整解析的静态资源URL

    ```javascript
    console.log(new URL('./sample.json', import.meta.url));
    ```

    ![截图](./images/importurl.png)

11. vite配置[Emotion](https://emotion.sh/docs/introduction)

    ```bash
    npm install @emotion/react
    npm install -D @emotion/babel-plugin
    ```

    修改vite.config.js文件

    ```js
    export default defineConfig({
      plugins: [
        react({
          jsxImportSource: '@emotion/react',
          babel: {
            // 利用emotion的babel插件为JSX加入css属性，这样不用每个jsx文件开头添加JSX Pragma了
            plugins: ['@emotion/babel-plugin']
          },
        }),
      ],
    });
    ```

12.

持续更新中。。。
