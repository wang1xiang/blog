---
date: 2024-5-17
title: 练习Mysql
tags:
  - nest
describe: mysql-satart
---

## 安装

通过 Docker 安装 mysql 镜像，完成后 run

![mysql-docker-run](./images/mysql-docker-run.png)

`MYSQL_ROOT_PASSWORD` 参数是个必填项，用于指定 mysql 的密码，不填写启动会报错

## 连接工具

可以使用官方提供的免费版 [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)，也可以找到破解版的 Navicat

连接数据库：

![mysql-navicate-start](./images/mysql-navicate-start.png)

点击此按钮创建一个 schema，也就是一个数据库

![mysql-create-schema](./images/mysql-create-schema.png)

mysql 中对应的关系如下：

一个连接 connection 可以创建多个数据库 schema，一个 schema 可以创建多个表 table

创建 schema 完成后，右键点击对应的 `表` 创建一个表

![mysql-create-table](./images/mysql-create-table.png)

转成 sql 语句是这样：

```sql
INSERT INTO `users`.`user` (`name`, `password`, `create_time`, `update_time`) VALUES ('li', '456789', '2024-05-16 17:58:24', '2024-05-24 17:58:28')
```

接着查询所有数据，通过

```sql
SELECT * FROM `user`
```

![mysql-all-data](./images/mysql-all-data.png)

还有修改和删除

```sql
UPDATE `hello-mysql`.`student` SET `email` = 'xxx@qq.com' WHERE (`id` = '10');
```

## 用到的 SQL

### 查询今天新增的用户

```sql
SELECT count(*) FROM user_info WHERE DATE(created_at) = '2024-06-14'
```

使用 DATE() 函数来提取日期部分，并与今天的日期进行比较

### 查询今日活跃的用户

```sql
SELECT COUNT(DISTINCT uuid) AS count_distinct_uuid_today
FROM token_auth_log
WHERE DATE(created_at) = CURDATE();
```

- WHERE DATE(created_at) = CURDATE() 确保只选择 created_at 等于今天的记录
- COUNT(DISTINCT uuid)：COUNT(DISTINCT uuid) 计算满足条件的唯一 uuid 的数量。DISTINCT 关键字确保每个 uuid 只计算一次，避免重复计数。

### 查询 user_auth 中根据 src 分类的数据

```sql
SELECT src, COUNT(*) AS count
FROM user_auth
GROUP BY src;
```

- 选择 src 列和计算计数：
  SELECT src, COUNT(_) AS count 选择 src 列并计算每个 src 的记录数。
  COUNT(_) 函数用于计算每个组中的记录数。

- 按 src 进行分组：
  GROUP BY src 将查询结果按 src 列进行分组。

### 查询近 30 天用户数

```sql
SELECT DATE(created_at) AS date,
       COUNT(*) AS user_count
FROM user_auth
WHERE created_at >= CURDATE() - INTERVAL 29 DAY
GROUP BY DATE(created_at)
ORDER BY DATE(created_at);
```

- SELECT DATE(created_at) AS date: 选择 created_at 字段的日期部分，并将其命名为 date。
- COUNT(\*) AS user_count: 统计每天的用户数量，并将其命名为 user_count。
- FROM user_auth: 从 user_auth 表中查询数据。
- WHERE created_at >= CURDATE() - INTERVAL 29 DAY: 限制只选择过去 30 天（包括今天）的数据。
- GROUP BY DATE(created_at): 按照日期进行分组，以便计算每天的用户数量。
- ORDER BY DATE(created_at): 按照日期顺序排序结果。

### 查询近 30 天用户数——累计

1. 创建 numbers 表生成日期序列

   ```sql
   CREATE TEMPORARY TABLE IF NOT EXISTS numbers (num INT);
     TRUNCATE TABLE numbers;
     INSERT INTO numbers (num) VALUES (0), (1), (2), (3), (4), (5), (6), (7), (8), (9),
      (10), (11), (12), (13), (14), (15), (16), (17), (18), (19),
      (20), (21), (22), (23), (24), (25), (26), (27), (28), (29);
   ```

   - `CREATE TEMPORARY TABLE IF NOT EXISTS numbers (num INT)`: 创建一个临时表 numbers，如果不存在的话
   - `TRUNCATE TABLE numbers`: 清空表 numbers，确保没有旧数据
   - `INSERT INTO numbers (num) VALUES (...)`: 插入从 0 到 29 的数字，共 30 个数。

2. 生成日期序列并计算用户总量

   使用这个 numbers 表来生成日期序列

   ```sql
   -- 生成最近 30 天的日期序列并计算用户总量
    SELECT
        DATE_SUB(CURDATE(), INTERVAL num DAY) AS date,
        (SELECT COUNT(DISTINCT uuid) FROM user_auth WHERE DATE(created_at) <= DATE_SUB(CURDATE(), INTERVAL num DAY)) AS total_users
    FROM
        numbers
    ORDER BY
        date;
   ```

   - `DATE_SUB(CURDATE(), INTERVAL num DAY) AS date`: 生成从当前日期起的最近 30 天的日期
   - `子查询 SELECT COUNT(DISTINCT uuid) FROM user_auth WHERE DATE(created_at) <= DATE_SUB(CURDATE(), INTERVAL num DAY)`: 计算每个日期之前（包括当天）的用户总量
   - `ORDER BY date`: 按日期排序结果

### 联合查询：查询 user_okcard 所有字段 + user_auth src 字段

```sql
SELECT u.*, a.src
FROM user_okcard u
LEFT JOIN user_auth a ON u.uuid = a.uuid
ORDER BY u.uuid
LIMIT ?, ?
```

- user_okcard 是主表，user_auth 是从表
- 别名 u 来代表 user_okcard 表
- `u.*` 表示选择 user_okcard 表的所有字段；a.src 表示选择 user_auth 表中的 src 字段
- 使用 LEFT JOIN 连接两个表，根据 uuid 关联
- 使用 LIMIT ? OFFSET ? 实现分页

#### user_auth 中 uuid 有多个，需要每个匹配到的 src 整合成一个字段

```sql
SELECT u.*, GROUP_CONCAT(a.src SEPARATOR ',') AS src_list
FROM user_okcard u
LEFT JOIN user_auth a ON u.id = a.user_id
GROUP BY u.id;
```

- GROUP_CONCAT(a.src SEPARATOR ',') AS src_list：使用 GROUP_CONCAT() 函数将 user_auth 表中每个匹配的 src 字段拼接成一个以逗号分隔的字符串，并将其命名为 src_list
