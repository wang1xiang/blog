import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"sentry-cli报错修复","frontmatter":{"date":"2022-10-19","title":"sentry-cli报错修复","tags":["work"],"describe":"Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/"},"relativePath":"docs/work/sentry-cli-error.md","lastUpdated":1670987452832.851}';var o={};const r=[a('<ul><li><p>使用sentry-cli安装依赖时出现以下报错</p><div class="language-bash"><pre><code>Error: Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/\n</code></pre></div></li><li><p>yarn报错解决方式</p><p>修改.yarnrc文件，C:\\Users\\xiang wang.yarnrc，添加以下配置</p><div class="language-bash"><pre><code>registry <span class="token string">&quot;https://registry.npm.taobao.org&quot;</span>\nENTRYCLI_CDNURL <span class="token string">&quot;https://cdn.npm.taobao.org/dist/sentry-cli&quot;</span>\nsentrycli_cdnurl <span class="token string">&quot;https://cdn.npm.taobao.org/dist/sentry-cli&quot;</span>\n</code></pre></div><p>重新执行yarn即可</p></li><li><p>npm报错解决方式</p><ol><li>修改.npmrc，如上</li><li>npm执行命令</li></ol><div class="language-bash"><pre><code><span class="token function">npm</span> <span class="token builtin class-name">set</span> <span class="token assign-left variable">ENTRYCLI_CDNURL</span><span class="token operator">=</span>https://cdn.npm.taobao.org/dist/sentry-cli\n\n<span class="token function">npm</span> <span class="token builtin class-name">set</span> <span class="token assign-left variable">sentrycli_cdnurl</span><span class="token operator">=</span><span class="token operator">&lt;</span>https://cdn.npm.taobao.org/dist/sentry-cli\n</code></pre></div></li></ul>',1)];o.render=function(a,t,o,e,l,p){return n(),s("div",null,r)};export{t as __pageData,o as default};