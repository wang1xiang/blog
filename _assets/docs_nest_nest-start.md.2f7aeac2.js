import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"nest入门笔记","frontmatter":{"date":"2023-12-11","title":"nest入门笔记","tags":["next"],"describe":"nest-start"},"headers":[{"level":2,"title":"介绍","slug":"介绍"},{"level":2,"title":"Nest 项目初始化","slug":"nest-项目初始化"},{"level":3,"title":"命令","slug":"命令"},{"level":3,"title":"目录","slug":"目录"},{"level":3,"title":"运行项目","slug":"运行项目"},{"level":2,"title":"Nest 构建 CRUD 项目","slug":"nest-构建-crud-项目"},{"level":2,"title":"Nest 实现五种 HTTP 数据传输方式","slug":"nest-实现五种-http-数据传输方式"},{"level":3,"title":"url param","slug":"url-param"},{"level":3,"title":"query","slug":"query"},{"level":3,"title":"form urlencoded","slug":"form-urlencoded"},{"level":3,"title":"form data","slug":"form-data"},{"level":3,"title":"json","slug":"json"},{"level":2,"title":"Nest 基础","slug":"nest-基础"}],"relativePath":"docs/nest/nest-start.md","lastUpdated":1708995335020.1953}';var p={};const o=[a('<h2 id="介绍"><a class="header-anchor" href="#介绍" aria-hidden="true">#</a> 介绍</h2><p><a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer">Nest</a>是 Node 最流行的企业级服务端开发框架，内置并完全支持 TypeScript，提供了 IOC、AOP、微服务等架构特性。</p><p>Nest 底层使用 Express 或 Fastify，并做了一定程度的封。Nest 是前端同学尝试全栈开发的不二之选。</p><h2 id="nest-项目初始化"><a class="header-anchor" href="#nest-项目初始化" aria-hidden="true">#</a> Nest 项目初始化</h2><p>Nest 项目初始化有两种方式：</p><ol><li><p>全局安装脚手架工具</p><div class="language-bash"><pre><code><span class="token function">npm</span> <span class="token function">install</span> -g @nestjs/cli\nnest new xxx\n</code></pre></div></li><li><p>直接使用 npx 安装</p><div class="language-bash"><pre><code>npx @nestjs/cli new xxx\n</code></pre></div></li></ol><p>安装完成后，控制台输入<code>nest</code>查看可以执行的命令： <img src="/blog/_assets/nest-all-commands.9dacad9a.png" alt="nest-all-commands"></p><h3 id="命令"><a class="header-anchor" href="#命令" aria-hidden="true">#</a> 命令</h3><h4 id="new"><a class="header-anchor" href="#new" aria-hidden="true">#</a> new</h4><p>用于初始化项目，更多配置可通过添加<code>-h</code>来查看帮助。接下来介绍的命令都可以通过<code>-h</code>来查看帮助。</p><div class="language-bash"><pre><code><span class="token comment"># -h查看帮助</span>\nnest new -h\n</code></pre></div><p><img src="/blog/_assets/nest-new-h.e5968e5e.png" alt="nest-new-h"></p><p>可以看到<code>new</code>命令支持多种选项的设置，通过简写大概大概就能看出他们的意思：</p><ul><li>--directory：指定创建目录</li><li>--skip-git：跳过 git 的初始化</li><li>--skip-install：跳过 npm install</li><li>--package-manager：指定包管理工具，指定后初始化项目时不用选择</li><li>--language：指定语言，默认为 typescript</li><li>--strict：是否开启严格模式</li></ul><h4 id="generate"><a class="header-anchor" href="#generate" aria-hidden="true">#</a> generate</h4><p>类似于 plop 这种，<code>generate</code>命令可以帮助我们快速生成模板代码，并且自动更新依赖</p><h4 id="build"><a class="header-anchor" href="#build" aria-hidden="true">#</a> build</h4><p>使用 tsc 或者 webpack 构建代码，默认使用 tsc 构建，通过<code>--webpack</code>切换为使用 webpack 进行打包</p><div class="language-bash"><pre><code>nest build --webpack\n</code></pre></div><h4 id="nest-cli-json"><a class="header-anchor" href="#nest-cli-json" aria-hidden="true">#</a> nest-cli.json</h4><p>项目创建完成后，会生成<code>next-cli.json</code>文件，以上说的选项都可在这里进行配置。</p><p>如设置使用 webpack 进行打包，设置<code>&quot;webpack&quot;: true</code>即可</p><div class="language-json"><pre><code><span class="token punctuation">{</span>\n  <span class="token property">&quot;$schema&quot;</span><span class="token operator">:</span> <span class="token string">&quot;https://json.schemastore.org/nest-cli&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;collection&quot;</span><span class="token operator">:</span> <span class="token string">&quot;@nestjs/schematics&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;sourceRoot&quot;</span><span class="token operator">:</span> <span class="token string">&quot;src&quot;</span><span class="token punctuation">,</span>\n  <span class="token property">&quot;compilerOptions&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token property">&quot;deleteOutDir&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n    <span class="token property">&quot;webpack&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>打包结果如下：</p><p><img src="/blog/_assets/nest-cli-json.59099405.png" alt="nest-cli-json"></p><h4 id="start"><a class="header-anchor" href="#start" aria-hidden="true">#</a> start</h4><p>用于启动开发服务，可以通过<code>--watch</code>启动监听</p><h4 id="info"><a class="header-anchor" href="#info" aria-hidden="true">#</a> info</h4><p>查看项目信息，包括系统信息、 node、npm 和依赖版本</p><p><img src="/blog/_assets/nest-info.f0956028.png" alt="nest-info"></p><h3 id="目录"><a class="header-anchor" href="#目录" aria-hidden="true">#</a> 目录</h3><p>项目初始化完成后，在 src 下存在 5 个文件：</p><div class="language-bash"><pre><code><span class="token builtin class-name">.</span>\n├── app.controller.spec.ts\n├── app.controller.ts\n├── app.module.ts\n├── app.service.ts\n└── main.ts\n</code></pre></div><h4 id="main-ts"><a class="header-anchor" href="#main-ts" aria-hidden="true">#</a> main.ts</h4><p>应用程序的入口文件，使用函数 <code>NestFactory.create(AppModule)</code> 创建 Nest 应用程序实例。</p><p><code>AppModule</code>也就是根模块，可以类比为 Vue 的 App 根组件，<code>NestFactory.create</code>可以类比为 Vue 的<code>createApp</code></p><h4 id="app-module-ts"><a class="header-anchor" href="#app-module-ts" aria-hidden="true">#</a> app.module.ts</h4><p>Nest 应用以模块 Module 为单元，Module 中包含两个核心：控制器和提供者。</p><p>App 模块即 Nest 应用的根模块，负责将所有的控制器和提供者组织到一起。</p><div class="language-ts"><pre><code><span class="token decorator"><span class="token at operator">@</span><span class="token function">Module</span></span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  controllers<span class="token operator">:</span> <span class="token punctuation">[</span>AppController<span class="token punctuation">]</span><span class="token punctuation">,</span>\n  providers<span class="token operator">:</span> <span class="token punctuation">[</span>AppService<span class="token punctuation">]</span><span class="token punctuation">,</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><p><code>@Module</code> 是装饰器语法，将 AppModule 类声明为一个模块。</p><h4 id="app-controller-ts"><a class="header-anchor" href="#app-controller-ts" aria-hidden="true">#</a> app.controller.ts</h4><p>App 模块的控制器层代码，用来接收 http 请求，调用服务层 service 处理后，返回响 应数据，<strong>对应的 MVC 中的 C 层</strong></p><div class="language-ts"><pre><code><span class="token decorator"><span class="token at operator">@</span><span class="token function">Controller</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">AppController</span> <span class="token punctuation">{</span>\n  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token keyword">private</span> <span class="token keyword">readonly</span> appService<span class="token operator">:</span> AppService<span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n\n  <span class="token decorator"><span class="token at operator">@</span><span class="token function">Get</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>appService<span class="token punctuation">.</span><span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p><code>@Controller</code> 装饰器将 AppController 声明为一个控制器 <code>@Get</code> 装饰器声明 getHello 是一个处理 Http 的 GET 请求的方法 <code>@Controller</code> 和 <code>@Get</code> 接收一个字符串用来拼接路由，如 <code>@Controller(&#39;hello&#39;)</code>和<code>@Get(world)</code>拼接出的路由就是<code>/hello/world</code>。示例代码默认为空，表示根路由<code>/</code></p><h4 id="app-service-ts"><a class="header-anchor" href="#app-service-ts" aria-hidden="true">#</a> app.service.ts</h4><p>App 模块的服务层代码，主要用于处理业务逻辑，对应 MVC 中的 M 层</p><div class="language-ts"><pre><code><span class="token decorator"><span class="token at operator">@</span><span class="token function">Injectable</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">AppService</span> <span class="token punctuation">{</span>\n  <span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">&#39;Hello World!&#39;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p><code>@Injectable</code> 装饰器将 AppService 声明为提供者</p><p>getHello 方法，返回字符串<code>Hello, World!</code>，在控制器 AppController 调用此方法，最终这个字符串返回给到浏览器。</p><h3 id="运行项目"><a class="header-anchor" href="#运行项目" aria-hidden="true">#</a> 运行项目</h3><p>此时，我们通过<code>npm run start</code>启动项目，在浏览器中输入 <code>localhost:3000</code> 如下：</p><p><img src="/blog/_assets/nest-origin-start.d818340f.png" alt="nest-origin-start"></p><p>我们可以试着修改 AppController 中，添加不同的路由：</p><div class="language-ts"><pre><code><span class="token comment">// app.controller.ts</span>\n<span class="token decorator"><span class="token at operator">@</span><span class="token function">Controller</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">AppController</span> <span class="token punctuation">{</span>\n  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token keyword">private</span> <span class="token keyword">readonly</span> appService<span class="token operator">:</span> AppService<span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n\n  <span class="token decorator"><span class="token at operator">@</span><span class="token function">Get</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>appService<span class="token punctuation">.</span><span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n  <span class="token decorator"><span class="token at operator">@</span><span class="token function">Get</span></span><span class="token punctuation">(</span><span class="token string">&#39;/random&#39;</span><span class="token punctuation">)</span>\n  <span class="token function">getNum</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">number</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>appService<span class="token punctuation">.</span><span class="token function">getNum</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><div class="language-ts"><pre><code><span class="token comment">// app.service.ts</span>\n<span class="token decorator"><span class="token at operator">@</span><span class="token function">Injectable</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">AppService</span> <span class="token punctuation">{</span>\n  <span class="token function">getHello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">&#39;Hello World!&#39;</span>\n  <span class="token punctuation">}</span>\n  <span class="token function">getNum</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">number</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">10</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>此时需要重新运行项目（更新不会立即生效，需要更新立即生效时使用<code>npm run start:dev</code>启动项目）</p><p>再次访问<code>localhost:3000/random</code>，如下</p><p><img src="/blog/_assets/nest-watch-start.079a3f4c.png" alt="nest-watch-start"></p><h2 id="nest-构建-crud-项目"><a class="header-anchor" href="#nest-构建-crud-项目" aria-hidden="true">#</a> Nest 构建 CRUD 项目</h2><p>通过一个基础的 CRUD 项目来了解 Nest 的核心原理。</p><h2 id="nest-实现五种-http-数据传输方式"><a class="header-anchor" href="#nest-实现五种-http-数据传输方式" aria-hidden="true">#</a> Nest 实现五种 HTTP 数据传输方式</h2><p>通过 <code>generate</code> 来快速创建 crud 模版代码：</p><div class="language-bash"><pre><code>nest generate resource person\n</code></pre></div><p><img src="/blog/_assets/nest-generate-resource.3582faa8.png" alt="nest-generate-resource"></p><p>接着执行 <code>npm run start:dev</code> 来启动项目，一个简单的 crud 项目就启动了，在控制台打印中可以看到有这些接口可以使用：</p><p><img src="/blog/_assets/nest-crud-interface.73b916cf.png" alt="nest-crud-interface"></p><p>get 请求我们可以直接在浏览器中进行测试：</p><p><img src="/blog/_assets/nest-curd-get.ccb7cb4e.png" alt="nest-curd-get"></p><p><strong>访问静态资源</strong></p><p>如果想访问静态资源，需要在 main.ts 中进行设置</p><div class="language-ts"><pre><code><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">bootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token keyword">await</span> NestFactory<span class="token punctuation">.</span><span class="token generic-function"><span class="token function">create</span><span class="token generic class-name"><span class="token operator">&lt;</span>NestExpressApplication<span class="token operator">&gt;</span></span></span><span class="token punctuation">(</span>AppModule<span class="token punctuation">)</span>\n  app<span class="token punctuation">.</span><span class="token function">useStaticAssets</span><span class="token punctuation">(</span><span class="token string">&#39;public&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> prefix<span class="token operator">:</span> <span class="token string">&#39;/static&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token keyword">await</span> app<span class="token punctuation">.</span><span class="token function">listen</span><span class="token punctuation">(</span><span class="token number">3000</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token function">bootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>接着在静态文件目录 public 下添加 index.html 文件，访问 <code>http://localhost:3000/static/index.html</code> 如下：</p><p><img src="/blog/_assets/nest-static-html.50fa01e5.png" alt="nest-static-html"></p><h3 id="url-param"><a class="header-anchor" href="#url-param" aria-hidden="true">#</a> url param</h3><p>url param 就是将 url 直接写在 url 上，比如 <code>http://localhost:3000/api/person/12</code>，其中 <code>12</code> 就是路径中的参数（url param）</p><p>在 Nest 中通过 <code>@Get(&#39;:id&#39;)</code> 和 <code>@Param(&#39;id&#39;)</code> 配合拿到它。</p><p>如上面创建的<code>person</code>模块中：</p><div class="language-ts"><pre><code><span class="token decorator"><span class="token at operator">@</span><span class="token function">Get</span></span><span class="token punctuation">(</span><span class="token string">&#39;:id&#39;</span><span class="token punctuation">)</span>\n<span class="token function">findOne</span><span class="token punctuation">(</span><span class="token decorator"><span class="token at operator">@</span><span class="token function">Param</span></span><span class="token punctuation">(</span><span class="token string">&#39;id&#39;</span><span class="token punctuation">)</span> id<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received id: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>id<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>\n  <span class="token comment">// return this.personService.findOne(+id);</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>此时我们在浏览器地址栏直接输入 <code>http://localhost:3000/api/person/12</code>，便会得到以下结果： <img src="/blog/_assets/url-param-location.650118a9.png" alt="url-param-location"></p><p>或者在静态资源 <code>/public/index.html</code> 中通过 http 请求：</p><div class="language-js"><pre><code><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">urlParam</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> axios<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&#39;/api/person/1&#39;</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token function">urlParam</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>结果如下：</p><p><img src="/blog/_assets/url-param-http.7c628335.png" alt="url-param-http"></p><h3 id="query"><a class="header-anchor" href="#query" aria-hidden="true">#</a> query</h3><p>query 同样是通过 url 来传递参数，通过 url 中 ？后面的用 &amp; 分隔的字符串传递数据，比如 <code>http://localhost:3000/api/person/find?name=li&amp;age=12</code>。</p><p>在 Nest 中通过 <code>@Query()</code> 可以获取到传递的参数。</p><div class="language-js"><pre><code>@<span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&#39;find&#39;</span><span class="token punctuation">)</span>\n<span class="token function">find</span><span class="token punctuation">(</span>@<span class="token function">Query</span><span class="token punctuation">(</span><span class="token string">&#39;name&#39;</span><span class="token punctuation">)</span> name<span class="token operator">:</span> string<span class="token punctuation">,</span> @<span class="token function">Query</span><span class="token punctuation">(</span><span class="token string">&#39;age&#39;</span><span class="token punctuation">)</span> age<span class="token operator">:</span> number<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received: name=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>name<span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">,age=</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>age<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n@<span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&#39;:id&#39;</span><span class="token punctuation">)</span>\n<span class="token function">findOne</span><span class="token punctuation">(</span>@<span class="token function">Param</span><span class="token punctuation">(</span><span class="token string">&#39;id&#39;</span><span class="token punctuation">)</span> id<span class="token operator">:</span> string<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received id: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>id<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>注意，我们新添加的 <code>find</code> 路由要放到 <code>:id</code> 路由的前面，因为 Nest 是从上往下匹配的，如果放在后面，那匹配的就是 <code>:id</code> 的路由。</p><p>此时我们可以直接通过 url 访问 <code>http://localhost:3000/api/person/find?name=li&amp;age=12</code> 或者构造 http 请求：</p><div class="language-js"><pre><code><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">query</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> axios<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&#39;/api/person/find&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">params</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n      <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;li&#39;</span><span class="token punctuation">,</span>\n      <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token function">query</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>结果如下：</p><p><img src="/blog/_assets/url-query-http.57b719a7.png" alt="url-query-http"></p><h3 id="form-urlencoded"><a class="header-anchor" href="#form-urlencoded" aria-hidden="true">#</a> form urlencoded</h3><p>前面两种都是 get 请求，将传递的参数存放在 url 中，而接下来的几种数据传输方式都是 post 请求，将传递的参数存放在 body 中。</p><p>form urlencoded 是通过表单提交数据，就是将 query 的数据放在 body 中发送 post 请求提交。</p><p>通过表单提交的数据，会以 <code>application/x-www-form-urlencoded</code> 的格式提交，Nest 中可以通过 <code>@Body()</code> 解析请求体，注入到 <code>dto</code> 中，<code>dto</code> 就是 data transfer object，即封装传输数据的对象。</p><div class="language-js"><pre><code><span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">CreatePersonDto</span> <span class="token punctuation">{</span>\n  <span class="token literal-property property">name</span><span class="token operator">:</span> string\n  <span class="token literal-property property">age</span><span class="token operator">:</span> number\n<span class="token punctuation">}</span>\n</code></pre></div><div class="language-js"><pre><code>@<span class="token function">Post</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token function">body</span><span class="token punctuation">(</span><span class="token parameter">@<span class="token function">Body</span><span class="token punctuation">(</span><span class="token punctuation">)</span> createPersonDto<span class="token operator">:</span> CreatePersonDto</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>createPersonDto<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>构造 http 请求：</p><div class="language-js"><pre><code><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">formUrlEncoded</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> axios<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span>\n    <span class="token string">&#39;/api/person&#39;</span><span class="token punctuation">,</span>\n    Qs<span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n      <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;li&#39;</span><span class="token punctuation">,</span>\n      <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n    <span class="token punctuation">{</span>\n      <span class="token literal-property property">headers</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&#39;content-type&#39;</span><span class="token operator">:</span> <span class="token string">&#39;application/x-www-form-urlencoded&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token function">formUrlEncoded</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>结果如下：</p><p><img src="/blog/_assets/form-urlencoded-http.29460180.png" alt="form-urlencoded-http"></p><h3 id="form-data"><a class="header-anchor" href="#form-data" aria-hidden="true">#</a> form data</h3><p>form data 大多用于传输文件，axios 中需要指定 content type 为 <code>multipart/form-data</code>，并且用 FormData 对象来封装传输的内容。</p><p>Nest 中要使用 <code>FilesInterceptor</code> 来处理其中的 binary 字段，用 <code>@UseInterceptors</code> 装饰器启用，配置 <code>dest</code> 为上传文件的目录，然后通过 <code>@UploadedFiles</code> 来读取，其余非文件字段用 <code>@Body</code> 来读取。</p><div class="language-js"><pre><code>@<span class="token function">Post</span><span class="token punctuation">(</span><span class="token string">&#39;file&#39;</span><span class="token punctuation">)</span>\n@<span class="token function">UseInterceptors</span><span class="token punctuation">(</span><span class="token function">AnyFilesInterceptor</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n  <span class="token literal-property property">dest</span><span class="token operator">:</span> <span class="token string">&#39;uploads/&#39;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token function">body2</span><span class="token punctuation">(</span><span class="token parameter">@<span class="token function">Body</span><span class="token punctuation">(</span><span class="token punctuation">)</span> createPersonDto<span class="token operator">:</span> CreatePersonDto<span class="token punctuation">,</span> @<span class="token function">UploadedFiles</span><span class="token punctuation">(</span><span class="token punctuation">)</span> files<span class="token operator">:</span> Array<span class="token operator">&lt;</span>Express<span class="token punctuation">.</span>Multer<span class="token punctuation">.</span>File<span class="token operator">&gt;</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>createPersonDto<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>构造 http 请求：</p><div class="language-html"><pre><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>fileInput<span class="token punctuation">&quot;</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>file<span class="token punctuation">&quot;</span></span> <span class="token attr-name">multiple</span> <span class="token punctuation">/&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">\n  <span class="token keyword">const</span> fileInput <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">&#39;#fileInput&#39;</span><span class="token punctuation">)</span>\n\n  <span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">formData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FormData</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n    data<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&#39;name&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;li&#39;</span><span class="token punctuation">)</span>\n    data<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&#39;age&#39;</span><span class="token punctuation">,</span> <span class="token number">12</span><span class="token punctuation">)</span>\n    data<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&#39;file1&#39;</span><span class="token punctuation">,</span> fileInput<span class="token punctuation">.</span>files<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">)</span>\n    data<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&#39;file2&#39;</span><span class="token punctuation">,</span> fileInput<span class="token punctuation">.</span>files<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span>\n\n    <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> axios<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span><span class="token string">&#39;/api/person/file&#39;</span><span class="token punctuation">,</span> data<span class="token punctuation">,</span> <span class="token punctuation">{</span>\n      <span class="token literal-property property">headers</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&#39;content-type&#39;</span><span class="token operator">:</span> <span class="token string">&#39;multipart/form-data&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n\n  fileInput<span class="token punctuation">.</span>onchange <span class="token operator">=</span> formData\n</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>\n</code></pre></div><p>结果如下：</p><p><img src="/blog/_assets/form-data-http.0311cc16.png" alt="form-data-http"></p><p>服务端成功接收到我们上传的文件，并且保存在配置的 <code>dest</code> 目录中：</p><p><img src="/blog/_assets/form-data-dest.b3fd8d03.png" alt="form-data-dest"></p><h3 id="json"><a class="header-anchor" href="#json" aria-hidden="true">#</a> json</h3><p>json 格式应该是最为常用的了，直接将 json 数据作为请求体发送，Nest 中通过 <code>@Body()</code> 来解析请求体，注入到 <code>dto</code> 中。</p><p>form urlencoded 和 json 都是从 body 取值，Nest 内部会根据 content type 做区分，使用不同的解析方式。</p><div class="language-js"><pre><code>@<span class="token function">Post</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token function">body</span><span class="token punctuation">(</span><span class="token parameter">@<span class="token function">Body</span><span class="token punctuation">(</span><span class="token punctuation">)</span> createPersonDto<span class="token operator">:</span> CreatePersonDto</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">received: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span><span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>createPersonDto<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">`</span></span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>构造 http 请求：</p><div class="language-js"><pre><code><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> res <span class="token operator">=</span> <span class="token keyword">await</span> axios<span class="token punctuation">.</span><span class="token function">post</span><span class="token punctuation">(</span><span class="token string">&#39;/api/person&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;li&#39;</span><span class="token punctuation">,</span>\n    <span class="token literal-property property">age</span><span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>结果如下：</p><p><img src="/blog/_assets/json-http.b8446ff5.png" alt="json-http"></p><p>这 5 种 http 的传输数据的方式覆盖了绝大多数开发场景，如果你想进阶全栈，理解这 5 种接口是首先要做到的。</p><h2 id="nest-基础"><a class="header-anchor" href="#nest-基础" aria-hidden="true">#</a> Nest 基础</h2>',123)];p.render=function(a,t,p,e,c,l){return n(),s("div",null,o)};export{t as __pageData,p as default};