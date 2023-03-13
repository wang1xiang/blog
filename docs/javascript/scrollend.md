---
date: 2023-3-8
title: JS滚动事件新成员—scrollend
tags:
  - javascript
describe: JS滚动事件新成员—scrollend
---

## 前言

相信有不少小伙伴在开发过程中都有处理过这个场景，当页面滚动结束后执行一些操作。我们之前的操作一般都是使用`onscroll`事件配合延迟去实现，往往是滚动还在进行时就触发了事件，并不能精准的捕获到滚动事件完成的时机。而`scrollend`的出现就是为了解决这个问题，让滚动完成事件更加可靠。

## 使用 scroll 实现滚动完成的弊端

如果不使用 scrollend，我们实现滚动结束事件是不是这样的，使用 setTimeout，只要当 100ms 内未滚动时，就判断滚动事件结束。

```js
let scrollEndTimer = null
const callback = () => console.log('滚动事件结束')
document.onscroll = () => {
  clearTimeout(scrollEndTimer)
  scrollEndTimer = setTimeout(callback, 100)
}
```

那么这样操作有哪些问题呢？我们不妨先看看下面这张图片。
![scroll event.gif](./images/scrollevent.gif)
仔细观察下你就会发现，这里的滚动结束事件其实是停止滚动 100ms 的时候触发，并不是实际的滚动结束，称为“滚动暂停”可能更接近些。

## scrollend

通过 MDN 上对[scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)的介绍，我们可以知道 scrollend 是在文档视图完成滚动时触发。

### 怎样算是完成滚动呢？

当滚动位置没有更多待处理的更新并且用户已完成他们的手势时，滚动被认为完成。

所以触摸滚动、鼠标滚轮、键盘滚动等活动只要被释放就会触发 scrollend 事件，同时类似 scrollTo() 这类导致滚动位置更新的事件完成后也会触发 scrollend 事件。

当然，如果滚动位置没有改变，是不会触发 scrollend 事件的。

### 浏览器支持

目前 scrollend 事件仅支持 Firefox 109 版本，接下来不久，Chrome 111 版本也将支持该事件。可以通过 [caniuse](https://caniuse.com/?search=scrollend) 看到 scrollend 事件目前支持的版本。

我们可以通过下面代码看一下效果，注意这段代码需要在 Firefox 109 版本浏览器中运行。

```js
const callback = () => console.log('滚动事件结束')
document.querySelector('.scroll-container').onscrollend = callback
```

![scrollendevent](./images/scrollendevent.gif)

与上面那张图做比较，可以看出不同点：

- 如果将上面的时间拉长，不是100ms，比如1000m或更长时，他并不会