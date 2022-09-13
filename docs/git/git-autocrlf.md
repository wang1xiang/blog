---
date: 2022-8-31
title: eslint报错Delete `␍` 解决方法
tags:
  - git
describe: 多种方式解决Delete `␍`
---

### 报错原因

windows在换行的时候，同时使用了回车符CR和换行符（LF），而Linux和Mac系统使用的回车符CR，所以拉取代码之后eslint就会报错

### 解决方法

1. 手动修改 `ctrl + shift + p`调出命令行输入`Change of End Line`，选择CRLF
2. .eslintrc添加rule 不检测文件每行结束的格式

   ```json
    rules: {
      ...
      "endOfLine": "auto"
    }
   ```

3. 通过设置git的core.autocrlf解决
   主要是git拉代码导致的，所以通过修改git配置就可以

   ```bash
   git config --global core.autocrlf false
   ```
  