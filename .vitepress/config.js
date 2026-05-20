const getPages = require("./utils/pages");
const env = "/";

async function getConfig() {
  let config = {
    head: [
      [
        "meta",
        {
          name: "viewport",
          content:
            "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
        },
      ],
      ["meta", { name: "keywords", content: "翔子Blog" }],
      ["link", { rel: "icon", href: `${env}/favicon.ico` }],
      // 引入 Gitalk
      [
        "link",
        {
          rel: "stylesheet",
          href: "https://lib.baomitu.com/gitalk/1.7.0/gitalk.min.css",
        },
      ],
      ["script", { src: "https://lib.baomitu.com/gitalk/1.7.0/gitalk.min.js" }],
      ["script", { src: "https://lib.baomitu.com/axios/0.21.1/axios.js" }],
    ],
    title: "学习笔记",
    themeConfig: {
      displayAllHeaders: true,
      logo: "/favicon.ico",
      pages: await getPages(),
      author: "翔子",
      search: true,
      nav: [
        { text: "🏠 首页", link: "/index" },
        { text: "📅 归档", link: "/more/docs" },
        { text: "📂 分类", link: "/more/tags" },
      ],
    },
    dest: "public",
    base: env,
  };
  return config;
}
module.exports = getConfig();
