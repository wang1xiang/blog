import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"grid布局","frontmatter":{"date":"2022-07-26","title":"grid布局","tags":["css"],"describe":"grid学习笔记及demo演示"},"headers":[{"level":2,"title":"概述","slug":"概述"},{"level":3,"title":"名词解释","slug":"名词解释"}],"relativePath":"docs/css/grid.md","lastUpdated":1714980859892.4421}';var p={};const o=[a('<h2 id="概述"><a class="header-anchor" href="#概述" aria-hidden="true">#</a> 概述</h2><p>Grid 布局是目前最强大的布局工具，将网页划分为一个个网格，可以任意组合，达到各种布局效果</p><p>与 Flex 布局区别：Flex 是一维布局，只能在设置的轴线上进行布局；而 Grid 是二维布局，将容器划给为行和列，产生单元格</p><p>使用网格布局，兄弟节点可以被指定布局到网格的某个位置。 所以，网格布局相对流布局 Flex 布局更加的灵活，当然学习和使用也更加复杂。这篇文章会把网格布局中的概念和属性整理出来。 下图就是展示了一维布局和二维布局的不同。可以看出，如果布局复杂，一维布局需要增加节点来解决；而二维布局，则不需要，这也是网格布局强大而复杂的原因。</p><p><img src="/blog/_assets/grid-png.dd3614da.png" alt="grid-png"></p><h3 id="名词解释"><a class="header-anchor" href="#名词解释" aria-hidden="true">#</a> 名词解释</h3><ol><li>容器 container：设置<code>display: grid</code>的元素称为容器</li><li>项目 item：内部的子元素称为项目</li><li>行 row：容器中的水平区域</li><li>列 column：容器中的垂直区域</li><li>单元格 cell：行和列的交叉点，n 行 m 列将产生 n * m 个单元格</li><li>网格线 grid line：划分网格的线，n 行有 n + 1 根水平网格线，m 列有 m + 1 根垂直网格线</li></ol><h4 id="属性"><a class="header-anchor" href="#属性" aria-hidden="true">#</a> 属性</h4><p>属性分为容器属性和项目属性</p><h5 id="容器属性"><a class="header-anchor" href="#容器属性" aria-hidden="true">#</a> 容器属性</h5><ol><li><p>display</p><p>通过设置<code>display: grid</code>或<code>display: inline-grid</code>生成一个网格容器</p></li><li><p>grid-template-rows/grid-template-columns</p><p>划分行和列，既可以用绝对宽度也可以用百分比，下面代码将 div 划分为 200px3 行 33%高度的容器</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-rows</span><span class="token punctuation">:</span> 200px 200px 200px<span class="token punctuation">;</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> 33% 33% 33%<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><ul><li><p>可以使用 repeat 简化代码</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>3<span class="token punctuation">,</span> 200px<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token property">grid-template-rows</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>3<span class="token punctuation">,</span> 33.33%<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>auto-fill 属性，当单元格大小固定，容器大小不固定时，希望每行/每列容纳尽可能多的单元格，使用 auto-fill 属性自动填充</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>auto-fill<span class="token punctuation">,</span> 200px<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>fr 比例：方便表示比例关系，如列宽 1fr 2fr 就代表后者是前者的两倍</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> 1fr 2fr<span class="token punctuation">;</span>\n  <span class="token comment">/* 可以与绝对长度结合 */</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> 150px 1fr 2fr<span class="token punctuation">;</span>\n  <span class="token comment">/* 传统的栅格布局可以使用fr轻松实现  */</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>12<span class="token punctuation">,</span> 1fr<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>minmax()产生长度范围，表示长度在此范围内</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token comment">/* 列宽不小于100px，不大于1fr */</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> 1fr 1fr <span class="token function">minmax</span><span class="token punctuation">(</span>100px<span class="token punctuation">,</span> 1fr<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>auto 由浏览器自动决定长度</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> 100px auto 100px<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li></ul></li><li><p>grid-row-gap/grid-column-gap、grid-gap</p><p>行/列间隔</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-row-gap</span><span class="token punctuation">:</span> 20px<span class="token punctuation">;</span>\n  <span class="token property">grid-row-gap</span><span class="token punctuation">:</span> 20px<span class="token punctuation">;</span>\n  <span class="token comment">/* 相当于  */</span>\n  <span class="token property">grid-column</span><span class="token punctuation">:</span> 20px 20px<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>grid-template-areas</p><p>用于定义区域</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">grid-template-areas</span><span class="token punctuation">:</span>\n    <span class="token string">&#39;header header header&#39;</span>\n    <span class="token string">&#39;main main sidebar&#39;</span>\n    <span class="token string">&#39;footer footer footer&#39;</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>grid-auto-flow</p><p>容器内元素的摆放顺序，默认先行后列，可以使用<code>grid-auto-flow: column;</code>调整为先列后行</p><div class="language-javascript"><pre><code><span class="token comment">// 先行后列渲染结果如下所示</span>\n<span class="token number">1</span> <span class="token number">2</span> <span class="token number">3</span>\n<span class="token number">4</span> <span class="token number">5</span> <span class="token number">6</span>\n<span class="token number">7</span> <span class="token number">8</span> <span class="token number">9</span>\n<span class="token comment">// 先列后行渲染结果如下所示</span>\n<span class="token number">1</span> <span class="token number">4</span> <span class="token number">7</span>\n<span class="token number">2</span> <span class="token number">5</span> <span class="token number">8</span>\n<span class="token number">3</span> <span class="token number">6</span> <span class="token number">9</span>\n</code></pre></div></li><li><p>justify-items/align-items、place-items</p><p>justify-items/align-items 用于设置单元格内容的水平位置</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">justify-items</span><span class="token punctuation">:</span> start<span class="token punctuation">;</span>\n  <span class="token property">align-items</span><span class="token punctuation">:</span> start<span class="token punctuation">;</span>\n  <span class="token comment">/*相当于  */</span>\n  <span class="token property">place-items</span><span class="token punctuation">:</span> start start<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>justify-content/align-content、place-content</p><p>定义整个内容区域在容器内的水平位置</p><div class="language-css"><pre><code><span class="token selector">.container</span> <span class="token punctuation">{</span>\n  <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n  <span class="token property">justify-content</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n  <span class="token property">align-content</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n  <span class="token comment">/* 相当于 */</span>\n  <span class="token property">place-content</span><span class="token punctuation">:</span> center center<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li></ol><h5 id="项目属性"><a class="header-anchor" href="#项目属性" aria-hidden="true">#</a> 项目属性</h5><ol><li><p>grid-column-start/grid-column-end/grid-row-start/grid-row-end</p><p>项目的位置可以指定</p><div class="language-"><pre><code> grid-column-start属性：左边框所在的垂直网格线\n grid-column-end属性：右边框所在的垂直网格线\n grid-row-start属性：上边框所在的水平网格线\n grid-row-end属性：下边框所在的水平网格线\n</code></pre></div><div class="language-css"><pre><code><span class="token selector">.item-1</span> <span class="token punctuation">{</span>\n  <span class="token property">grid-column-start</span><span class="token punctuation">:</span> 1<span class="token punctuation">;</span>\n  <span class="token property">grid-column-end</span><span class="token punctuation">:</span> 3<span class="token punctuation">;</span>\n  <span class="token property">grid-row-start</span><span class="token punctuation">:</span> 2<span class="token punctuation">;</span>\n  <span class="token property">grid-row-end</span><span class="token punctuation">:</span> 4<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li><li><p>justify-self/align-self</p><p>设置单元格内容的水平/垂直位置，跟 justify-items/align-items 属性的用法完全一致，但只作用于单个项目</p></li></ol><div class="language-html"><pre><code><span class="token doctype"><span class="token punctuation">&lt;!</span><span class="token doctype-tag">DOCTYPE</span> <span class="token name">html</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>html</span> <span class="token attr-name">lang</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>en<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>head</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>meta</span> <span class="token attr-name">charset</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>UTF-8<span class="token punctuation">&quot;</span></span> <span class="token punctuation">/&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>meta</span> <span class="token attr-name">http-equiv</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>X-UA-Compatible<span class="token punctuation">&quot;</span></span> <span class="token attr-name">content</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>IE=edge<span class="token punctuation">&quot;</span></span> <span class="token punctuation">/&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>meta</span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>viewport<span class="token punctuation">&quot;</span></span> <span class="token attr-name">content</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>width=device-width, initial-scale=1.0<span class="token punctuation">&quot;</span></span> <span class="token punctuation">/&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>title</span><span class="token punctuation">&gt;</span></span>Document<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>title</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>style</span><span class="token punctuation">&gt;</span></span><span class="token style"><span class="token language-css">\n      <span class="token selector">.container</span> <span class="token punctuation">{</span>\n        <span class="token property">margin</span><span class="token punctuation">:</span> 60px<span class="token punctuation">;</span>\n        <span class="token property">display</span><span class="token punctuation">:</span> grid<span class="token punctuation">;</span>\n        <span class="token property">grid-template-rows</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>3<span class="token punctuation">,</span> 200px<span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token property">grid-template-columns</span><span class="token punctuation">:</span> <span class="token function">repeat</span><span class="token punctuation">(</span>3<span class="token punctuation">,</span> 200px<span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token comment">/* 列宽度确定 自动布局 */</span>\n        <span class="token comment">/* grid-template-columns: repeat(auto-fill, 200px); */</span>\n        <span class="token comment">/* 行高 1 150 2 300 3 450 */</span>\n        <span class="token comment">/* grid-template-rows: 180px 1fr 2fr; */</span>\n        <span class="token property">grid-gap</span><span class="token punctuation">:</span> 20px<span class="token punctuation">;</span>\n        <span class="token property">justify-items</span><span class="token punctuation">:</span> start<span class="token punctuation">;</span>\n        <span class="token property">align-items</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n        <span class="token property">justify-content</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.item</span> <span class="token punctuation">{</span>\n        <span class="token property">text-align</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n        <span class="token property">font-size</span><span class="token punctuation">:</span> 200%<span class="token punctuation">;</span>\n        <span class="token property">color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span>\n        <span class="token property">width</span><span class="token punctuation">:</span> 80%<span class="token punctuation">;</span>\n        <span class="token property">height</span><span class="token punctuation">:</span> 80%<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.one</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #b8e8e0<span class="token punctuation">;</span>\n        <span class="token property">justify-self</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n        <span class="token property">align-self</span><span class="token punctuation">:</span> center<span class="token punctuation">;</span>\n        <span class="token property">grid-column-start</span><span class="token punctuation">:</span> 1<span class="token punctuation">;</span>\n        <span class="token property">grid-column-end</span><span class="token punctuation">:</span> 3<span class="token punctuation">;</span>\n        <span class="token property">grid-row-start</span><span class="token punctuation">:</span> 2<span class="token punctuation">;</span>\n        <span class="token property">grid-row-end</span><span class="token punctuation">:</span> 4<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.two</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #8cc7b5<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.three</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #efe3bf<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.four</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #bee7e9<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.five</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #e6ceac<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n\n      <span class="token selector">.six</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #e7d7d9<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n      <span class="token selector">.seven</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #aa53975c<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n      <span class="token selector">.eight</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #bde6b8<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n      <span class="token selector">.nine</span> <span class="token punctuation">{</span>\n        <span class="token property">background-color</span><span class="token punctuation">:</span> #e6c1b8<span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>style</span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>head</span><span class="token punctuation">&gt;</span></span>\n\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>container<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>one item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>1<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>two item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>2<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>three item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>3<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>four item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>4<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>five item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>5<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>six item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>6<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>seven item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>7<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>eight item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>8<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>nine item<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>9<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>\n  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>html</span><span class="token punctuation">&gt;</span></span>\n</code></pre></div><p><img src="/blog/_assets/grid.dc8933bd.jpg" alt="grid"></p>',15)];p.render=function(a,t,p,c,e,l){return n(),s("div",null,o)};export{t as __pageData,p as default};