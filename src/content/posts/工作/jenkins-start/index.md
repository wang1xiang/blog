---
title: "队友升职加薪来不及羡慕，被迫解锁 Jenkins 技能（小小玩意，拿捏 🫴）"
published: 2024-03-11
description: ""
tags: ["work"]
category: "工作"
image: api
draft: false
---

![jenkins-learn](./jenkins-learn.png)

## 入坑 Jenkins

作为一个前端，想必大家都会有这个想法：“**Jenkins 会用就行了，有啥好学的**”。

我一直都是这么想的，不就会点个`开始构建`就行了嘛！

可是碰巧我们之前负责 Jenkins 的前端同事升了职，碰巧这个项目组就剩了两个人，碰巧我比较闲，于是这个“活”就落在我的头上了。

![yali](./yali.jpeg)

压力一下就上来了，一点不懂 Jenkins 可咋整？

然而现实是没有一点儿压力。

刚开始的时候挺轻松，也就是要发版的流程到我这了，我直接在对应项目上点击`开始构建`，so easy！可是某一天，突然遇到一个 bug：我们每次 web 端项目发完后，桌面端的 hybrid 包需要我手动改 OSS 上配置文件的版本号，正巧那天忘记更新版本号了，导致桌面端应用本地的 hybrid 没有更新。。。

领导：你要不就别手动更新了，弄成自动化的
我：😨 啊！什么，我我我不会，是不可能的

小弟我之前没有接触过 Jenkins，看着那一堆配置着实有点费脑，于是就只能边百度学习边输出，从 Jenkins 安装开始到配置不同类型的构建流程，踩过不少坑，最后形成这篇万字长文。如果有能帮到大家的点，我就很开心了，毕竟我也是刚接触的！

## 说说我经历过的前端部署流程

按照我的经历，我把前端部署流程分为了以下几个阶段：即原始时代 -> 脚本化时代 -> CI/CD 时代。

![jenkins-history](./jenkins-history.png)

### 原始时代

最开始的公司运维是一个小老头，他只负责管理服务器资源，不管各种项目打包之类的。我们就只能自己打包，再手动把构建的文件丢到服务器上。

整体流程就是：本地合并代码 --> 本地打包 --> 上传服务器；

上传服务器可以分为这几个小步骤：打开 xshell --> 连接服务器 --> 进入 tomcat 目录 --> 通过 ftp 上传本地文件。

可能全套下来需要 5 分钟左右。

### 脚本化时代

为了简化，我写了一个 node 脚本，通过`ssh2-sftp-client`将`上传服务器`这一步骤脚本化：

```js
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const Client = require('ssh2-sftp-client')
const sftp = new Client()
const envConfig = require('./env.config')

const defalutConfig = {
  port: '22',
  username: 'root',
  password: '123',
  localStatic: './dist.tar.gz',
}

const config = {
  ...defalutConfig,
  host: envConfig.host,
  remoteStatic: envConfig.remoteStatic,
}

const error = chalk.bold.red
const success = chalk.bold.green
function upload(config, options) {
  if (!fs.existsSync('./dist') && !fs.existsSync(options.localStatic)) {
    return
  }
  // 标志上传dist目录
  let isDist = false
  sftp
    .connect(config)
    .then(() => {
      // 判断gz文件存在时 上传gz 不存在时上传dist
      if (fs.existsSync(options.localStatic)) {
        return sftp.put(options.localStatic, options.remoteStatic)
      } else if (fs.existsSync('./dist')) {
        isDist = true
        return sftp.uploadDir('./dist', options.remoteStatic.slice(0, -12))
      }
    })
    .then(() => {
      sftp.end()
      if (!isDist) {
        const { Client } = require('ssh2')
        const conn = new Client()
        conn
          .on('ready', () => {
            // 远程解压
            const remoteModule = options.remoteStatic.replace('dist.tar.gz', '')
            conn.exec(
              `cd ${remoteModule};tar xvf dist.tar.gz`,
              (err, stream) => {
                if (err) throw err
                stream
                  .on('close', (code) => {
                    code === 0
                    conn.end()
                    // 解压完成 删除本地文件
                    fs.unlink(options.localStatic, (err) => {
                      if (err) throw err
                    })
                  })
                  .on('data', (data) => {})
              }
            )
          })
          .connect(config)
      }
    })
    .catch((err) => {
      sftp.end()
    })
}

// 上传文件
upload(config, {
  localStatic: path.resolve(__dirname, config.localStatic), // 本地文件夹路径
  remoteStatic: config.remoteStatic, // 服务器文件夹路径器
})
```

![upload-dist](./upload-dist.png)

最后只要通过执行`yarn deploy`即可实现打包并上传，用了一段时间，队友也都觉得挺好用的，毕竟少了很多手动操作，效率大大提升。

### CI/CD 时代

不过用了没多久后，来了个新的运维小年轻，一上来就整了个 Jenkins ，取代了我们手动打包的过程，只要我们点击部署就可以了，当时就感觉 Jenkins 挺方便的，但又觉得和前端没多大关系，也就没学习。

不过也挺`烦` Jenkins 的，为啥呢？

> 当时和测试说的最多的就是“我在我这试试.....我这没问题啊，你刷新一下”，趁这个时候，赶紧打包重新部署下。有了 Jenkins 后，打包都有记录了，测试一看就知道我在哄她了 🙄

## Jenkins 解决了什么问题

我觉得在了解一个新事物前，应该先了解下它的出现解决了什么问题。

以我的亲身经历来看，Jenkins 的出现使得 `拉取代码 -> 打包 -> 部署 -> 完成后工作（通知、归档、上传CDN等）`这一繁琐的流程不需要人为再去干预，一键触发 🛫。

![jenkins-vs-old](./jenkins-vs-old.png)

只需要点击开始构建即可，如何你觉得还得每次打开 jenkins 页面去点击构建，可以通过设置代码提交到 master 或合并代码时触发构建，这样就不用每次手动去点击构建了，省时更省力 🚴🏻‍♂️。

## Jenkins 部署

[Jenkins 中文帮助文档](https://www.jenkins.io/zh/doc/)

Jenkins 提供了多种[安装](https://www.jenkins.io/zh/download/)方式，我的服务器是 Centos，按照[官方教程](https://mirrors.jenkins-ci.org/redhat/)进行部署即可。

官方提供两种方式进行安装：

方式一：

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key

yum install jenkins
```

方式二：

直接下载 rpm 包进行安装，地址：[https://mirrors.jenkins-ci.org/redhat/](https://mirrors.jenkins-ci.org/redhat/)

```bash
wget https://pkg.jenkins.io/redhat/jenkins-2.449-1.1.noarch.rpm
rpm -ivh jenkins-2.449-1.1.noarch.rpm
```

### 安装过程

我是使用方式二进行安装的，来看下具体过程。

首先需要**安装 jdk17 以上的版本**

1. 下载对应的 jdk

   ```bash
   wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz
   ```

2. 解压并放到合适位置

   ```bash
   tar xf jdk-17_linux-x64_bin.tar.gz
   mv jdk-17.0.8/ /usr/lib/jvm
   ```

3. 配置 Java 环境变量

   ```bash
   vim /etc/profile
   export JAVA_HOME=/usr/lib/jvm/jdk-17.0.8
   export CLASSPATH=$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
   export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
   ```

4. 验证

   ```bash
   java -version
   ```

   ![jenkins-java-version](./jenkins-java-version.png)

接着安装 Jenkins，需要注意：**Jenkins 一定要安装最新版本，因为插件要求最新版本**，最新的 2.449。

1. 下载 rpm 包

   ```bash
   cd /usr/local/jenkins
   wget https://mirrors.jenkins-ci.org/redhat/jenkins-2.449-1.1.noarch.rpm
   ```

2. 安装 Jenkins

   ```bash
   rpm -ivh jenkins-2.449-1.1.noarch.rpm
   ```

   ![jenkins-install-2.449](./jenkins-install-2.449.png)

3. 启动 Jenkins

   ```bash
   systemctl start jenkins
   ```

   ![jenkins-install-error](./jenkins-install-error.png)

你以为就这么简单？肯定会报错的，通过百度报错信息，报错原因是：**Java 环境不对**，百度到的解决方法：

修改`/etc/init.d/jenkins`文件，添加 JDK，但是目录下并没有这个文件，继续百度得知：

**使用 `systemctl` 启动 jenkins 时，不会使用 `etc/init.d/jenkins` 配置文件，而是使用 `/usr/lib/systemd/system/jenkins.service`文件**。

于是修改：

```bash
vim /usr/lib/systemd/system/jenkins.service
```

![jenkins-service-java](./jenkins-service-java.png)
搜索 Java，找到上面这一行，打开注释，修改为对应的 JDK 位置：

```bash
Environment="JAVA_HOME=/usr/lib/jvm/jdk-17.0.10"
```

重新启动 Jenkins：

```bash
systemctl restart jenkins
```

查看启动状态，出现如下则说明 Jenkins 启动完成：

![jenkins-install-success](./jenkins-install-success.png)

接着在浏览器通过 `ip:8090` 访问，出现如下页面，说明安装成功。

![jenkins-install-success-ip](./jenkins-install-success-ip.png)

此时需要填写管理员密码，通过 `cat /var/lib/jenkins/secrets/initialAdminPassword` 即可获取。

### Jenkins 配置

出现上述界面，填写密码成功后等待数秒，即可出现如下界面：

![jenkins-install-plugins](./jenkins-install-plugins.png)

选择 `安装推荐的插件`

![jenkins-install-plugins-wait](./jenkins-install-plugins-wait.png)

这个过程稍微有点慢，可以整理整理文档，等待安装完成。

安装完成后，会出现此页面，需要创建一个管理员用户。

![jenkins-install-ok](./jenkins-install-ok.png)

点击开始使用 Jenkins，即可进入 Jenkins 首页。

![jenkins-home](./jenkins-home.png)

至此，Jenkins 安装完成 🎉🎉🎉。

### 安装过程遇到的问题

1. 没有经验第一次安装，参考网上文档推荐的是 JDK8，结果安装的 Jenkins 至少需要 JDK 11，导致安装失败；

2. 第二次安装，按照网上的文档安装，不是最新版本，导致部分插件安装失败；

   [release](https://github.com/jenkinsci/jenkins/releases)
   [版本](https://mirrors.jenkins-ci.org/redhat/)

3. 配置修改问题

   - Jenkins 默认的配置文件位于 `/usr/lib/systemd/system/jenkins.service`
   - 默认目录安装在 `/var/lib/jenkins/`
   - 默认工作空间在 `/var/lib/jenkins/workspace`

4. 修改端口号为 `8090`

   ```bash
   vim /usr/lib/systemd/system/jenkins.service
   ```

   修改 `Environment="JENKINS_PORT=8090"`，修改完后执行：

   ```bash
   systemctl daemon-reload
   systemctl restart jenkins
   ```

### 如何卸载 Jenkins

安装过程遇到了不少坑，基本都是卸载了重新安装，于是就总结了以下卸载的命令。

```bash
# 查找是否存在 Jenkins 安装包
rpm -ql jenkins
# 卸载 Jenkins
rpm -e jenkins
# 再次查看 此时会提示：未安装软件包 jenkins
rpm -ql jenkins
# 删除所有 Jenkins 相关目录
find / -iname jenkins | xargs -n 1000 rm -rf
```

### Jenkins 版本更新

Jenkins 发布版本很频繁，基本为一周一次，参考 [Jenkins 更新](https://segmentfault.com/a/1190000022109648#item-2)

## 项目创建

点击 `+ 新建Item`，输入名称，选择类型：

![jenkins-create-project](./jenkins-create-project.png)

有多种类型可供选择，这里我们主要讲这两种：Freestyle project 和 Pipeline。

### Freestyle project

![jenkins-create-freestyle](./jenkins-create-freestyle.jpeg)

选择这种类型后，就可以通过各种 web 表单（基础信息、源码、构建步骤等），配置完整的构建步骤，对于新手来说，易上手且容易理解，如果第一次接触，创建项目就选择 Freestyle project 即可。

总共有以下几个环节需要配置：

- General
- 源码管理
- 构建触发器
- 构建环境
- Build Steps
- 构建后操作

此时我们点击 OK，创建完如下所示都是空白的，也可以通过创建时的`复制`选项，复制之前项目的配置：

![jenkins-create-configure](./jenkins-create-configure.png)

接着就如同填写表单信息，一步步完成构建工作。

#### General

项目基本信息也就是对所打包项目的描述信息：

![jenkins-configure-general](./jenkins-configure-general.png)

比如描述这里，可以写项目名称、描述、输出环境等等。

##### Discard old builds 丢弃旧的构建

可以理解为**清初构建历史**，Jenkins 每打包一次就会产生一个构建历史记录，在`构建历史`中可以看到从第一次到最新的构建信息，这会导致磁盘空间消耗。

点击配置名称或勾选，会自动展开配置项。这里我们可以设置`保持构建的最大个数`为`5`，则当前项目的构建历史记录只会保留最新的 5 个，并自动删除掉最老的构建。

![jenkins-configure-discard](./jenkins-configure-discard.png)

这个可以按照自己的需求来设置，比如保留 7 天的构建记录或保留最多 100 个构建记录。

Jenkins 的大多数配置都有 `高级` 选项，在高级选项中可以做更详细的配置。

##### This project is parameterized

可以理解为**此构建后续过程可能用到的参数**，可以是手动输入或选项等，如：git 分支、构建环境、特定的配置等等。通过这种方式，项目可以更加灵活和可配置，以适应不同的构建需求和环境。

默认有 8 种参数类型：

1. Boolean Parameter: checkbox 选择，如果需要设置 true/false 值时，可以添加此参数类型
2. Choice Parameter：选择，多个选项
3. Credentials Parameter：账号证书等参数
4. File Parameter：文件上传
5. Multi-line String parameters：多行文本参数
6. Password Parameter：密码参数
7. Run Parameter：用于选择执行的 job
8. String Parameter：单行文本参数

`Git Parameter` 需要在 `系统管理 -> 插件管理` 搜索 `Git Parameter` 插件进行安装，安装完成后重启才会有这个参数。

通过 `添加参数` 来设置后续会用到的参数，比如设置名称为 `delopyTag` 的 `Git Parameter` 参数来指定要构建的分支，设置名称为 `DEPLOYPATH` 的 `Choice Parameter` 参数来指定部署环境等等。

![jenkins-configure-parameter](./jenkins-configure-parameter.png)

#### 源码管理

##### Repositories

一般公司项目都是从 gitlab 上拉代码，首先设置 `Repository URL`，填写 git 仓库地址，比如：`https://gitlab.com/xxx/xxx.git`

填写完后会报错如下：

![jenkins-configure-git-error](./jenkins-configure-git-error.png)

可以通过添加 Credentials 凭证解决，在 Jenkins 中，Git 的 Credentials 是用于访问 Git 仓库的认证信息，这些凭据可以是用户名和密码、SSH 密钥或其他认证机制，以确保 Jenkins 能够安全的与 Git 仓库进行交互，即构建过程中**自动拉取代码、执行构建任务等**。

###### 方式一：在当前页面填写帐号、密码

选择`添加 -> Jenkins -> 填写 git 用户名、密码`等信息生成一个新的 Credentials，然后重新选择我们刚刚添加的 Credentials，报错信息自动消失

![jenkins-configure-git](./jenkins-configure-git.png)

这样添加会有一个问题，就是如果有多个项目时，每次都需要手动填写 Git 账户和密码信息。

###### 方式二：Jenkins 全局凭证设置

在 [Global Credentials](https://jk.qmpoa.com/manage/credentials/store/system/domain/_/) 中设置全局的凭证。

![jenkins-configure-git-credentials](./jenkins-configure-git-credentials.png)

然后在项目中配置时可以直接选择我们刚刚添加的 Credentials，报错信息自动消失。

##### Branches to build

这里构建的分支，可以设置为我们上面设置的 `delopyTag` 参数，即用户自己选择的分支进行构建。

#### 构建触发器

特定情况下出发构建，如**定时触发、代码提交或合并时触发、其他任务完成时触发**等。

如果没有特殊的要求时，这一步完全可以不用设置，在需要构建时我们只需要手动点击开始构建即可。

#### 构建环境

构建环境是在构建开始之前的准备工作，如**清除上次构建、指定构建工具、设置 JDK 、Node 版本、生成版本号**等。

##### Provide Node & npm bin/folder to PATH

默认是没有这一项的，但前端部署需要 Node 环境支持，所以需要在 `系统管理 -> 插件管理` 搜索 `nodejs` 插件进行安装，安装完成后重启才会展示这项配置。

但此时还是不能选择的，需要在 `系统管理 -> 全局工具配置` 中先安装 NodeJs，根据不同环境配置，**可同时安装多个 NodeJs 版本**。

![jenkins-configure-nodeJs](./jenkins-configure-nodeJs.png)

之后在 `Provide Node` 处才有可供选择的 Node 环境。

![jenkins-configure-provide-node](./jenkins-configure-provide-node.png)

##### Create a formatted version number

这个就是我用来解决了一开始问题的配置项，也就是把每次打包的结果上传到 OSS 服务器上时生成一个新的版本号，在 Electron 项目中通过对比版本号，自动更新对应的 hybrid 包，领导都爱上我了 😜。

首先需要安装插件 `Version Number Plugin`，在 `系统管理 -> 插件管理` 中搜索安装，然后重启 Jenkins 即可

![jenkins-configure-version](./jenkins-configure-version.png)

1. Environment Variable Name

   类似于第一步的构建参数，可以在其他地方使用。

2. Version Number Format String

   用于设置版本号的格式，如`1.x.x`，Jenkins 提供了许多内置的环境变量：

   - BUILD_DAY：生成的日期

   - BUILD_WEEK：生成年份中的一周

   - BUILD_MONTH：生成的月份

   - BUILD_YEAR：生成的年份

   - BUILDS_TAY：在此日历日期完成的生成数

   - BUILDS_THIS_WEEK：此日历周内完成的生成数

   - BUILDS_THIS_MONTH：此日历月内完成的生成数

   - BUILDS_THIS_YEAR：此日历年中完成的生成数

   - BUILDS_ALL_TIME：自项目开始以来完成的生成数

3. 勾选 Build Display Name Use the formatted version number for build display name 后

   此时每次构建后就会生成一个个版本号：

   ![jenkins-configure-version-result](./jenkins-configure-version-result.png)

4. 把这个参数传递到后续的 OSS 上传的 Shell 脚本中即可。

如果想要重置版本号，只要设置`Number of builds since the start of the project`为 0 即可，此时就会从 `1.7.0` 重新开始。

### Build Steps

这是最为重要的环节，主要用于定义整个构建过程的具体任务和操作，包括**执行脚本、编译代码、打包应用**等。

我们可以通过 Shell 脚本来完成前端项目常见的操作：安装依赖、打包、压缩、上传到 OSS 等。

点击 `增加构建步骤 -> Execute shell`，在上方输入 shell 脚本，常见的如下：

```bash
#环境变量
echo $PATH
#node版本号
node -v
#npm版本号
npm -v


#进入jenkins workspace的项目目录
echo ${WORKSPACE}
cd ${WORKSPACE}

#下载依赖包
yarn
#开始打包
yarn run build

#进入到打包目录
cd dist
#删除上次打包生成的压缩文件
rm -rf *.tar.gz

#上传oss，如果没有需要可删除此段代码
ossurl="xxx"
curl "xxx" > RELEASES.json
node deploy-oss.cjs -- accessKeyId=$OSS_KEY accessKeySecret=$OSS_SECRET zipDir=tmp.zip ossUrl=xxx/v${BUILD_VERSION}.zip
node deploy-oss.cjs -- accessKeyId=$OSS_KEY accessKeySecret=$OSS_SECRET zipDir=RELEASES.json ossUrl=xxx/RELEASES.json

#把生成的项目打包成压缩包方便传输到远程服务器
tar -zcvf `date +%Y%m%d%H%M%S`.tar.gz *
#回到上层工作目录
cd ../
```

### 构建后操作

通过上面的构建步骤，我们已经完成了项目的打包，此时我们需要执行一些后续操作，如**部署应用、发送通知、触发其他 Job**等操作。

#### Send build artifacts over SSH

通过 Send build artifacts over SSH，我们可以将构建好的产物（**一般是压缩后的文件**）通过 ssh 发送到指定的服务器上用于部署，比如 Jenkins 服务器是 10.10，需要将压缩文件发送到 10.11 服务器进行部署，需要以下步骤：

1. 安装插件

   在 `系统管理 -> 插件管理` 中搜索插件 `Publish over SSH` 安装，用于处理文件上传工作；

2. 配置服务器信息

   在 `系统管理 -> System` 中搜索 `Publish over SSH` 进行配置。

   ![jenkins-publish-over-SSH](./jenkins-publish-over-SSH.png)

   需要填写用户名、密码、服务器地址等信息，完成后点击 `Test Configuration`，如果配置正确，会显示 `Success`，否则会出现报错信息。

   这里有两种方式连接远程服务器，第一种是**密码方式**，输入服务器账户密码等信息即可；

   第二种是**秘钥方式**，在服务器生成密钥文件，并且将私钥**全部拷贝**，记住是全部，要携带**起止标志-----BEGIN RSA PRIVATE KEY-----或-----END RSA PRIVATE KEY----**，粘贴在 `高级 -> key` 即可。

   此处的 `Remote Directory` 是远程服务器接收 Jenkins 打包产物的目录，**必须在对应的服务器手动创建目录**，如 `/home/jenkins`。

3. 项目配置

   选择需要上传的服务器，接着设置需要传输的文件，执行脚本，移动文件到对应的目录。

   ![jenkins-configure-ssh](./jenkins-configure-ssh.png)

##### Transfer Set 参数配置

- `Source files`：需要传输的文件，也就是通过上一步 Build Steps 后生成的压缩文件，这个路径是相对于“工作空间”的路径，即只需要输入 `dist/*.tar.gz` 即可

- `Remove prefix`：删除传输文件指定的前缀，如 `Source files` 设置为`dist/*.tar.gz` ，此时设置 `Remove prefix` 为`/dist`，移除前缀，只传输 `*.tar.gz` 文件；如果不设置酒会传输 `dist/*.tar.gz` 包含了 dist 整个目录，并且会自动在上传后的服务器中创建 `/dist` 这个路径。如果只需要传输压缩包，则移除前缀即可
- `Remote directory`：文件传输到远程服务器上的具体目录，会与 Publish over SSH 插件系统配置中的 `Remote directory` 进行拼接，如我们之前设置的目录是 `/home/jenkins`，此处在写入 `qmp_pc_ddm`，那么最终上传的路径为 `/home/jenkins/qmp_pc_ddm`，与之前不同的是，如果此路径不存在时会自动创建，这样设置后，Jenkins 服务器构建后的产物会通过 ssh 上传到此目录，供下一步使用。

- `Exec command`

  文件传输完成后执行自定义 Shell 脚本，比如移动文件到指定目录、解压文件、启动服务等。

  ```bash
  #!/bin/bash

  #进入远程服务器的目录
  project_dir=/usr/local/nginx/qmp_pc_ddm/${DEPLOYPATH}
  cd $project_dir

  #移动压缩包
  sudo mv /home/jenkins/qmp_pc_ddm/*.tar.gz  .

  #找到新的压缩包
  new_dist=`ls -ltr *.tar.gz | awk '{print $NF}' |tail -1`
  echo $new_dist

  #解压缩
  sudo tar -zxvf $new_dist

  #删除压缩包
  sudo rm *.tar.gz
  ```

  这一步可以使用之前定义的参数，如 `${DEPLOYPATH}`，以及 Jenkins 提供的变量：如 `${WORKSPACE}` 来引用 Jenkins 的工作空间路径等。

#### Build other projects

添加 Build other projects，在项目构建成功后，触发相关联的应用开始打包。

![jenkins-configure-other](./jenkins-configure-other.png)

另外还可以配置企业微信通知、生成构建报告等工作。

此时，所有的配置都设置完成，我们点击`保存`配置，返回到构建页。

## 构建

![jenkins-start-build](./jenkins-start-build.png)

点击 `Build with parameters` 选择对应的分支和部署环境，点击`开始构建`

在控制台输出中，可以看到打包的详细过程，

可以看到我们在`Build Steps`中执行的 Shell 脚本的输出如下：

![jenkins-result-build](./jenkins-result-build.png)

以及我们通过 Publish Over SSH 插件将构建产物传输的指定服务器的输出：

![jenkins-result-ssh](./jenkins-result-ssh.png)

最终需要部署的服务器就有了以下文件：

![jenkins-remote-directory](./jenkins-remote-directory.png)

### Pipeline

对于简单的构建需求或新手用户来说，我们可以直接选择 FreeStyle project。而对于复杂的构建流程或需要更高灵活性和扩展性的场景来说，Pipeline 则更具优势。

通过 `新建任务 -> 流水线` 创建一个流水线项目。

![jenkins-pipeline-white](./jenkins-pipeline-white.png)

开始配置前请先阅读下[流水线](https://www.jenkins.io/zh/doc/book/pipeline/)章节。

### 生成方式

首先，Jenkins 流水线是一套插件，在最开始的插件推荐安装时会自动安装，如果选择自定义安装时，需要手动安装这一套插件。

Jenkins 流水线的定义有两种方式：`Pipeline script` 和 `Pipeline script from SCM`。
![jenkins-pipeline-type](./jenkins-pipeline-type.png)

#### Pipeline script

Pipeline script 是直接在 Jenkins 页面的配置中写脚本，**可直接定义和执行**，比较直观。

![jenkins-pipeline-page](./jenkins-pipeline-page.png)

#### Pipeline script from SCM

Pipeline script from SCM 是将脚本文件和项目代码放在一起，即 `Jenkinsfile`，也可自定义名称。

![jenkins-pipeline-code](./jenkins-pipeline-code.png)

当 Jenkins 执行构建任务时，会从 git 中拉取该仓库到本地，然后读取 `Jenkinsfile` 的内容执行相应步骤，通常**认为在 `Jenkinsfile` 中定义并检查源代码控制是最佳实践**。

当选择 `Pipeline script from SCM` 后，需要设置 SCM 为 `git`，告诉 Jenkins 从指定的 Git 仓库中拉取包含 Pipeline 脚本的文件。

![jenkins-pipeline-code-scm](./jenkins-pipeline-code-scm.png)

如果没有对应的文件时，任务会失败并发出报错信息。

![jenkins-pipeline-code-error](./jenkins-pipeline-code-error.png)

### 重要概念

了解完上面的基础配置，我们先找一段示例代码，粘贴在项目的配置中：

```bash
pipeline {
  agent any
    stages {
      stage('Build') {
        steps {
          echo 'Build'
        }
      }
      stage('Test') {
        steps {
          echo 'Test'
        }
      }
      stage('Deploy') {
        steps {
          echo 'Deploy'
      }
    }
  }
}
```

看下它的输出结果：

![jenkins-pipeline-result](./jenkins-pipeline-result.png)

接着看一下上面语法中几个重要的概念。

#### 流水线 pipline

定义了整个项目的构建过程, 包括：构建、测试和交付应用程序的阶段。

**流水线顶层必须是一个 block，pipeline{}**，作为整个流水线的根节点，如下：

```js
pipeline {
  /* insert Declarative Pipeline here */
}
```

#### 节点 agent

agent 用来指定在哪个代理节点上执行构建，即执行流水线，可以设置为 `any`，表示 Jenkins 可以在任何可用的代理节点上执行构建任务。

但一般在实际项目中，为了满足更复杂的构建需求，提高构建效率和资源利用率，以及确保构建环境的一致性，会根据项目的具体需求和资源情况，设置不同的代理节点来执行流水线。

如：

```js
pipeline {
  agent {
        node {
            label 'slave_2_34'
        }
    }
    ...
}
```

可以通过 `系统管理 -> 节点列表` 增加节点，可以看到默认有一个 master 节点，主要负责协调和管理整个 Jenkins 系统的运行，包括任务的调度、代理节点的管理、插件的安装和配置等。

![jenkins-agent-master](./jenkins-agent-master.png)

#### 阶段 stage

定义流水线的执行过程，如：Build、Test 和 Deploy，可以在可视化的查看目前的状态/进展。

注意：**参数可以传入任何内容**。不一定非得 `Build`、`Test`，也可以传入 `打包`、`测试`，与红框内的几个阶段名对应。

![jenkins-pipeline-console](./jenkins-pipeline-console.png)

#### 步骤 steps

执行某阶段具体的步骤。

### 语法

了解上述概念后，我们仅仅只能看懂一个 Pipeline script 脚本，但距离真正的动手写还有点距离，此时就需要来了解下[流水线语法](https://www.jenkins.io/zh/doc/book/pipeline/syntax/)。

我将上面通过 Freestyle project 的脚本翻译成 Pipeline script 的语法：

```groovy
pipeline {
    agent any
    triggers {
        gitlab(triggerOnPush: true, triggerOnMergeRequest: true, branchFilterType: 'All')
    }
    parameters {
     gitParameter branchFilter: 'origin/(.*)', defaultValue: 'master', name: 'delopyTag', type: 'PT_BRANCH'
    }
    stages {
        stage('拉取代码') {
          steps {
            git branch: "${params.delopyTag}", credentialsId: 'xxx', url: 'https://xxx/fe/qmp_doc_hy.git'
          }
        }
        stage('安装依赖') {
          steps {
            nodejs('node-v16.20.2') {
              sh '''
                #!/bin/bash
                source /etc/profile
                echo "下载安装包"
                yarn config set registry https://registry.npmmirror.com
                yarn
              '''
            }
            sleep 5
          }
        }
        stage('编译') {
          steps {
            sh '''
              #!/bin/bash
              source /etc/profile
              yarn run build
              sleep 5
              if [ -d dist ];then
                cd dist
                rm -rf *.tar.gz

                tar -zcvf `date +%Y%m%d%H%M%S`.tar.gz *
              fi
            '''
            sleep 5
          }
        }
        stage('解压') {
          steps {
            echo '解压'
            sshPublisher(
                publishers: [
                    sshPublisherDesc(
                        configName: 'server(101.201.181.27)',,
                        transfers: [
                            sshTransfer(
                                cleanRemote: false,
                                excludes: '',
                                execCommand: '''#!/bin/bash
                                  #进入远程服务器的目录
                                  project_dir=/usr/local/nginx/qmp_pc_ddm_${DEPLOYPATH}/${DEPLOYPATH}
                                  if [ ${DEPLOYPATH} == "ddm"  ]; then
                                     project_dir=/usr/local/nginx/qmp_pc_ddm/dist
                                  fi
                                  cd $project_dir

                                  sudo mv /home/jenkins/qmp_pc_ddm/*.tar.gz  .

                                  #找到新的压缩包
                                  new_dist=`ls -ltr *.tar.gz | awk \'{print $NF}\' |tail -1`

                                  #解压缩
                                  sudo tar -zxvf $new_dist

                                  #删除压缩包
                                  sudo rm *.tar.gz

                                  #发布完成
                                  echo "环境发布完成"
                                ''',
                                execTimeout: 120000,
                                flatten: false,
                                makeEmptyDirs: false,
                                noDefaultExcludes: false,
                                patternSeparator: '[, ]+',
                                remoteDirectory: 'qmp_pc_ddm',
                                remoteDirectorySDF: false,
                                removePrefix: 'dist/',
                                sourceFiles: 'dist/*.tar.gz'
                            )
                        ],
                        usePromotionTimestamp: false,
                        useWorkspaceInPromotion: false,
                        verbose: false
                    )
                ]
            )
          }
        }
    }
    post {
        success  {
          echo 'success.'
          deleteDir()
        }
    }
}
```

接下来，我们一起来解读下这个文件。

首先，所有的指令都是包裹在 `pipeline{}` 块中，

#### agent

enkins 可以在任何可用的代理节点上执行构建任务。

#### [environment](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#environment)

用于定义环境变量，它们会保存为 Groovy 变量和 Shell 环境变量：定义流水线中的所有步骤可用的环境变量 `temPath`，在后续可通过 `$tmpPath` 来使用；

环境变量可以在全局定义，也可在 stage 里单独定义，全局定义的在整个生命周期里可以使用，在 stage 里定义的环境变量只能在当前步骤使用。

Jenkins 有一些内置变量也可以通过 env 获取（env 也可以读取用户自己定义的环境变量）。

```js
steps {
    echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}"
}
```

这些变量都是 String 类型，常见的内置变量有：

- BUILD_NUMBER：Jenkins 构建序号；
- BUILD_TAG：比如 jenkins-${JOB_NAME}-${BUILD_NUMBER}；
- BUILD_URL：Jenkins 某次构建的链接；
- NODE_NAME：当前构建使用的机器

#### [parameters](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#%E5%8F%82%E6%95%B0)

定义流水线中可以接收的参数，如上面脚本中的 gitParameter，只有安装了 Git Parameters 插件后才能使用，name 设置为`delopyTag`，在后续可通过 `${params.delopyTag}` 来使用；

还有以下参数类型可供添加：

```js
parameters {
  booleanParam(name: 'isOSS', defaultValue: true, description: '是否上传OSS')
  choice(name: 'select', choices: ['A', 'B', 'C'], description: '选择')
  string(name: 'temp', defaultValue: '/temp', description: '默认路径')
  text(name: 'showText', defaultValue: 'Hello\nWorld', description: '')
  password(name: 'Password', defaultValue: '123', description: '')
}
```

#### [triggers](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#%E8%A7%A6%E5%8F%91%E5%99%A8)

定义了流水线被重新触发的自动化方法，上面的配置是：当 Git 仓库有新的 push 操作时触发构建

#### stages 阶段

- 阶段一：拉取代码

  git：拉取代码，参数 `branch` 为分支名，我们使用上面定义的 `${params.delopyTag}`，`credentialsId` 以及 `url`，如果不知道怎么填，可以在 `流水线语法 -> 片段生成器` 中填写对应信息后，自动生成，如下：

  ![jenkins-stage-git](./jenkins-stage-git.png)

  再复制到此处即可。

- 阶段二：安装依赖

  在 `steps` 中，`sh` 是 Jenkins pipeline 的语法，通过它来执行 shell 脚本。

  `#!/bin/bash`表示使用 bash 脚本；
  `source /etc/profile` 用于将指定文件中的环境变量和函数导入当前 shell。

  执行 `yarn` 安装依赖。

- 阶段三：编译

  执行 `yarn build` 打包，

  `if [ -d dist ];` 是 shell 脚本中的语法，用于测试 `dist` 目录是否存在，通过脚本将打包产物打成一个压缩包。

- 阶段四：解压

  将上步骤生成的压缩包，通过 `Publish over SSH` 发送到指定服务器的指定位置，执行 Shell 命令解压。

  不会写 `Publish over SSH` 怎么办？同样，可以在 `流水线语法 -> 片段生成器` 中填写对应信息后，自动生成，如下：

  ![jenkins-generate-publish](./jenkins-generate-publish.png)

#### [post](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#post)

当流水线的完成状态为 `success`，输出 success。

deleteDir() 函数用于删除当前工作目录中的所有文件和子目录。这通常用于清理工作区，确保在下一次构建之前工作区是干净的，以避免由于残留文件或目录引起的潜在问题。

### 构建看看效果

可以直接通过 `Console Output` 查看控制台输出，当然在流水线项目中自然要通过流水线去查看了。

![jenkins-pipeline-result-in](./jenkins-pipeline-result-in.png)

1. 效果一

   ![jenkins-pipeline-result1](./jenkins-pipeline-result1.png)

   Pipeline Overview 中记录了每个步骤的执行情况、开始时间和耗时等信息，但是没有详细信息，详细信息就要在 Pipeline Console 中进行查看。

2. 效果二

   安装插件 `Blue Ocean`，相当于同时结合了 Pipeline Overview 和 Pipeline Console，可以同时看到每个步骤的执行情况等基本信息，以及构建过程中的详细信息。

   ![jenkins-pipeline-result2](./jenkins-pipeline-result2.png)

   通过 Blue Ocean 也可以直接创建流水线，选择代码仓库，然后填写对应的字段，即可快速创建流水线项目，如创建 gitlab 仓库：

   ![jenkins-blue-create](./jenkins-blue-create.png)

   或者直接连接 github 仓库，需要 token，直接点击红框去创建即可：

   ![jenkins-blue-create1](./jenkins-blue-create1.png)

### 通过项目中的 Jenkinsfile 构建

再把对应的 Pipeline script 代码复制到对应代码仓库的 `Jenkinsfile` 文件，设置为 Pipeline script from SCM，填写 git 信息。

![jenkins-pipeline-config-scm](./jenkins-pipeline-config-scm.png)

正常情况下，Jenkins 会自动检测代码仓库的 `Jenkinsfile` 文件，如果选择的文件没有 Jenkinsfile 文件时就会报错，如下：

![jenkins-pipeline-scm-error](./jenkins-pipeline-scm-error.png)

正常按照流水线的执行流程，打开 Blue Ocean，查看构建结果，如下：

![jenkins-pipeline-scm-result](./jenkins-pipeline-scm-result.png)

### 片段生成器

如果你觉得上述代码手写麻烦，刚开始时又不会写，那么就可以使用片段代码生成器来帮助我们生成流水线语法。

进入任务构建页面，点击 `流水线语法` 进入：

### 配置构建过程遇到的问题

1. Jenkins 工作空间权限问题

   ![jenkins-pipeline-error](./jenkins-pipeline-error.png)

   修复：

   ```bash
   chown -R jenkins:jenkins /var/lib/jenkins/workspace
   ```

2. Git Parameters 不显示问题

   当配置完 Git Parameters 第一次点击构建时，会报如下错误，找了很久也没有找到解决方法，于是就先使用 master 分支构建了一次，构建完成之后再次点击构建这里就正常显示了，猜测是没构建前没有 git 仓库的信息，构建完一次后就有了构建信息，于是就正常显示了。

   ![jenkins-pipeline-error1](./jenkins-pipeline-error1.png)

## 总结

本文对 Jenkins 的基本教程就到此为止了，主要讲了 Jenkins 的安装部署，FreeStyle project 和 Pipeline 的使用，以及插件安装、配置等。如果想要学，跟着我这个教程实操一遍，Jenkins 就基本掌握了，基本工作中遇到的问题都能解决，剩下的就只能在实际工作中慢慢摸索了。

再说回最初的话题，前端需不需要学习 Jenkins。我认为接触新的东西，然后学习并掌握，拓宽了技术面，虽然是一种压力，也是得到了成长的机会，在这个前端技术日新月异的时代，前端们不仅要熟练掌握前端技术，还需要具备一定的后端知识和自动化构建能力，才能不那么容易被大环境淘汰。
