const path = require('path');

const config = {
  host: '82.157.207.41', // 服务器地址
  remoteStatic: '/usr/local/tomcat/webapps/ROOT/dist.tar.gz', // 需要上传到服务器的目录
  port: "22", // 端口
  username: "root", // root
  password: "", // 密码 执行脚本时传入 node xxx/upload.js password
  localStatic: path.join(__dirname, '../../.vitepress/dist.tar.gz'), // tar.gz存在的目录
};

module.exports = config;