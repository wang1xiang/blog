---
date: 2024-6-19
title: 使用plop快速创建express mvc模板代码
tags:
  - work
describe: 使用plop快速创建express mvc模板代码
---

我们可以设置 Plop 来生成 /routes/xx, /controllers/xx, 和 /models/xx 文件，提供工作效率。

## 1. 安装 plop

```bash
npm install --save-dev plop
```

## 2. 创建 Plop 配置文件

在项目根目录下创建一个 plopfile.js 文件：

为了在 Plop 生成文件时将文件名或类名的首字母大写，我们可以使用 Handlebars 的自定义 helper 函数来处理模板中的名称。

在模板文件中，也可以使用这个自定义 helper 来生成类名或函数名的首字母大写。

```js
module.exports = function (plop) {
  // 添加首字母大写的自定义 helper 可以对传入参数进行处理 用法{{ capitalize name }}
  plop.setHelper(
    'capitalize',
    (text) => text.charAt(0).toUpperCase() + text.slice(1)
  )
  // mvc generator
  plop.setGenerator('mvc', {
    description: 'Create a mvc template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '模块名称:',
      },
      {
        type: 'input',
        name: 'route',
        message: '路由前缀:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/routes/{{name}}/index.js',
        templateFile: 'plop-templates/router.hbs',
      },
      {
        type: 'add',
        path: 'src/controllers/{{name}}Controller.js',
        templateFile: 'plop-templates/controller.hbs',
      },
      {
        type: 'add',
        path: 'src/models/{{name}}Model.js',
        templateFile: 'plop-templates/model.hbs',
      },
      // pattern正则表达式 用它来匹配目标文件追加的位置
      // template后面需添加$1，$1是pattern正则括号内匹配到的字符串，当发生替换时，占位符会连同模板文本一起替换掉目标文件中的占位符，所以这个占位符会一直存在于目标文件中，方便后续的追加
      {
        type: 'modify',
        path: 'src/routes/index.js',
        pattern: /(\/\/ 路由引入 不要删除此行注释)/gi,
        template: "import {{name}} from './{{name}}'\r$1",
      },
      {
        type: 'modify',
        path: 'src/routes/index.js',
        pattern: /(\/\/ 注册路由 不要删除此行注释)/gi,
        template: "router.use('/{{route}}', authMiddleware, {{name}})\r$1",
      },
    ],
  })
}
```

## 3. 创建模板文件

在项目根目录下创建一个 plop-templates 文件夹，并在其中创建三个模板文件：

plop-templates/controller.hbs

```js
import {{capitalize name}}Model from '@/models/{{name}}Model.js'

// test
export const test = async (req, res) => {
  try {
    const result = await {{capitalize name}}Model.test()
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
```

plop-templates/router.hbs

```js
import express from 'express'
import * as {{capitalize name}}Controller from '@/controllers/{{name}}Controller.js'

const router = express.Router()

//  {{name}}路由
router.get('/', {{capitalize name}}Controller.test)

export default router
```

plop-templates/model.hbs

```js
import pool from '@/config/database.js'

const {{capitalize name}}Model = {
  async test(type = '', client = '') {
    let connection
    try {
      connection = await pool.getConnection()
      let sql = 'SELECT COUNT(*) AS count FROM user_count'
      const [rows] = await connection.execute(sql, params)
      return rows
    } catch (error) {
      throw error
    } finally {
      if (connection) connection.release()
    }
  },
}

export default {{capitalize name}}Model
```

## 4. 配置 package.json

```json
{
  ...
  "scripts": {
    ...
    "mvc": "plop mvc",
  },
  ...
}
```

执行 `yarn mvc`

```bash
yarn mvc
$ plop mvc
? 模块名称: oneIdManage
? 路由前缀: oneId
✔  ++ /src/routes/oneIdManage/index.js
✔  ++ /src/controllers/oneIdManageController.js
✔  ++ /src/models/oneIdManageModel.js
✔  +- /src/routes/index.js
✔  +- /src/routes/index.js
✨  Done in 6.22s.
```
