---
date: 2022-9-5
title: 不同字体类型对网页加载速度的影响
tags:
  - work
  - javascript
describe: 记一次调整字体加载速度的过程
---

### 字体格式

- TTF(TrueType Font)
  后缀为`.ttf`
  优点：兼容性好
  缺点：文件一般很大
- OTF(OpenType Font)
  后缀为`.otf`，也叫 Type 2 字体
  优点：
  1. 跨平台能力增强
  2. 生成文件尺寸更小
- WOFF(Web Open Font Format)
  后缀为`.woff`，是一种网页所采用的字体格式标准，2009年提出<br />
  字体格式使用zlib压缩，文件一般比TTF格式小40%
- WOFF2
  后缀为`.woff2`，在woff基础上进一步压缩体积

总结

- TTF 的兼容性更好，但是其字体文件体积最大
- WOFF 字体比 TTF 字体有更小的体积和更好的表现性
- WOFF2 字体是对 WOFF 字体的升级

### 如何提高网页字体加载速度

1. 使用正确的字体([在线TTF转WOFF](https://www.aconvert.com/cn/image/ttf-to-woff/)、[WOFF转换器](https://convertio.co/zh/woff-converter/))

   默认情况下，Woff 已经被压缩，这也是它比所有其他格式更快、更好的部分原因，并且所有现代浏览器都支持它。
   Woff2 是 woff 格式的更快更好的版本，但 Internet Explorer 不支持它。

2. 使用预加载[参考](https://wang1xiang.github.io/blog/docs/javascript/preload-prefetch.html)

   ```html
   <link rel="preload" as="font" type="font/woff2" href="fonts/Sacramento-Regular.woff2" crossorigin="anonymous">
   ```

   as="font" type="font/woff2" 属性要求浏览器将此资源作为字体下载，crossorigin很重要，如果没有此属性，浏览器会忽略预加载的字体，并且会重新获取

   在webpack项目中，可以使用[preload-webpack-plugin]([preload-webpack-plugin'](https://www.npmjs.com/package/@vue/preload-webpack-plugin))插件

   ```ts
   ...
   new PreloadWebpackPlugin({
      rel: 'preload',
      as(entry) {
        if (/.ttf$/.test(entry)) return 'font';
        if (/.otf$/.test(entry)) return 'font';
        if (/.woff$/.test(entry)) return 'font';
        return 'script';
      },
      include: 'allAssets', // asyncChunks加载异步脚本块 allChunks initial
      // fileBlacklist: [/.css|.js/, /.whatever/], // 资源黑名单
      fileWhitelist: [/.otf|.ttf|.woff|.woff2/] // 资源白名单
    }),
   ```

3. 使用正确的字体说明

   ```css
   @font-face {
     font-family: 'Sacramento';
     font-weight: normal;
     font-style: normal;
     src: url('../fonts/Sacramento-Regular.woff2') format('woff2'),url('../fonts/Sacramento-Regular.woff') format('woff');
     font-display: swap;/* Read next point 描述了字体在页面加载期间应该如何表现*/ 
     unicode-range: U+000-5FF;/* Download only latin glyphs */
   }
   ```

4. 避免字体加载过程中出现不可见文字

  使用js加载字体

  ```jsx
  // 优化字体加载 先判断浏览器是否已经加载过字体
   let isLoaded = false;
   for (let i of document.fonts.keys()) {
      if (i.family === 'Sacramento') {
         isLoaded = true;
         break;
      }
   }
   // 没有加载过在加载 已加载过就不再重复加载
   if (!isLoaded) {
      const font = new FontFace('Sacramento', 'url(/font/Sacramento-Regular.woff)');
      await font.load();
      document.fonts.add(font);
   }
  ```
