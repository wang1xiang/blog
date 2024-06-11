---
date: 2023-12-20
title: Babel是什么?
tags:
  - work
describe: Babel是什么?
---

Babel 是一个流行的 JavaScript 编译器，它可以将新版本的 JavaScript 代码转换为向后兼容的旧版本 JavaScript 代码，以便在不支持新特性的旧浏览器或环境中运行。Babel 可以帮助开发人员编写最新的 JavaScript 代码，而无需担心它们是否能够在目标浏览器或环境中正常工作。

Babel 支持多种语法和功能，例如箭头函数、解构赋值、类、模块化等等。它使用插件系统，可以根据需要选择和配置插件来进行转换。Babel 还可以用于转换 JSX、TypeScript、Flow 等其他语言的代码。

Babel 是一个开源工具，可以在 Node.js 和浏览器环境下使用，可以通过 npm 安装。

**Babel 可以通过配置文件来进行配置。以下是一个基本的 Babel 配置文件.babelrc 的例子**

```js
{
  "presets": ["@babel/preset-env"],
  "plugins": []
}
```

该配置文件使用了一个名为@babel/preset-env 的预设来转换 JavaScript 代码，它可以根据目标环境自动确定需要转换哪些语法和功能。该配置文件没有使用任何插件。

要使用 Babel 进行转换，需要先安装@babel/core 和@babel/cli 两个 npm 包，然后可以使用以下命令对文件进行转换：

```bash
npx babel input.js -o output.js
```

其中 input.js 是要转换的源文件，output.js 是输出文件。

如果需要更复杂的转换，可以使用各种 Babel 插件进行配置。

举个例子，要使用@babel/plugin-transform-arrow-functions 插件将箭头函数转换为传统函数，可以将以下内容添加到配置文件中：

```js
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-arrow-functions"]
}
```

配置文件中的 plugins 数组列出要使用的插件，可以使用字符串形式列出插件的名称，也可以使用数组形式列出插件名称和选项。可以在 [Babel](https://www.babeljs.cn/) 官方网站上找到各种插件的文档和选项。

在 Babel 中，presets 和 plugins 是两种不同类型的 Babel 配置。

Presets 是一组插件的集合，用于提供一种便捷的方式来配置一组相关的插件。预设是由 Babel 社区编写和维护的插件集合，用于转换某些特定类型的语法或者用于在特定环境中的转换（例如 ES6 转换为 ES5）。在使用 Babel 的时候，通常会使用一个或多个预设。例如，@babel/preset-env 预设可以根据指定的目标浏览器或 Node.js 版本，自动确定需要转换的语法和功能，这样就可以方便地在不同的浏览器和 Node.js 版本中运行代码。

Plugins 是用于转换 JavaScript 代码的单个插件。Babel 的工作方式是将代码通过一个或多个插件进行转换。每个插件负责处理一种类型的语法或功能。使用插件时，需要在 Babel 配置中指定需要使用的插件。例如，@babel/plugin-transform-arrow-functions 插件可以将 ES6 的箭头函数转换为传统函数的形式，这样在旧版的浏览器和 Node.js 版本中也可以运行该代码。

在 Babel 中，预设和插件的顺序很重要。预设中的插件会在插件之前执行。预设中的顺序是从右向左的（类似于函数组合），而插件的顺序是从上向下的（类似于流水线）。
