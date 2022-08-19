---
date: 2022-8-2
title: React使用dangerouslySetInnerHTML渲染HTML片段
tags:
  - react
describe: 使用dangerouslySetInnerHTML渲染HTML片段时，需要通过dompurify对渲染内容做清理
---

- Vue中可以通过v-html将HTML片段直接渲染在页面上，v-html对字符串进行**过滤输入**和**转义输出**可以有效避免xss攻击
- React中同样可以渲染HTML————`dangerousSetInnerHtml`，和v-html类似

```jsx
const main = () => {
  const html = '<h1>hello world</h1>';
  return <div dangerousSetInnerHtml={{ __html: html }}></div>
}
```

而`dangerousSetInnerHtml`渲染的HTML内容是没有经过过滤或转义的，所以很容易遇到XSS攻击

### [解决方法](https://www.npmjs.com/package/dompurify)

可以通过 dompurify.sanitize 进行过滤
```jsx
const main = () => {
  const html = '<h1>hello world</h1>';
  return <div dangerousSetInnerHtml={{ __html: DOMPurify.sanitize(html) }}></div>
}
```