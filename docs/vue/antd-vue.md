---
date: '2020-8-15'
title: antd-vue组件按需引入
tags:
  - vue
describe: vue按需引入antd组件过程记录
---

## 引入

```bash
npm install ant-design-vue --save--dev # 引入antd
```

## 配置

- 安装依赖

  ```bash
  npm i babel-plugin-import --save--dev
  npm i babel-loader --save--dev
  ```

- 修改babel.config.js，在plugins中添加

  ```javascript
  plugins: [
    [
      'import',
      {
        'libraryName': 'ant-design-vue',
        'libraryDirectory': 'lib',
        'style': 'css'
      }
    ]
  ]
  ```

## 使用

- src下创建config目录，index.js和antDesignVueConfig.js

  ```js
  import { Tree } from 'ant-design-vue'
  import Vue from 'vue'

  Vue.use(Tree)
  ```

  引入即可
  