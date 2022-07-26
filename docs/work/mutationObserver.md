---
date: 2022-7-26
title: 使用mutationObserver检测DOM变化
tags:
  - work
  - react
describe: 通过mutationObserver检测DOM变化，生成事件
---
  
> 最近在写项目时，有一个需求是保存的同时截取当前页面内容并生成缩略图，下面是我的实现过程。

#### 生成快照

- 将DOM转成图片的三种方式
  [dom-to-image](https://github.com/tsayen/dom-to-image)、[html2canvas](https://github.com/niklasvh/html2canvas)、[
html-to-image]([html-to-image](https://github.com/bubkoo/html-to-image))
  对比之后选择html2canvas

- 使用

  ```js
  async function eleToImage(content) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = typeof content === 'string' ? content : content?.outerHTML;
    document.body.appendChild(container);
    /* 删除transform布局，改为position */
    var transformLay = container.querySelectorAll('.react-grid-item');
    let list = Array.prototype.slice.call(transformLay || [])
    list.forEach((item) => {
      let positon = item.style.transform.slice(10, -1).split(',');
      item.style.left = positon[0]
      item.style.top = positon[1]
      item.style.transform = ''
    })
    var textDom = container.querySelectorAll('.text');
    let textList = Array.prototype.slice.call(textDom || [])
    textList.forEach((item) => {
      // 截图时文字会突出
      item.style.fontSize = parseInt(item.style.fontSize) * 0.92 + 'px';
    })
    console.time('canvas')
    const blob = await new Promise<any>((resolve) => {
      html2canvas(container, { useCORS: true }).then((canvas) =>
        canvas.toBlob(resolve, 'png', 0.1)
      );
    });
    document.body.removeChild(container);
    console.timeEnd('canvas')
    return blob;
  }

  ```

- 使用html2canvas时遇到的坑
  1. transform兼容性问题，html2canvas不支持transform，需要修改成position
  2. 字体限制宽度时，可能会遮挡，需要缩小一定比例
  3. 图片跨域问题，需要配置useCORS

通过html2canvas将DOM转成图片并保存，原则上已经解决了问题，但每次保存时不管页面有没有发生变化，都会生成快照，尝试通过[MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)解决一下。

#### 优化

为了通用，写了一个自定义hooks，通过传入func函数来监听DOM变化时的回调

```js
import { useEffect } from 'react';

/**
 * MutationObserver主要用于监视对DOM树所做的修改
 * https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
 */
const useMutationObserver = (dom, depends, func) => {
  useEffect(() => {
    let mutation: MutationObserver;
    if(dom) {
      // 当观察到变动时执行的回调函数
      const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
        func(mutations, observer);
      }

      const config = {
        attributes: true, // 观察属性变动
        // attributeFilter: ['style', 'childList'],
        attributeOldValue: true,
        characterData: true,   // 监听元素内的数据变动
        characterDataOldValue: true,
        childList: true, // 监听子元素数量变动（子元素的属性变化不会触发事件）（只针对一级子元素，孙子元素的数量变化不会触发事件）
        subtree: true,  // 将observer事件下发到目标元素的所有子元素，相当于对子元素也进行了observer
      }

      // 创建一个观察器实例并传入回调函数
      mutation = new MutationObserver(callback);

      // config 观察器的配置（需要观察什么变动）
      // 在DOM更改时 开始接收通知
      mutation.observe(dom, config);

    }

    // 组件销毁时 阻止MutationObaserver继续接收通知
    return () => {
      if(mutation) {
        mutation.disconnect();
      }
    }
  }, [depends])
}

export default useMutationObserver;

// 使用: 监测删除事件
// const isDelBtn = useRef<boolean>(false);

// const func = (mutations) => {
//   // 如果删除最后一个空格 则将当前的优惠券删除
//   if (
//     mutations[0]?.removedNodes[0]?.className === "delete" &&
//     !isDelBtn.current
//   ) {
//     const key = mutations[0]?.removedNodes[0].getAttribute("data-key");
//     removeNode(key);
//   }
// };
// useMutationObserver(refInput, func);
```
