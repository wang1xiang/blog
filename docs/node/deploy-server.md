---
date: 2022-9-15
title: 使用node命令自动部署服务
tags:
  - node
  - vite
describe: 部署自己的blog到服务器上
---
  
自从有了服务器之后，以前用vitepress写的博客，每次修改之后，既要部署在github上，又想要部署在自己的服务器上。<br />

### github pages部署

github的部署已经有[deploy](https://github.com/wang1xiang/blog/blob/master/scripts/bin/deploy.sh)脚本，可以输入`yarn deploy`命令直接部署。

### 服务器部署

想从本地部署服务器，需要几个步骤：

1. 连接服务器
   使用[ssh2-sftp-client](https://www.npmjs.com/package/ssh2-sftp-client)

   ```js
   // config.js
    const config = {
      host: '43.140.252.63', // 服务器地址
      remoteStatic: '/usr/local/tomcat/webapps/ROOT/dist.tar.gz', // 需要上传到服务器的目录
      port: "22", // 端口
      username: "root", // root
      password: "", // 密码 执行脚本时传入 node xxx/upload.js password
      localStatic: path.join(__dirname, '../../.vitepress/dist.tar.gz'), // tar.gz存在的目录
    };
   // index.js
    const Client = require("ssh2-sftp-client");
    const config = require("./config");
    
    sftp
      .connect(config)
      .then(() => {
        console.log(success("sftp连接成功"));
        ...
      })
   ```

2. 上传打包后的文件
   - 首先判断dist目录是否存在
   - 如果存在，压缩后再传入（dist文件太多，传输太慢）

     ```js
     if (fs.existsSync(options.localStatic)) {
        console.log(success("开始上传压缩文件"));
        return sftp.put(options.localStatic, options.remoteStatic);
      } else if (fs.existsSync(baseDir)) {
        isDist = true;
        console.log(success("压缩文件不存在，开始上传dist目录"));
        return sftp.uploadDir(baseDir, options.remoteStatic.slice(0, -12));
      }
     ```

   - 上传完成，使用ssh2进行远程命令解压

     ```js
     ...
      const { Client } = require("ssh2");
      const conn = new Client();
      conn
        .on("ready", () => {
          // 远程解压
          const remoteModule = options.remoteStatic.replace(
            "dist.tar.gz",
            ""
          );
          /**
           * 执行命令
            * cd /usr/local/tomcat/webapps/ROOT
            * tar xvf dist.tar.gz
            */
          conn.exec(
            `cd ${remoteModule};tar xvf dist.tar.gz`,
            (err, stream) => {
              if (err) throw err;
              stream
                .on("close", (code) => {
                  code === 0
                    ? console.log(success("解压完成"))
                    : console.log(error("解压失败"));
                })
                ...
            })
            ...
        })
     ```

3. 将命令添加在scripts中

   ```json
   {
    "scripts": {
      "zip": "cd .vitepress/dist && tar -zcvf ../dist.tar.gz *",
      "build:server": "cross-env APP_ENVKEY=server vitepress build && npm run zip",
      "deploy:server": "npm run build:server && node scripts/upload",
    },
   }
   ```

4. 输入命令`npm run deploy:server password`，password为服务器密码

通过以上几个步骤，就可以把前端服务直接通过命令行的方式部署在服务器上<br />
[代码地址](https://github.com/wang1xiang/blog/blob/master/scripts/upload)
