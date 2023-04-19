---
date: 2023-4-10
title: .env文件的作用是什么
tags:
  - vite
describe:
---

> 本文参加了由[公众号@若川视野](https://lxchuan12.gitee.io/)发起的每周源码共读活动，[点击了解详情一起参与](https://juejin.cn/post/7079706017579139102)。
> 这是源码共读的第 40 期，链接：[vite 是如何解析用户配置的 .env 的](https://juejin.cn/post/7174045668187570206)。

## 前言

看下你的项目下是否

![create-react-app-env.png](./images/create-react-app-env.png)

![vue-cli-env.png](./images/vue-cli-env.png)

你会很开心的将需要的变量添加到这里，然后通过 process.env.XXX 来使用它。
但是你知道它们是怎么被关联到 process.env 到项目中的吗？下面我们来一起揭秘一下

## 准备工作

首先需要了解下 dotenv，功劳都是它的 😎。

### dotenv

[dotenv 是什么](https://github.com/motdotla/dotenv)：Dotenv 是一个零依赖模块，它将环境变量从 .env 文件加载到 process.env 中。

我们可以初始化一个 npm 项目，按照[步骤](https://github.com/motdotla/dotenv#-install)使用 dotenv 来创建一个 demo。

- 初始化

  ```bash
  mkdir dotenv-test
  # 初始化npm项目
  pnpm init & pnpm i dotenv
  # 创建.env文件和index.ts文件
  touch .evn & touch index.ts
  ```

- 在.env 中添加变量

  ```bash
  # 测试变量
  APP_NAME="dotenv-test"
  APP_PKG_MANAGER="pnpm"

  # 测试多行变量
  PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
  ...
  Kh9NV...
  ...
  -----END RSA PRIVATE KEY-----"

  # 也可以使用\n换行符一行输入
  PRIVATE_KEY_CHARACTER="-----BEGIN RSA PRIVATE KEY-----\n...\nKh9NV...\n...\n-----END RSA PRIVATE KEY-----"
  ```

- index.ts 中输出测试

  ```js
  import * as dotenv from 'dotenv'
  dotenv.config()

  console.log(`Current project name is ${process.env.APP_NAME}`)
  console.log(`The package manager used is ${process.env.APP_PKG_MANAGER}`)

  console.log('多行输出：')
  console.log(process.env.PRIVATE_KEY)
  console.log('使用\\n字符多行输出：')
  console.log(process.env.PRIVATE_KEY_CHARACTER)
  ```

  执行`npx esno index.ts`，可以看到输出结果如下：
  ![dotenv-demo1.png](./images/dotenv-demo1.png)

  > dotenv.config() 会自动读取当前路径下.env 文件，解析内容，将其分配给 process.env，并返回一个对象，该对象带有包含加载内容的已解析键，如果失败则返回错误键。同时包含[一些配置](https://github.com/motdotla/dotenv#options)可以自定义配置。

如果需要使用变量时，就需要[dotenv-expand](https://github.com/motdotla/dotenv-expand)的帮助。

我们已经了解了 dotenv 的使用方式，我们通过读源码的方式来揭秘一下它的实现原理。

```bash
# 直接克隆川哥的项目
git clone https://github.com/lxchuan12/dotenv-analysis.git
cd dotenv-analysis/dotenv && yarn i
# VSCode 直接打开当前项目
code .
# 我写的例子都在 examples 这个文件夹中，可以启动服务本地查看调试
# 在 dotenv-analysis 目录下
node examples/index.js
```
