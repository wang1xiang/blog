---
date: 2024-2-10
title: Electron Sqlite3数据库文件存储优化方案
tags:
  - electron
describe: Electron Sqlite3数据库文件存储优化方案
---

## 前方案

数据库文件【sqlite3.db】存于代码层次根目录下，数据库初始化时通过 app.getAppPath()指定根目录下的数据文件

## 问题

研发中使用 sqlite3 时，sqlite3.db 数据库文件内容会被改变，git 提交时也会识别到这个文件，并会提交到 git，当这个文件出现错误时，之后发布的版本都会影响到

## 原因

认识不足，sqlite3.db 应该储存于用户本地目录而不是代码层次，每个用户的 sqlite3.db 应该都是独立的

## 优化方

前提：Electron 是一个使用 JavaScript, HTML 和 CSS 构建跨平台桌面应用程序的框架。它允许开发者使用 Web 技术来创建原生的桌面应用程序，同时能够访问底层操作系统的功能。

方案：采用 node 的内置的 fs 模块，在数据库初始化时在用户目录下创建对应的数据库文件 sqlite3.db，并使用该文件初始化数据库

代码：

```js
// fs 方法
/** 文件是否存在 */
export function fileIsExist(dir: string) {
  return new Promise<boolean>((resolve) => {
    fs.access(dir, fs.constants.F_OK, (err) => resolve(!err))
  })
}
/** 创建文件 */
export function writeLocalFile(dir: string, data: string): Promise<void> {
  return fs.promises.writeFile(dir, data)
}
```

```js
// sqlite 方法
import { app } from 'electron'
import path from 'path'
/** 1、用户数据目录 */
const LOCAL_USER_DIR = app.getPath('userData')
/** 2、需要创建的数据库文件路径 */
const db_path: string = path.join(LOCAL_USER_DIR, 'sqlite3.db')
/** 3、 判断文件是否存在以及是否需要创建文件，文件存在触发sqlite3数据库初始化*/
function connectDatabase() {
  fileIsExist(db_path).then((isExist:any) => {
    info_logger(db_path + '目标文件是否存在' + isExist)
    if (isExist) {
      onInitDatabase()
    } else {
      writeLocalFile(db_path, '').then((err:any) => {
        if (err) {
          error_logger(db_path + '目标文件写入失败', err)
        } else {
          info_logger(db_path + '目标文件写入成功')
          onInitDatabase()
        }
      })
    }
  })
}
/** 4、sqlite3数据库初始化 */
function onInitDatabase() {
  db = new sqlite3.Database(db_path, (err:any) => {
    if (err) {
      error_logger('🙅sqlite3连接失败：', err.message)
    } else {
      info_logger('✅sqlite3连接成功！')
    }
  })
}
```
