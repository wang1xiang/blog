import{f as a,g as s,J as n}from"./common-03e46d7f.js";const t='{"title":"通过css自定义placeholder","frontmatter":{"date":"2022-08-01","title":"通过css自定义placeholder","tags":["css"],"describe":"利用伪元素特性，使用css属性实现placeholder"},"headers":[{"level":2,"title":"可以利用伪元素结合css attr()函数来实现","slug":"可以利用伪元素结合css-attr-函数来实现"}],"relativePath":"docs/css/placeholder.md","lastUpdated":1670987452797.791}';var e={};const p=[n('<p>我们都知道placeholder属性只有在input标签（且类型为text、search、url、tel、email 和 password）中才会展示，那么如何在设置了<code>contentEditable=true</code>的div标签中如何展示placeholder呢？<br></p><div class="language-html"><pre><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>App<span class="token punctuation">&quot;</span></span> <span class="token attr-name">placeholder</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>在这里输入<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>;\n</code></pre></div><h2 id="可以利用伪元素结合css-attr-函数来实现"><a class="header-anchor" href="#可以利用伪元素结合css-attr-函数来实现" aria-hidden="true">#</a> 可以利用伪元素结合<a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/attr" target="_blank" rel="noopener noreferrer">css attr()函数</a>来实现</h2><p>需要在指定元素上设置placeholder属性</p><div class="language-css"><pre><code><span class="token selector">.App:empty:before</span> <span class="token punctuation">{</span>\n  <span class="token property">content</span><span class="token punctuation">:</span> <span class="token function">attr</span><span class="token punctuation">(</span>placeholder<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token property">color</span><span class="token punctuation">:</span> <span class="token function">rbga</span><span class="token punctuation">(</span>0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0.45<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p><img src="/blog/_assets/placeholder.248b54de.jpg" alt="placeholder"></p><p><a href="https://codesandbox.io/s/late-fast-l20yqn?file=/src/App.js:65-113" target="_blank" rel="noopener noreferrer">演示地址</a></p>',7)];e.render=function(n,t,e,o,c,l){return a(),s("div",null,p)};export{t as __pageData,e as default};