---
date: 2023-10-12
title: js监听当前页面是否活跃/失活
tags:
  - javascript
describe: js监听当前页面是否活跃/失活
---

1. window.addEventListener('focus/blur', ...)
2. window.addEventListener('visibilitychange', ...)
   a. 回调中使用 `document.hidden`或`document.visibilityState`属性检测页面可见性
   b. 兼容性不好，需要`pagehide`辅助

**差异：**
在移动设备上，管理标签（如下图）时，focus & blur 认为已经 blur 了，visibilitychange 认为还是活跃的

![page-alive](./images/page-alive.png)

在 MAC 上，合盖后无法触发 visibilitychange，会在下次打开电脑后快速的触发 2 次 visibilitychange（一次为失活，一次为重新活跃），focus & blur 就没有这个问题

```js
// visibilitychange
const emptyCb = () => {}
class PageVisibilityChangeListener {
  private eventsMap: Map<[CB, CB], CB> = new Map()
  private listenerFn: (visibleCb: CB, hiddenCb: CB) => CB
  private visibilityChangeEventName: string
  constructor() {
    const hiddenProperty =
      'hidden' in document
        ? 'hidden'
        : 'webkitHidden' in document
        ? 'webkitHidden'
        : 'mozHidden' in document
        ? 'mozHidden'
        : null
    this.visibilityChangeEventName = hiddenProperty?.replace(/hidden/i, 'visibilitychange') || ''
    if (!hiddenProperty) console.log('页面激活状态监听失败')
    let lastTime = 0
    let timer = 0
    this.listenerFn = (visibleCb: CB, hiddenCb: CB) => (e) => {
      const t = new Date().getTime()
      if (t - lastTime < 50) {
        clearTimeout(timer)
        lastTime = t
        return
      }
      if (document.visibilityState === 'visible') {
        // @ts-ignore
        timer = setTimeout(() => visibleCb(e), 50)
      } else if (document.visibilityState === 'hidden') {
        // @ts-ignore
        timer = setTimeout(() => hiddenCb(e), 50)
      }
      lastTime = t
    }
  }
  on(visibleCb: CB | null, hiddenCb: CB | null) {
    if (!this.visibilityChangeEventName || (!visibleCb &amp;&amp; !hiddenCb)) return
    visibleCb = visibleCb || emptyCb
    hiddenCb = hiddenCb || emptyCb
    const fn = this.listenerFn(visibleCb, hiddenCb)
    this.eventsMap.set([visibleCb, hiddenCb], fn)
    listener.on(this.visibilityChangeEventName, fn)
  }
  off(visibleCb: CB | null, hiddenCb: CB | null) {
    if (!this.visibilityChangeEventName || (!visibleCb &amp;&amp; !hiddenCb)) return
    visibleCb = visibleCb || emptyCb
    hiddenCb = hiddenCb || emptyCb
    const fn = this.eventsMap.get([visibleCb, hiddenCb])
    fn &amp;&amp; listener.off(this.visibilityChangeEventName, fn)
  }
}
/** 监听页面失活 */
export const pageVisibilityChangeListener = new PageVisibilityChangeListener()
pageVisibilityChangeListener.on(
  () => console.log('页面复活'),
  () => console.log('页面失活')
)
```

```js
// focus &amp; blur
class PageVisibilityChangeListener {
  constructor() {}
  on(visibleCb: CB | null, hiddenCb: CB | null) {
    if (visibleCb) listener.on('focus', visibleCb)
    if (hiddenCb) listener.on('blur', hiddenCb)
  }
  off(visibleCb: CB | null, hiddenCb: CB | null) {
    if (visibleCb) listener.off('focus', visibleCb)
    if (hiddenCb) listener.off('blur', hiddenCb)
  }
}
/** 监听页面失活 */
export const pageVisibilityChangeListener = new PageVisibilityChangeListener()
pageVisibilityChangeListener.on(
  () => console.log('页面聚焦'),
  () => console.log('页面失焦')
)
```
