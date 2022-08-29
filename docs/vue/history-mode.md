---
date: '2020-8-28'
title: vue-router history模式
tags:
  - vue
describe: history模式静态资源引入问题
---


当vue router模式设置为mode: 'history'时，全局引入 js 或者css在页面刷新后会失效

- 解决方法：
  1. 将mode: 'history'注释掉，变成 hash  模式，此时刷新不会有问题
  2. 在index.html引入的时候，将相对路径转换成绝对路径
    相对路径：`<script src="./powerbi.js"></script>`<br />
    绝对路径：`<script src="/powerbi.js"></script>`<br />
    ./ 是指用户所在的当前目录（相对路径）<br />
    / 是指根目录（绝对路径，项目根目录），也就是项目根目录(dist目录)<br />
    对于hash模式，根路径是固定的，就是项目的根目录，但是history模式下，以/开头的嵌套路径会被当作根路径
