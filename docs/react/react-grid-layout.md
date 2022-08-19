---
date: 2022-8-10
title: 使用react-grid-layout心得
tags:
  - react
describe: 记录使用拖拽组件react-grid-layout遇到的问题
---

## 前言

由于业务需要，最近使用react-grid-layout来完成一个基于拖拉拽生成的弹窗，所以记录一下自己使用过的API以及遇到的问题。

### react-grid-layout简介

介绍：用于 React 的具有响应断点的可拖动和可调整大小的网格布局。[github地址](https://github.com/react-grid-layout/react-grid-layout)

##### 使用

1. 安装npm包

  ```bash
  npm install react-grid-layout -S
  ```

2. 引入css

  在index.tsx或者在引用react-grid-layout的地方引入需要的css样式

   ```js
   
    import 'react-grid-layout/css/styles.css';
   ```

3. 使用

  ```tsx
  import GridLayout from "react-grid-layout";
  class MyFirstGrid extends React.Component {
    render() {
      // layout is an array of objects, see the demo for more complete usage
      const layout = [
        { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
        { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
        { i: "c", x: 4, y: 0, w: 1, h: 2 }
      ];
      return (
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1200}
        >
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </GridLayout>
      );
    }
  }
  ```

##### Grid Layout Props

[官网地址](https://github.com/react-grid-layout/react-grid-layout#grid-layout-props)


下面是个demo
```tsx
import { useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import './index.css';

const ReactGridLayout = WidthProvider(RGL);
const root = {
  width: 600,
  height: 480,
};
type LayoutType = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;

  static?: boolean;
  isDraggable?: boolean; // 是否可移动
  isResizable?: boolean; // 是否可改变大小
  resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
  isBounded?: boolean;
};
const layout: LayoutType[] = [
  {
    w: 400,
    h: 51,
    x: 145,
    y: 419,
    i: "1.不可拖拽",
    minW: 40,
    minH: 2,
    isDraggable: false
  },
  {
    w: 240,
    h: 53,
    x: 213,
    y: 318,
    i: "2.不能改变大小",
    minW: 40,
    minH: 2,
    isResizable: false
  },
  {
    w: 242,
    h: 57,
    x: 212,
    y: 246,
    i: "3",
    minW: 40,
    minH: 2,
  },
  {
    w: 432,
    h: 68,
    x: 116,
    y: 118,
    i: "4",
    minW: 40,
    minH: 2,
  },
  {
    w: 652,
    h: 83,
    x: 2,
    y: 31,
    i: "5",
    minW: 40,
    minH: 2,
  },
];
const GridLayout = () => {
  const onLayoutChange = (layout: LayoutType[]) => {
    setShowVerticalLine(false);
    setShowHorizontal(false);
    console.log(layout);
  };

  // 展示横纵轴
  const [showVerticalLine, setShowVerticalLine] = useState(false);
  const [showHorizontal, setShowHorizontal] = useState(false);
  const onLayoutDrag = (
    layout: LayoutType[],
    oldItem: LayoutType,
    newItem: LayoutType
  ) => {
    // 通过移动过程设置中轴线
    const halfWidth = root?.width / 2;
    const halfHeight = root?.height / 2;
    const { x, y, w, h } = newItem;
    setShowVerticalLine(
      x + w / 2 >= halfWidth - 2 && x + w / 2 <= halfWidth + 2
    );
    setShowHorizontal(
      y + h / 2 >= halfHeight - 2 && y + h / 2 <= halfHeight + 2
    );
  };
  return (
    <div style={{ width: root.width, height: root.height }} className="layout-container" >
      {/* 中轴线 */}
      <div
        className="horizontal-line"
        style={{ opacity: showHorizontal ? 1 : 0 }}
      ></div>
      <div
        className="vertical-line"
        style={{ opacity: showVerticalLine ? 1 : 0 }}
      ></div>
      <ReactGridLayout
        layout={layout}
        // 需要取消各个边的间距 贴边处理
        margin={[0, 0]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
        onDragStop={onLayoutChange}
        onDrag={onLayoutDrag}
        // layout中的元素可以一个放在另一个上
        allowOverlap={true}
        // 元素可移动的点 s下 e右 se右下
        resizeHandles={["s", "se", "e"]}
        // 使用容器宽度作为cols
        cols={root.width}
        rowHeight={1}
      >
        {layout?.map((item: any, index: number) => {
          const { i, zIndex } = item;
          return (
            <div
              style={{
                // borderColor: currentId === i ? "#2680eb" : "",
                zIndex,
              }}
              key={i}
            >
              {i}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};

export default GridLayout;

```

```css
.layout-container {
  border: 1px solid #d9d9d9;
  position: relative;
}
.react-grid-layout {
  height: 100% !important;
  width: 100% !;
  transition: none;
}

.react-grid-item {
  overflow: hidden;
  border: 1px dashed #d9d9d9;
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
}
.react-grid-item.cssTransforms {
  transition: none;
}

.resizing,
.react-grid-item:hover {
  border-color: rgb(38, 128, 235);
}

.react-grid-item > .react-resizable-handle-s {
  cursor: row-resize;
  left: 0;
  margin-left: 0;
  width: 100%;
  height: 8px;
  bottom: 0;
  transform: none;
}

.react-grid-item > .react-resizable-handle-e {
  cursor: col-resize;
  top: 0;
  margin-top: 0;
  width: 8px;
  height: 100%;
  transform: none;
  right: 0;
}

.react-grid-item > .react-resizable-handle {
  z-index: 998;
  opacity: 0;
  position: absolute;
}

.react-grid-item > .react-resizable-handle-se {
  height: 20px;
  width: 20px;
  z-index: 999;
  cursor: se-resize;
  bottom: 0;
  right: 0;
}

.react-grid-placeholder {
  background: transparent;
}
.horizontal-line {
  height: 1px;
  width: 100%;
  background-color: #ff6600;
  position: absolute;
  top: 50%;
  z-index: 999999999;
}
.vertical-line {
  height: 100%;
  width: 0.8px;
  position: absolute;
  left: 50%;
  background-color: #ff6600;
  z-index: 999999999;
}
```

效果如下
![gif](https://im.ezgif.com/tmp/ezgif-1-b08a6a7328.gif)