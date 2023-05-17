---
date: 2022-8-31
title: eslint报错Delete `␍` 解决方法
tags:
  - git
describe: 多种方式解决Delete `␍`
---

### 报错原因

windows 在换行的时候，同时使用了回车符 CR 和换行符（LF），而 Linux 和 Mac 系统使用的回车符 CR，所以拉取代码之后 eslint 就会报错

### 解决方法

1. 手动修改 `ctrl + shift + p`调出命令行输入`Change of End Line`，选择 CRLF
2. .eslintrc 添加 rule 不检测文件每行结束的格式

   ```json
    rules: {
      ...
      "endOfLine": "auto"
    }
   ```

3. 通过设置 git 的 core.autocrlf 解决
   主要是 git 拉代码导致的，所以通过修改 git 配置就可以

   ```bash
   git config --global core.autocrlf false
   ```
