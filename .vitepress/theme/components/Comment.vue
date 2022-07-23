<template>
  <div id="gitalk-container"></div>
</template>

<script>
  export default {
    name: "blog-comments",
    mounted() {
      const commentConfig = {
        // 是否开启
        enable: true,
        // clientID
        clientID: "a8296833d44633072517",
        // clientSecret
        clientSecret: "8af7efce84642c54ce9e6206fd1da2b01952a3d1",
        // 评论项目名
        repo: 'blog-comments',
        owner: 'JexLau',
        admin: ['JexLau'],
        githubID:'JexLau',
        id: decodeURI(window.location.pathname),
        language:'zh-CN',
        distractionFreeMode: true
      };
      const gitalk = new Gitalk(commentConfig);
      gitalk.render("gitalk-container");
    },
  };
</script>