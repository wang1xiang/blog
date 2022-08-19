---
date: 2022-8-17
title: 基于 Vite 的组件库工程化实战
tags:
  - vite
describe: 跟着然叔一起学习组件库的搭建
---


## vite搭建开发环境

#### 包管理工具

- pnpm优势
  
  1. 优秀的管理机制，安装依赖迅速且节省空间
     当使用npm或者yarn时，多个项目依赖同一个包，每个项目都会创建一次，而pnpm，依赖项将存储在一个内容可寻址的仓库中，所有文件都会从同一位置创建硬链接，不会占用额外的磁盘空间，允许跨项目共享同一版本依赖。
  2. pnpm拥有良好的workspace功能可以很好完成monorepo风格的项目管理
     pnpm内置了对monorepo的支持，只需在工作空间的根目录创建pnpm-workspace.yaml和.npmrc配置文件，同时还支持多种配置，相比较lerna和yarn workspace，pnpm解决monorepo的同时，也解决了传统方案引入的问题。

- 项目搭建步骤
  1. 使用pnpm初始化项目

    ```csharp
    pnpm init
    ```

  2. 安装vite作为开发工具

    ```kotlin
    pnpm i vite@3.0.7 -D
    ```

  3. 创建index.html用于测试

##### 开发Vue组件

- 安装vue3.0

  ```kotlin
  pnpm i vue@3.2.37
  ```

- 创建index.ts，并在index.html中引入
- 创建button/index.tsx用于创建button组件
- vue3.0默认不支持模板编译，所以不能使用template语法，需要安装plugin-vue插件以支持单文件组件的编译
  1. 安装vite的vue插件

     ```kotlin
     pnpm i @vitejs/plugin-vue -D
     ```

  2. 添加vite.config.ts，配置plugin

     ```ts
     // vite.config.ts
     import { defineConfig } from "vite";
     import vue from "@vitejs/plugin-vue";

     // https://vitejs.dev/config/

     export default defineConfig({
       plugins: [vue()],
     });
     ```

  3. 创建vue组件测试
     引用时如果不添加模块类型定义，会导致引入vue组件时报错

     ```ts
     // src/shims-vue.d.ts
     declare module "*.vue" {
      import { DefineComponent } from "vue";
      const component: DefineComponent<{}, {}, any>;
      export default component;
     }
     ```

##### JSX组件

想要支持JSX语法，就必须通过babel转义工具的支持

- 安装插件

```kotlin
pnpm i @vitejs/plugin-vue-jsx@"2.0.0" -D
```

- 配置vite.config.ts，添加plugins的JSX插件
- 直接使用jsx语法会报错，找不到名称“React”，这是不支持JSX语法造成的，而不是需要安装React，只需要配置tsconfig.json对jsx语法的支持

  ```json
  {
    "compilerOptions": {
      "declaration": true /* 生成相关的 '.d.ts' 文件。 */,
      "declarationDir": "./dist/types" /* '.d.ts' 文件输出目录 */,
      "jsx": "preserve"
    },
    "include": ["./**/*.*", "./shims-vue.d.ts"],
    "exclude": ["node_modules"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": "true"
  }
  ```

##### 库文件封装

一般像Element这种组件库都支持两种方式引入组件

- 完整引入，以vue插件的形式

  ```ts
  import Element from 'element-ui'

  // 完整引入
  Vue.use(Element)

  import {
    Select,
    Button
    // ...

  } from 'element-ui'

  // 按需引入
  Vue.component(Select.name, Select)
  ```

- 按需引入，导出单个文件，使用`vue.component`注册

所以组件库需要包含两个要求：

1. 默认导出为Vue插件
2. 每个组件可以单独导出

###### 封装过程

1. 设计入口
   - 导出全部组件
   - 实现一个Vue插件，插件种编写install方法，将所有组件安装到vue实例中

    ```ts
    // src/entry.ts
    import { App } from 'vue';
    import MyButton from './button';
    import SFCButton from './button/SFCButton.vue';
    import JSXButton from './button/JSXButton';
    // 导出单独组件 以支持按需引入
    export { MyButton, SFCButton, JSXButton }

    // 编写一个插件，实现一个install方法
    export default {
      install(app: App): void {
        app.component(MyButton.name, MyButton);
        app.component(SFCButton.name, SFCButton);
        app.component(JSXButton.name, JSXButton);
      }
    }
    ```

2. 配置vite.config.ts，以支持库文件的封装

   ```ts
    const rollupOptions = {

      external: ["vue", "vue-router"],
      output: {
        globals: {
          vue: "Vue",
        },
      },

    };

    export default defineConfig({

      .....  

      // 添加库模式配置

      build: {
        rollupOptions,
        minify:false,
        lib: {
          entry: "./src/entry.ts",
          name: "SmartyUI",
          fileName: "smarty-ui",
          // 导出模块格式
          formats: ["esm", "umd","iife"],
        },
      },
    });

   ```

3. package.json中添加build命令，打包库文件
4. 引入在demo文件中进行测试
