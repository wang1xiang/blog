import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"JavaScript内存泄漏调研","frontmatter":{"date":"2020-06-10","title":"JavaScript内存泄漏调研","tags":["javascript"],"describe":"内存泄露原因及v8垃圾回收机制"},"headers":[{"level":3,"title":"内存泄漏的产生","slug":"内存泄漏的产生"},{"level":3,"title":"js 的四种常见内存泄漏","slug":"js-的四种常见内存泄漏"},{"level":3,"title":"内存泄漏","slug":"内存泄漏"},{"level":3,"title":"垃圾回收机制","slug":"垃圾回收机制"}],"relativePath":"docs/javascript/memory-leak.md","lastUpdated":1670987452811.5293}';var p={};const o=[a('<h3 id="内存泄漏的产生"><a class="header-anchor" href="#内存泄漏的产生" aria-hidden="true">#</a> 内存泄漏的产生</h3><p>程序运行需要内存，内存生命周期：分配内存、使用内存、释放内存，如果不再使用的内存，没有及时释放，就会导致内存泄漏</p><h3 id="js-的四种常见内存泄漏"><a class="header-anchor" href="#js-的四种常见内存泄漏" aria-hidden="true">#</a> js 的四种常见内存泄漏</h3><ul><li><p>全局变量(Global Variables)</p><blockquote><p>js 处理未声明的变量：在全局对象内创建一个新变量</p></blockquote><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  bar <span class="token operator">=</span> <span class="token string">&#39;str&#39;</span>\n<span class="token punctuation">}</span>\n<span class="token comment">// 等价于</span>\n<span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  window<span class="token punctuation">.</span>bar <span class="token operator">=</span> <span class="token string">&#39;str&#39;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><blockquote><p>这里 bar 只是一个字符串，如果是一个大的对象，就会造成代码内存隐患 为了防止这种错误发生，可以使用严格模式(开头添加’use strict&#39;) 虽然可以预防全局变量的产生，但是仍然会有很多代码用显式的方式使用全局变量，这些变量无法进行垃圾回收，所以使用完对其赋值为 null 或重新分配</p></blockquote></li><li><p>被遗忘的 Timer 或 callback js 中经常使用 setInterval()来实现一些动画效果</p><div class="language-js"><pre><code><span class="token keyword">let</span> someResource <span class="token operator">=</span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">let</span> node <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&#39;Node&#39;</span><span class="token punctuation">)</span>\n    <span class="token keyword">if</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      node<span class="token punctuation">.</span>innerHTML <span class="token operator">=</span> <span class="token constant">JSON</span><span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>someResource<span class="token punctuation">)</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>\n</code></pre></div><blockquote><p>如果不需要 setInterval()时，没有通过 clearInterval()清除，就不不断调用函数，直到网页关闭或者遇到 clearInterval() EventListener 在组件中进行事件绑定，在销毁组件时未进行事件解绑</p></blockquote><div class="language-js"><pre><code>window<span class="token punctuation">.</span><span class="token function">addEventListener</span><span class="token punctuation">(</span><span class="token string">&#39;click&#39;</span><span class="token punctuation">,</span> onClick<span class="token punctuation">)</span>\nwindow<span class="token punctuation">.</span><span class="token function">removeEventListener</span><span class="token punctuation">(</span><span class="token string">&#39;click&#39;</span><span class="token punctuation">,</span> onClick<span class="token punctuation">)</span>\n</code></pre></div></li><li><p>闭包</p><p>当一个函数 A 返回另一个内联函数 B，即使函数 A 执行完，函数 B 也能访问函数 A 作用域内的变量，这就是闭包(函数内部和外部连接起来的一座桥梁)</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token parameter">message</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">function</span> <span class="token function">bar</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span>\n  <span class="token punctuation">}</span>\n  <span class="token keyword">return</span> bar\n<span class="token punctuation">}</span>\n\n<span class="token keyword">let</span> str <span class="token operator">=</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token string">&#39;closure&#39;</span><span class="token punctuation">)</span>\nstr <span class="token comment">// closure</span>\n</code></pre></div><blockquote><p>函数 foo 中创建的 bar 是不能被回收的，因为它被 str 引用，想要释放掉将 str=null 即可 闭包会携带包含它的函数的作用域，因此会比其他函数占用更多内存，过度使用可能会导致内存占用过多</p></blockquote></li><li><p>DOM 引用 假如想更新表中的几行数据，将每行 DOM 的引用存储在数组或对象中，当这种情况发生时，就会保留同一 DOM 元素的两份引用：一个 DOM 树中，一个数组或对象中，如果将来要删除这些行，需要将这里两个引用都设为不可达。并且如果想删除 table 时，因为单元格是 table 的子节点，保持着对 table 的引用，也就是说，js 中对单元格的引用会导致整个 table 都保存在内存中。</p><div class="language-js"><pre><code><span class="token keyword">let</span> elements <span class="token operator">=</span> <span class="token punctuation">{</span>\n  <span class="token literal-property property">td</span><span class="token operator">:</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&#39;td&#39;</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">function</span> <span class="token function">removeTable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  document<span class="token punctuation">.</span>body<span class="token punctuation">.</span><span class="token function">removeChild</span><span class="token punctuation">(</span>document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&#39;table&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n</code></pre></div></li></ul><h3 id="内存泄漏"><a class="header-anchor" href="#内存泄漏" aria-hidden="true">#</a> 内存泄漏</h3><ul><li>多页面程序不是问题 因为页面切换浏览器都会刷新，即使页面有内存泄漏，页面刷新后泄漏会解除</li><li>单页面应用 切换不会刷新，如果发生内存泄漏，轻则影响页面性能，重则导致页面崩溃</li></ul><h3 id="垃圾回收机制"><a class="header-anchor" href="#垃圾回收机制" aria-hidden="true">#</a> 垃圾回收机制</h3><ul><li><p>内存引用(垃圾回收机制依靠的主要概念就是引用)</p></li><li><p>内存管理中，如果前者对后者有访问权限(隐式或显示访问)，则说明一个对象引用另一个对象(js 对象有对其原型(隐式引用)和对其属性(显示引用)的引用)</p></li><li><p>两个策略：引用计数，标记清除(Mark-and-sweep)</p></li><li><p>引用对象算法简单理解为&#39;该对象有没有其他对象引用到它&#39;，即没有任何对象指向它，如果没有，该对象就会被垃圾回收机制回收</p><div class="language-js"><pre><code><span class="token keyword">let</span> o1 <span class="token operator">=</span> <span class="token punctuation">{</span>\n  <span class="token literal-property property">o2</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">x</span><span class="token operator">:</span> <span class="token number">1</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">let</span> o3 <span class="token operator">=</span> o1\no1 <span class="token operator">=</span> <span class="token number">1</span> <span class="token comment">// o1被o3引用</span>\n<span class="token keyword">let</span> o4 <span class="token operator">=</span> o3<span class="token punctuation">.</span>o2\no3 <span class="token operator">=</span> <span class="token string">&#39;123&#39;</span> <span class="token comment">// 引用数为0，可以被垃圾回收处理，o2还被o4引用</span>\no4 <span class="token operator">=</span> <span class="token keyword">null</span> <span class="token comment">//</span>\n</code></pre></div><blockquote><ul><li>缺陷：循环引用，指的是对象 A 中包含了一个指向对象 B 的引用，而对象 B 也包含一个指向对象 A 的引用，创建一个循环，由此发生内存泄漏</li></ul></blockquote><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">let</span> o1 <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n  <span class="token keyword">let</span> o2 <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n  o1<span class="token punctuation">.</span>p <span class="token operator">=</span> o2\n  o2<span class="token punctuation">.</span>p <span class="token operator">=</span> o1\n<span class="token punctuation">}</span>\n<span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token comment">// 函数被调用之后，o1、o2离开作用域，已经无用可以被回收，但是o2引用o1，o1引用o2，由此形成循环，引用计数法认为每个对象被引用了一次，所以不能被回收</span>\n</code></pre></div><blockquote><p><img src="https://raw.githubusercontent.com/tangxiaolang101/ImageHub/master/refrenceCycle.png" alt="avatar"></p></blockquote></li><li><p>标记清除：该算法把&#39;对象是否不在需要&#39;简化定义为&#39;对象是否可以可达&#39;</p><blockquote><p>1 该算法创建了一个‘roots’列表，roots 通常是代码中全局变量的引用，设置一个根 Root 的对象，javascript 中‘windows’是一个全局变量，被当作 root，垃圾回收检查它和它的子对象是否存在(即不是垃圾)<br> 2 定期的，垃圾回收会从根开始，递归的检查所有子对象，如果从 root 开始的对象时可达的，就不会被当作垃圾<br> 3 所有未被标记的内存会被当作垃圾，垃圾回收会释放内存 <img src="https://raw.githubusercontent.com/tangxiaolang101/ImageHub/master/markSweep.gif" alt="avatar"></p></blockquote></li><li><p>比较</p><blockquote><p>1 优于前一个，’一个对象零引用‘，所以这个对象必定不可达，反过来就不对，因为存在循环引用<br> 2 循环引用不再是问题，因为循环引用的对象没有被全局 window 对象可访问的对象引用</p></blockquote></li></ul><h4 id="内存泄漏检测"><a class="header-anchor" href="#内存泄漏检测" aria-hidden="true">#</a> 内存泄漏检测</h4><ul><li><p>Shallow Size &amp; Retained Size 对象通过两种方式占用内存</p><ul><li>直接通过对象自身占用</li><li>通过持有对其他对象的引用隐式占用<br></li></ul><blockquote><p>在 devTool 中堆内存快照分析面板 shallow size 和 retained size 分别表示这两种内存占用方式 Shallow Size 对象自身占用的内存，通常只有字符串和数组有明显的 Shallow size Retained Size 对象自身及依赖它的对象(从 GC root 无法再访问到的对象)被删除后释放的内存大小 堆快照中有一个 distance 字段，表示从 window 出发的最短保留路径上的属性引用数量</p></blockquote></li></ul>',10)];p.render=function(a,t,p,e,c,l){return n(),s("div",null,o)};export{t as __pageData,p as default};