---
date: 2022-8-31
title: git提交忽略大小写
tags:
  - git
describe: git提交默认是不区分大小写的，修改大小写需要注意
---

git 提交文件默认是不区分大小写的，这样会导致本地已经修改，但 git 仓库中仍然是没有改变的，代码运行失效。

**解决方案**

- 查看当前仓库大小写状态

  ```bash
  git config core.ignorecase
  # true
  # 返回ture意味不区分大小写
  ```

- 关闭忽略大小写功能

  ```bash
  git config core.ignorecase false
  ```

  再通过第一步命令查看，返回`false`说明大小写忽略已关闭

- 也可以修改全局的 git 配置

  ```bash
  git config --global core.ignorecase false
  ```
