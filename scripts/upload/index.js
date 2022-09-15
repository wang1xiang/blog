const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const Client = require("ssh2-sftp-client");
const config = require("./config");
const sftp = new Client();

const error = chalk.bold.red; // 报错
const success = chalk.bold.green; // 正确

const baseDir = path.join(__dirname, "../../.vitepress/dist"); // 打包后的目录
const upload = (config, options) => {
  if (!fs.existsSync(baseDir)) {
    console.log(error("不存在dist目录，先执行npm run build:server"));
    return;
  }
  // 标志上传dist目录
  let isDist = false;
  sftp
    .connect(config)
    .then(() => {
      console.log(success("sftp连接成功"));
      // 判断gz文件存在时 上传gz 不存在时上传dist
      if (fs.existsSync(options.localStatic)) {
        console.log(success("开始上传压缩文件"));
        return sftp.put(options.localStatic, options.remoteStatic);
      } else if (fs.existsSync(baseDir)) {
        isDist = true;
        console.log(success("压缩文件不存在，开始上传dist目录"));
        return sftp.uploadDir(baseDir, options.remoteStatic.slice(0, -12));
      }
    })
    .then(() => {
      console.log(success("文件上传成功"));
      // 传输结束
      sftp.end();
      if (!isDist) {
        console.log(success("开始解压"));
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
                    conn.end();
                    // 解压完成 删除本地文件
                    fs.unlink(options.localStatic, (err) => {
                      if (err) throw err;
                      console.log(success("删除压缩文件成功"));
                    });
                  })
                  .on("data", (data) => {});
              }
            );
          })
          .connect(config);
      }
    })
    .catch((err) => {
      console.log(error("失败"), err);
      sftp.end();
    });
};
// 上传文件
if (process.argv?.[2]) {
  config.password = process.argv?.[2];
  upload(config, {
    localStatic: path.resolve(__dirname, config.localStatic), // 本地文件夹路径
    remoteStatic: config.remoteStatic, // 服务器文件夹路径器
  });
} else {
  console.log(error("传入服务器密码"), "格式: npm run deploy:server password");
}
