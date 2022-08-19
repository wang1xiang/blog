---
date: 2022-8-18
title: 如何通过浏览器调试H5移动端样式
tags:
  - mobile
describe: 通过chrome或edge浏览器来调试手机端样式
---

最近在弄邮件编辑器业务，通过HTML发送邮件，发现在移动端展示样式会出问题，一开始并不知道该怎么调试，于是各种百度，将我的方法总结一下：<br />

分两种情况：

- 没有翻墙环境：使用edge
  1. 安卓手机开启开发者模式，打开USB调试
  2. 连接电脑
  3. 打开edge浏览器，输入`edge://inspect/#devices`
  4. 等待手机和edge响应，选择是否允许USB调试，会出现一下界面，则说明链接成功
  ![inspect](./images/insper.jpg)
  5. 点击`inspect`，会出现这个界面，就可以像pc端一样调试了
  ![result](./images/result.jpg)
edge是真的强大，不用翻墙所有chrome浏览器的功能基本都能实现

- 有翻墙环境：使用chrome
  和edge同样的操作，不过需要有vpn才行，不然就会一致404 Not Found
