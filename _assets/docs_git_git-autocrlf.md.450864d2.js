import{f as e,g as a,J as t}from"./common-03e46d7f.js";const n='{"title":"eslint报错Delete ␍ 解决方法","frontmatter":{"date":"2022-08-30","title":"eslint报错Delete `␍` 解决方法","tags":["git"],"describe":"多种方式解决Delete `␍`"},"headers":[{"level":3,"title":"报错原因","slug":"报错原因"},{"level":3,"title":"解决方法","slug":"解决方法"}],"relativePath":"docs/git/git-autocrlf.md","lastUpdated":1681979634281.8176}';var s={};const o=[t('<h3 id="报错原因"><a class="header-anchor" href="#报错原因" aria-hidden="true">#</a> 报错原因</h3><p>windows 在换行的时候，同时使用了回车符 CR 和换行符（LF），而 Linux 和 Mac 系统使用的回车符 CR，所以拉取代码之后 eslint 就会报错</p><h3 id="解决方法"><a class="header-anchor" href="#解决方法" aria-hidden="true">#</a> 解决方法</h3><ol><li><p>手动修改 <code>ctrl + shift + p</code>调出命令行输入<code>Change of End Line</code>，选择 CRLF</p></li><li><p>.eslintrc 添加 rule 不检测文件每行结束的格式</p><div class="language-json"><pre><code> rules<span class="token operator">:</span> <span class="token punctuation">{</span>\n   ...\n   <span class="token property">&quot;endOfLine&quot;</span><span class="token operator">:</span> <span class="token string">&quot;auto&quot;</span>\n <span class="token punctuation">}</span>\n</code></pre></div></li><li><p>通过设置 git 的 core.autocrlf 解决 主要是 git 拉代码导致的，所以通过修改 git 配置就可以</p><div class="language-bash"><pre><code><span class="token function">git</span> config --global core.autocrlf <span class="token boolean">false</span>\n</code></pre></div></li></ol>',4)];s.render=function(t,n,s,l,i,r){return e(),a("div",null,o)};export{n as __pageData,s as default};