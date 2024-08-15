---
date: 2024-1-6
title: Electron 中使用【SQLite】数据库
tags:
  - electron
describe: Electron 中使用【SQLite】数据库
---

## SQLite 介绍

[SQLite](https://github.com/TryGhost/node-sqlite3/wiki/API#database) 是一个轻量级的数据库系统，通常用于嵌入式系统和桌面应用程序。

### 创建表

CREATE TABLE 表名 (

列 1 数据类型,

列 2 数据类型,

列 3 数据类型,

...

);

```js
create table users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name text,
age INTEGER
);
```

注：**建表的时候确定不了该表是否存在**

```sql
CREATE TABLE IF NOT EXISTS users;
```

### 删除表

DROP TABLE 表名;

```sql
DROP TABLE users;
```

### 查询数据中所有表

```sql
SELECT * FROM sqlite_master WHERE type = 'table';
```

### 添加列

ALTER TABLE 表名 ADD COLUMN 列名 数据类型;

```sql
ALTER TABLE users ADD COLUMN age INT;
```

### 删除列

ALTER TABLE 表名 DROP COLUMN 列名;

```sql
ALTER TABLE users DROP COLUMN age;
```

### 插入数据

INSERT INTO 表名 (列 1, 列 2, 列 3, ...) VALUES (值 1, 值 2, 值 3, ...);

```sql
INSERT INTO users (id, name, age) VALUES (3, 'John3', 325);
```

注：**不是数字的值需要单引号或双引号包括**

### 更新数据

UPDATE 表名 SET 列 1\=值 1, 列 2\=值 2, ... WHERE 条件;

```sql
UPDATE users SET age=26 WHERE id=1;
```

### 删除数据

DELETE FROM 表名 WHERE 条件;

```sql
DELETE FROM users WHERE id=1;
```

### 查询数据

1. 查询所有数据

   SELECT \* FROM 表名;

   ```sql
   SELECT * FROM users;
   ```

2. 查询特定列的数据

   SELECT 列名 1, 列名 2 FROM 表名;

   ```sql
   SELECT name, age FROM users;
   ```

3. 查询筛选条件数据

   SELECT \* FROM 表名 WHERE 条件;

   ```sql
   SELECT * FROM users WHERE id=1;
   ```

4. 分页查询

   SELECT \* FROM 要查询的表名 LIMIT 每页的行数 OFFSET 起始行号;

   ```sql
   SELECT * FROM users LIMIT page_size OFFSET start_row;
   ```

### SQLite 占位符写法

```sql
db.run("UPDATE tbl SET name = ? WHERE id = ?", "bar", 2);
db.run("UPDATE tbl SET name = ? WHERE id = ?", [ "bar", 2 ]);
db.run("UPDATE tbl SET name = $name WHERE id = $id", { $id: 2, $name: "bar"
});
```

## Electron 中使用 SQLite

在 Electron 应用中，SQLite 数据库的逻辑通常写在主进程中，而不是渲染进程。

### Electron 中为什么要这样使用？

1. 安全性

   在 Electron 应用中，主进程和渲染进程通常具有不同的职责和安全性考虑。主进程负责管理应用的生命周期、创建和与数据库进行交互等任务，而渲染进程则负责显示用户界面和处理用户输入。将数据库逻辑放在主进程中可以增加安全性，因为主进程通常具有更严格的权限和访问控制。

2. 资源管理

   SQLite 数据库的连接和操作需要资源管理。将数据库逻辑放在主进程中可以更好地控制这些资源，避免在渲染进程中产生资源泄漏或竞争条件。

3. 异步操作

   SQLite 数据库操作通常是异步的，需要回调函数或 Promises 来处理结果。将数据库逻辑放在主进程中可以更好地处理这些异步操作，避免在渲染进程中产生阻塞或延迟。

4. 简化应用结构

   将数据库逻辑放在主进程中可以简化应用的结构，使代码更易于维护和调试。这样可以确保应用的不同部分（如渲染进程和主进程）能够更好地分离和独立工作。

渲染进程中：通过主进程、渲染进程的 IPC 通信进行调用。

### sqlite3 使用步骤

#### 安装依赖

```bash
npm install sqlite3
# or
yarn install sqlite3
```

#### 数据库实例以及数据库本地文件

```js
//　　实例
let db
//　　数据库表本地文件
const db_path = path.join(app.getAppPath(), '/db-config/sqlite3.db')
```

#### 连接数据库

```js
//　　连接数据库（electron初始化完成时调用）
db = new sqlite3.Database(db_path, (err) => { //　　err错误信息　　})
```

#### 运行 SQL 语句

`run(sql [, param, ...] [, callback])` 参数运行 SQL 查询，然后调用回调

```js
db.run(sql, ...(params || []), (err) => {
  //　　err 错误信息
  //　　rows返回值
})
```

`all(sql [, param, ...] [, callback])` 参数运行 SQL 查询，然后调用所有结果行的回调

```js
db.all(sql, ...(params || []), (err, rows) => {
  //　　err 错误信息
  //　　rows返回值
})
```

#### 关闭数据库

```js
//　　关闭数据库（electron应用程序开始关闭窗口时调用）
db && db.close()
```

### electron 使用步骤

#### preload 预加载

`ipcRenderer.invoke` 主要用于在渲染进程中发送消息给主进程，并接收主进程的返回结果。

它比传统的 ipcRenderer.send 和 ipcMain.on 方式更为方便，因为使用 invoke 可以直接收到主进程返回的信息，而不需要在主进程中再发送一个返回结果。

```js
/** sqlite */
onExecSQL: (params: SqliteType) => {
  return IPC_R2M2R.invoke('sqlite:execSQL', params)
}
```

#### 主进程

`ipcMain.handle` 是 Electron 中主进程用来处理渲染进程发送过来的异步或同步消息的方法。这个方法可以接收一个事件和一个回调函数，事件是由渲染进程发送过来的消息，回调函数则是用来处理这个消息的函数。

`ipcMain.handle` 方法支持异步，触发的方法是 ipcRenderer.invoke

```js
ipcMain.handle('sqlite:execSQL', (e, params) => {
  return Promise.resolve(execSQL(params))
})
```

#### 渲染进程

```js
window.electronIPC.onExecSQL(data).then((res) => {
  //　　res返回值
})
```

### 完整代码

```js
import { onSplicingQuotation } from '@/utils'
import { SqlTypeMap } from '@/views/EDB/utils/variable'
/**
 * @Author: LGJ
 * @Description: 日志
 * @Date: 2024/1/2 13:41
 */
}
export const errorger = (strs: any[]) => {
  console.error('【error】', ...strs)
}

/**
 * @Author: LGJ
 * @Description: ERROR记录
 * @Date: 2024/1/2 16:04
 */
export const onCheckExecSQLRes = (data: {
  fun?: string,
  sql: string,
  params?: any,
}) => {
  return new Promise((resolve, reject) => {
    window.electronIPC
      .onExecSQL(data)
      .then((res: any) => {
        const { data, status, message } = res
        status === 0 ? resolve(data) : reject(message)
      })
      .catch((e) => {
        errorger([e, data])
      })
  }).catch((e) => {
    errorger([e, data])
  })
}

/**
 * @Author: LGJ
 * @Description: 创建表格
 * @Date: 2023/12/29 10:31
 */
export const onCreateTable = (table_name: string) => {
  const sql: string =
    'CREATE TABLE IF NOT EXISTS ' +
    table_name +
    ' (id INT PRIMARY KEY, company TEXT);'
  return onCheckExecSQLRes({ sql })
}

/**
 * @Author: LGJ
 * @Description: 删除表格
 * @Date: 2023/12/29 10:31
 */
export const onDeleteTable = (table_name: string) => {
  const sql: string = 'DROP TABLE ' + table_name + ';'
  return onCheckExecSQLRes({ sql })
}

/**
 * @Author: LGJ
 * @Description:  查询数据库有哪些表
 * @Date: 2024/1/2 11:24
 */
export const onSelectTable = () => {
  const sql: string = "SELECT * FROM sqlite_master WHERE type = 'table';"
  return onCheckExecSQLRes({ fun: 'all', sql })
}

/**
 * @Author: LGJ
 * @Description:
 * @Date: 2024/1/9 18:55
 */
export const onSelectTableColumn = (table_name: string) => {
  const sql: string = 'PRAGMA table_info(' + table_name + ');'
  return onCheckExecSQLRes({ fun: 'all', sql })
}

/**
 * @Author: LGJ
 * @Description: 添加列，SQLite不支持批量
 * @Date: 2023/12/29 10:59
 */
export const onAddTableColumn = (
  table_name: string,
  column_name: string,
  column_type: string
) => {
  const sql: string =
    'ALTER TABLE ' +
    table_name +
    ' ADD COLUMN ' +
    column_name +
    ' ' +
    SqlTypeMap[column_type || 'string'] +
    ';'
  return onCheckExecSQLRes({ sql })
}

/**
 * @Author: LGJ
 * @Description: 删除列，SQLite不支持批量
 * @Date: 2024/1/2 09:48
 */
export const onDeleteTableColumn = (
  table_name: string,
  column_name: string
) => {
  const sql: string =
    'ALTER TABLE ' + table_name + ' DROP COLUMN ' + column_name + ';'
  return onCheckExecSQLRes({ sql })
}

/**
 * @Author: LGJ
 * @Description: 添加表格数据
 * @Date: 2024/1/2 10:14
 */
export const onAddTableData = (
  table_name: string,
  table_data: Record<string, any>
) => {
  const columns: string[] = Object.keys(table_data)
  if (!columns.length) return
  const params: string[] = Object.values(table_data)
  const values: any = Array(params.length)
    .fill(null)
    .map((item: any) => '?')
  const sql: string =
    'INSERT INTO ' +
    table_name +
    ' (' +
    columns.join(',') +
    ') VALUES (' +
    values.join(',') +
    ');'
  return onCheckExecSQLRes({ sql, params })
}

/**
 * @Author: LGJ
 * @Description: 删除表格数据（id）
 * @Date: 2024/1/2 10:19
 */

export const onDeleteTableData = (table_name: string, row_id: number) => {
  const sql: string =
    'DELETE FROM ' +
    table_name +
    ' WHERE id = ' +
    onSplicingQuotation(row_id) +
    ';'
  return onCheckExecSQLRes({ sql })
}

/**
 * @Author: LGJ
 * @Description: 修改表格数据（id）
 * @Date: 2024/1/2 14:47
 */
export const onUpdateTableData = (
  table_name: string,
  row_id: number,
  update_data: Record<string, any>
) => {
  const columns: string[] = Object.keys(update_data)
  if (!columns.length) return
  const params: string[] = Object.values(update_data)
  const set_sql: string[] = []
  columns.forEach((key: string) => {
    set_sql.push(key + '= ?')
  })
  const sql: string =
    'UPDATE ' +
    table_name +
    ' SET ' +
    set_sql.join(',') +
    ' WHERE id = ' +
    onSplicingQuotation(row_id) +
    ';'
  return onCheckExecSQLRes({ sql, params })
}

/**
 * @Author: LGJ
 * @Description: 运行指定sql
 * @Date: 2024/2/21 11:11
 */
export const onRunAppointSql = (sql: string) => {
  return onCheckExecSQLRes({ fun: 'all', sql })
}
```
