---
date: 2022-06-10
title: 优化字体加载速度
tags:
  - work
describe: 字体加载速度太慢，影响客户使用怎么整
---


1. 使用正确的字体

   默认情况下，Woff 已经被压缩，这也是它比所有其他格式更快、更好的部分原因，并且所有现代浏览器都支持它。
   Woff2 是 woff 格式的更快更好的版本，但 Internet Explorer 不支持它。
2. 使用预加载

   ```html
   <link rel="preload" as="font" type="font/woff2" href="fonts/Sacramento-Regular.woff2" crossorigin="anonymous">
   ```

   as="font" type="font/woff2" 属性要求浏览器将此资源作为字体下载，crossorigin很重要，如果没有此属性，浏览器会忽略预加载的字体，并且会重新获取
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
  const font = new FontFace('Sacramento', 'url(/font/Sacramento-Regular.woff)');
  await font.load();
  document.fonts.add(font);
  ```
