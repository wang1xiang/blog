import{f as n,g as s,J as a}from"./common-03e46d7f.js";const t='{"title":"如何在富文本编辑器中统计字数","frontmatter":{"date":"2023-03-09","title":"如何在富文本编辑器中统计字数","tags":["work","prosemirror"],"describe":"为tiptap富文本编辑器统计文档字数"},"headers":[{"level":2,"title":"调研对象","slug":"调研对象"},{"level":3,"title":"wangEditor","slug":"wangeditor"},{"level":3,"title":"tinyMCE","slug":"tinymce"},{"level":3,"title":"ckeditor","slug":"ckeditor"},{"level":3,"title":"飞书文档","slug":"飞书文档"},{"level":3,"title":"钉钉文档","slug":"钉钉文档"},{"level":3,"title":"石墨文档","slug":"石墨文档"},{"level":3,"title":"语雀文档","slug":"语雀文档"},{"level":3,"title":"腾讯文档","slug":"腾讯文档"},{"level":3,"title":"企业微信文档","slug":"企业微信文档"},{"level":2,"title":"思路","slug":"思路"},{"level":2,"title":"实现","slug":"实现"}],"relativePath":"docs/work/richeditor.md","lastUpdated":1679280055725.6304}';var e={};const p=[a('<h2 id="调研对象"><a class="header-anchor" href="#调研对象" aria-hidden="true">#</a> 调研对象</h2><p>首先收集一下其他文档的字数统计规则：</p><h3 id="wangeditor"><a class="header-anchor" href="#wangeditor" aria-hidden="true">#</a> <a href="https://www.wangeditor.com/demo/" target="_blank" rel="noopener noreferrer">wangEditor</a></h3><ul><li>数字 一个单位长度</li><li>中文 一个单位长度</li><li>中文符号 一个单位长度</li><li>英文单词 每个字母算一个单位长度</li><li>英文符号 一个单位长度</li><li>空格 一个单位长度</li></ul><p>即只要键盘输入就算一个单位长度，不区分符号、单词、中英文是否连续等</p><h3 id="tinymce"><a class="header-anchor" href="#tinymce" aria-hidden="true">#</a> <a href="https://www.tiny.cloud/docs/demo/full-featured/" target="_blank" rel="noopener noreferrer">tinyMCE</a></h3><ul><li>数字 连续数字算一个单位长度，以空格隔开算</li><li>中文 一个单位长度</li><li>中文符号 不统计</li><li>英文单词 每个单词算一个单位长度，以空格隔开算</li><li>英文符号 不统计</li><li>空格 不统计</li></ul><p>即只统计文字（连续的英文或数字），不统计符号、空格等</p><h3 id="ckeditor"><a class="header-anchor" href="#ckeditor" aria-hidden="true">#</a> <a href="https://ckeditor.com/ckeditor-5/demo/feature-rich/" target="_blank" rel="noopener noreferrer">ckeditor</a></h3><ul><li>统计字符数：同 wangEditor 的计算方式</li><li>统计字数：不计算符号，输入以空格区分计算字数</li></ul><h3 id="飞书文档"><a class="header-anchor" href="#飞书文档" aria-hidden="true">#</a> 飞书文档</h3><ul><li>统计字符数：不算符号的所有输入</li><li>统计字数：中文（不包括符号）以个数计算，英文、数字等以空格计算</li></ul><h3 id="钉钉文档"><a class="header-anchor" href="#钉钉文档" aria-hidden="true">#</a> 钉钉文档</h3><p>统计字数：英文符号、空格不计算，中文和中文符号以个数计算，英文、数字等以空格计算</p><h3 id="石墨文档"><a class="header-anchor" href="#石墨文档" aria-hidden="true">#</a> 石墨文档</h3><ul><li>统计字符数：除空格所有输入</li><li>统计不计空格字符数：所有输入</li><li>统计字数：规则同钉钉文档</li></ul><h3 id="语雀文档"><a class="header-anchor" href="#语雀文档" aria-hidden="true">#</a> 语雀文档</h3><p>只统计字数：规则同钉钉文档</p><h3 id="腾讯文档"><a class="header-anchor" href="#腾讯文档" aria-hidden="true">#</a> 腾讯文档</h3><ul><li>统计字数：规则同钉钉文档</li><li>统计不计标点字数：除去标点之后的字数</li><li>统计字符数：规则同石墨文档</li><li>统计不计空格字符数：规则同石墨文档</li></ul><h3 id="企业微信文档"><a class="header-anchor" href="#企业微信文档" aria-hidden="true">#</a> 企业微信文档</h3><ul><li>统计字数：规则同钉钉文档</li><li>统计不计标点字数：除去标点之后的字数</li><li>统计字符数：规则同石墨文档</li><li>统计不计空格字符数：规则同石墨文档</li></ul><p>通过统计，可以看到基本都是按照钉钉文档的规则来，即英文符号、空格不计算，中文和中文符号以个数计算，英文、数字等以空格计算，那么我们也采用这种方式，接下来就是整理思路开始写代码了。</p><h2 id="思路"><a class="header-anchor" href="#思路" aria-hidden="true">#</a> 思路</h2><p>中文计算方式：中文的计算方式通常是按照字符数进行统计，每个中文字符都计为一个字。 英文计算方式：英文的计算方式通常是按照单词数进行统计，一般会将单词中间的空格作为分隔符，以此来确定单词的数量。</p><ol><li>获取富文本编辑器的文本，按照空格对文本进行分割；</li><li>分割完成后对于英文和其他，可以按照空格分隔单词进行计数，直接让数量加 1；</li><li>但对于中文，由于中文没有空格，因此需要对中文进行分词处理，例如使用中文分词工具将中文文本分成词语；</li><li>通过正则获取分词后中文的个数，对数量进行累加操作。</li></ol><h2 id="实现"><a class="header-anchor" href="#实现" aria-hidden="true">#</a> 实现</h2><p>tiptap 的插件中有<a href="https://tiptap.dev/api/extensions/character-count" target="_blank" rel="noopener noreferrer">character-count</a>用于统计字符数和单词数，并允许设置文档最大长度。</p><p>将插件添加到项目中后，通过下面这行代码就可以拿到文档的单词数：</p><div class="language-js"><pre><code>editor<span class="token punctuation">.</span>storage<span class="token punctuation">.</span>characterCount<span class="token punctuation">.</span><span class="token function">words</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>but, 通过这个插件拿到的单词数是根据空格分割的单词数量，即一串中文也显示的是一个单词数，这明显不符合我们的调研结果。修改源码中计算单词的方法<code>words</code>为下面这个写法：</p><div class="language-js"><pre><code><span class="token comment">// 匹配中文 中文符号</span>\n<span class="token keyword">const</span> chineseSymbolPattern <span class="token operator">=</span>\n  <span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">[\\u4E00-\\u9FA5\\u3000-\\u303F\\uFF00-\\uFFEF\\u2000-\\u206F]</span><span class="token regex-delimiter">/</span><span class="token regex-flags">g</span></span>\n<span class="token keyword">const</span> <span class="token function-variable function">delZeroWidth</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">text</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span>\n  text<span class="token punctuation">.</span><span class="token function">replace</span><span class="token punctuation">(</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">[\\u200b-\\u200f\\uFEFF\\u202a-\\u202e]</span><span class="token regex-delimiter">/</span><span class="token regex-flags">g</span></span><span class="token punctuation">,</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> <span class="token function-variable function">countWords</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">text</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token comment">// 以空格分割</span>\n  <span class="token keyword">const</span> words <span class="token operator">=</span> text<span class="token punctuation">.</span><span class="token function">split</span><span class="token punctuation">(</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">\\s+</span><span class="token regex-delimiter">/</span></span><span class="token punctuation">)</span>\n  <span class="token keyword">let</span> count <span class="token operator">=</span> <span class="token number">0</span>\n  <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> words<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">delZeroWidth</span><span class="token punctuation">(</span>words<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span> <span class="token keyword">continue</span>\n    <span class="token comment">// 如果单词包含中文字符，则进行分词处理</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>chineseSymbolPattern<span class="token punctuation">.</span><span class="token function">test</span><span class="token punctuation">(</span>words<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">const</span> segments <span class="token operator">=</span> <span class="token function">segmentChinese</span><span class="token punctuation">(</span>words<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span>\n      segments<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">segment</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">delZeroWidth</span><span class="token punctuation">(</span>segment<span class="token punctuation">)</span> <span class="token operator">!==</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n          <span class="token comment">// 中文个数</span>\n          count <span class="token operator">+=</span> segment<span class="token punctuation">.</span><span class="token function">match</span><span class="token punctuation">(</span>chineseSymbolPattern<span class="token punctuation">)</span><span class="token operator">?.</span>length <span class="token operator">||</span> <span class="token number">0</span>\n          <span class="token comment">// 分割中文 拿到其余的个数 如hello你you好</span>\n          count <span class="token operator">+=</span> segment\n            <span class="token punctuation">.</span><span class="token function">split</span><span class="token punctuation">(</span>chineseSymbolPattern<span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">seg</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> seg <span class="token operator">!==</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span><span class="token operator">?.</span>length\n        <span class="token punctuation">}</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span>\n    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n      <span class="token comment">// 如果不是 则按照空格++</span>\n      count<span class="token operator">++</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span>\n  <span class="token keyword">return</span> count\n<span class="token punctuation">}</span>\n\n<span class="token comment">// 对中文文本进行分词处理</span>\n<span class="token keyword">const</span> <span class="token function-variable function">segmentChinese</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">text</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span>\n  text<span class="token punctuation">.</span><span class="token function">split</span><span class="token punctuation">(</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">([\\u4E00-\\u9FA5]+)</span><span class="token regex-delimiter">/</span></span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">seg</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> seg <span class="token operator">!==</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span>\n\n<span class="token comment">/** 计算文档字数 */</span>\n<span class="token keyword">const</span> <span class="token function-variable function">calcDocumentTextSize</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token literal-property property">text</span><span class="token operator">:</span> string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> number <span class="token operator">=</span> <span class="token function">countWords</span><span class="token punctuation">(</span>text<span class="token punctuation">)</span>\n  <span class="token keyword">return</span> number\n<span class="token punctuation">}</span>\n<span class="token keyword">export</span> <span class="token keyword">default</span> calcDocumentTextSize\n</code></pre></div><p>最后测试了一下，与钉钉文档的字数统计大部分情况下相同，有时候会有几个到几十个字的差异，目前还没有发现原因，不过不影响，因为钉钉可能做了某些特殊的处理。</p>',33)];e.render=function(a,t,e,o,l,c){return n(),s("div",null,p)};export{t as __pageData,e as default};