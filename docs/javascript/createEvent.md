---
date: 2023-1-4
title: 使用createEvent和dispatchEvent模拟事件
tags:
  - javascript
describe: createEvent配合dispatchEvent使用
---

### 事件 Event

一般来说事件都是由用户触发，如鼠标、键盘事件，JavaScript 中通过`addEventListener`来绑定事件被触发相应的函数

### Document.createEvent()

可以通过`createEvent`来创建一个指定类型事件，然后通过`dispatchEvent`来触发它，从而达到模拟事件触发的目的，比如模拟一个屏幕大小变化的过程，代码如下

```js
// 创建UIEvents类型事件
const evt = document.createEvent("UIEvents");
// 定义事件名称resize
evt.initEvent("resize", true, false, window, 0);
// 触发
window.dispatch(evt);
```

接着可以通过`addEventListener`来监听

```js
window.addEventListener(
  "resize",
  (e) => {
    console.log("触发resize");
  },
  false
);
```

模拟鼠标点击事件

```js
const evt1 = document.createEvent("MouseEvents");
evt1.initEvent("click", false, false);
window.dispatchEvent(evt1);
window.addEventListener("click", (e) => {
  console.log("click");
});
```

### 步骤

1. `document.createEvent(Event type)`接收一个 Event type 字符串来创建对应的事件

   - UIEvents UI 事件
   - MouseEvents 鼠标事件
   - MutationEvents DOM 变动事件
   - HTMLEvents HTML 事件

2. 创建 event 对象后，需要调用对应的`initEvent`进行初始化

   ```js
   // type 定义事件类型的字符串
   // canBubble 是否冒泡
   // cancelable 是否可以用preventDefault()取消事件
   // view window对象
   // detail 有关事件的详细信息
   initUIEvent(type, canBubble, cancelable, view, detail);
   ```

3. 通过`window.dispatch(event)`触发自定义事件
