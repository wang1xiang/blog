---
date: 2024-3-29
title: Linux免密登录
tags:
  - linux
describe: Linux免密登录
---

Mac 本地生成公钥和私钥，然后将公钥放到 linux 的 root（也就是~）目录下的.ssh 文件夹下，如何没有则生成一个。

1. 在 Mac 客户端命令行生成公钥和私钥

   ```bash
   cd ~/.ssh
   # 如果没有公钥（id_rsa.pub）私钥（id_rsa）则
   ssh-keygen -t rsa
   # 生成两个文件 id_rsa（私钥）和 id_rsa.pub（公钥）
   ```

2. 发送公钥到 CentOS 服务器端

   ```bash
   # root 登录服务器的用户名
   # 11.30.60.18 服务器 ip
   # ~/.ssh 存放 ssh 文件的目录。这个需要自己寻找，可能是
   scp id_rsa.pub root@11.30.60.18:~/.ssh
   ```

3. 登录服务器进行授权

   ```bash
   cd ~/.ssh
   cat id_rsa.pub >> authorized_keys
   # 注：必须设置成 600
   chmod 600 authorized_keys
   ```

   重新登录服务器试试
