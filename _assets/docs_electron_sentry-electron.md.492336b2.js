import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"Sentry监控 electron应用方案","frontmatter":{"date":"2023-10-12","title":"Sentry监控 electron应用方案","tags":["electron"],"describe":"Sentry监控 electron应用方案"},"headers":[{"level":2,"title":"上传 Debug Information Files","slug":"上传-debug-information-files"}],"relativePath":"docs/electron/sentry-electron.md","lastUpdated":1714984336425.7297}';var p={};const e=[a('<p>需要安装的包文件</p><ul><li>@sentry/electron</li><li>@sentry/wizard</li><li>@sentry/cli （devDependencies）</li></ul><p><strong>主进程修改</strong></p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token operator">*</span> <span class="token keyword">as</span> Sentry <span class="token keyword">from</span> <span class="token string">&#39;@sentry/electron/main&#39;</span>\nSentry<span class="token punctuation">.</span><span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">dsn</span><span class="token operator">:</span> <span class="token string">&#39;https://xxx@sentry.qmpoa.com/57&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\ncrashReporter<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  <span class="token literal-property property">ignoreSystemCrashHandler</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n  <span class="token literal-property property">submitURL</span><span class="token operator">:</span> <span class="token string">&#39;https://sentry.qmpoa.com/api/57/minidump/?sentry_key=xxx&#39;</span><span class="token punctuation">,</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\napp<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;ready&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p>此处需注意在 app ready 之前 sentry 初始化，crashReporter 作用是将崩溃日志提交给远程服务器也就是我们的私有化 sentry。可以通过使用 process.crash()生成一个崩溃来测试崩溃报告器</p><p><img src="/blog/_assets/sentry-first-error.d8a14879.png" alt="sentry-first-error"></p><p><img src="/blog/_assets/sentry-first-error1.b86be234.png" alt="sentry-first-error1"></p><p>一个类似这样的报错。 虽然能在平台上收到崩溃的监控，上传的 minidump 文件是汇编级别的代码，我们还需要对应的 symbol 文件来解析这些调用栈，使其还原至我们在项目中写的具体函数名。</p><h2 id="上传-debug-information-files"><a class="header-anchor" href="#上传-debug-information-files" aria-hidden="true">#</a> 上传 Debug Information Files</h2><p>调试信息文件用于将地址和简化的函数名从本机崩溃报告转换为函数名和位置。 我们需要 sentry-cli 来帮助我们查找对应的 symbol 文件。</p><p><img src="/blog/_assets/sentry-first-error3.6f00e4d8.png" alt="sentry-first-error3"></p><p>我们根据 uuid 在本地中查找所需的文件</p><div class="language-bash"><pre><code><span class="token function">npm</span> <span class="token function">install</span> -g @sentry/cli\n</code></pre></div><p>sentry-cli 有非常完善的文档，这里只介绍如何在本地上传 symbol 文件</p><p>首先利用 sentry-cli 登录，url 默认是 <a href="http://sentry.io" target="_blank" rel="noopener noreferrer">sentry.io</a>，如果是自己的服务，那么你需要按照如下操作进行登录。</p><div class="language-bash"><pre><code>sentry-cli --url xxxxx login\n</code></pre></div><p>按照指示登录后，我们需要获取相应的 auth-token。 校验完毕后，我们可以通过 uuid 查找本地的 symbol 文件</p><div class="language-bash"><pre><code>sentry-cli difutil <span class="token function">find</span> uuid\n</code></pre></div><p>找到本地的 symbol 文件后，我们需要上传到服务器</p><div class="language-bash"><pre><code>sentry-cli --auth-token xxxx upload-dif -o org -p project xxxx<span class="token punctuation">(</span>localpath<span class="token punctuation">)</span>\n</code></pre></div><p>上传之后，我们就能解析具体的异常信息了</p><p><img src="/blog/_assets/sentry-first-error4.897b26a4.png" alt="sentry-first-error4"></p><p><strong>Render 进程修改</strong></p><p>在渲染端文件添加（vue 的 main）</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token operator">*</span> <span class="token keyword">as</span> Sentry <span class="token keyword">from</span> <span class="token string">&#39;@sentry/electron/renderer&#39;</span>\nSentry<span class="token punctuation">.</span><span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">dsn</span><span class="token operator">:</span> <span class="token string">&#39;https://xx@sentry.qmpoa.com/57&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p>我这里遇到一个问题就是我在下面 初始化 sentry ，捕获到的错误不全，所以修改了一下加到了 vue 的全局捕获错误里主动发布一个捕获</p><div class="language-js"><pre><code>app<span class="token punctuation">.</span>config<span class="token punctuation">.</span><span class="token function-variable function">errorHandler</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">err<span class="token punctuation">,</span> instance<span class="token punctuation">,</span> trace</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">.</span><span class="token constant">NODE_ENV</span> <span class="token operator">!==</span> <span class="token string">&#39;development&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    Sentry<span class="token operator">?.</span><span class="token function">captureException</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n  console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>\n    <span class="token string">&#39;error:&#39;</span><span class="token punctuation">,</span>\n    err<span class="token punctuation">,</span>\n    <span class="token string">&#39;\\r\\n&#39;</span><span class="token punctuation">,</span>\n    <span class="token string">&#39;instance:&#39;</span><span class="token punctuation">,</span>\n    instance<span class="token punctuation">,</span>\n    <span class="token string">&#39;\\r\\n&#39;</span><span class="token punctuation">,</span>\n    <span class="token string">&#39;trace:&#39;</span><span class="token punctuation">,</span>\n    trace\n  <span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>就此也就捕获正常了。</p>',28)];p.render=function(a,t,p,o,r,c){return n(),s("div",null,e)};export{t as __pageData,p as default};