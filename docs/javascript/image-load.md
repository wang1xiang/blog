---
date: 2022-9-5
title: img标签图片未加载完成时显示默认图片
tags:
  - javascript
describe: React函数式组件，当img标签加载状态 loading & success & error
---
  
在项目中使用img标签加载图片资源，当图片文件过大时，加载慢会出现图片裂了的情况，通过onload事件解决

```tsx
import { FC, useState } from 'react';
import loadImage from './default.png';

type IProps = {
  props: { [props: string]: number | string };
  data: { [props: string]: string };
};
const Img: FC<IProps> = ({ props, data }) => {
  const { src } = data;

  const [imgSrc, setImgSrc] = useState(loadImage);
  const handleLoad = () => {
    const imgDom = new Image();
    imgDom.src = src;
    // 加载完成后显示
    imgDom.onload = () => setImgSrc(src);
  }
  return <img onLoad={handleLoad} style={{...props}} src={imgSrc} alt='' />;
};

export default Img;

```

封装成组件

```tsx
import { FC, useState } from 'react';
import loadImage from './default.png';

type IProps = {
  props: { [props: string]: number | string };
  loadImage: string
  successImage: string
  errorImage: string
};
const Img: FC<IProps> = ({ props, loadImage, successImage, errorImage }) => {
  const [imgSrc, setImgSrc] = useState(loadImage);
  const handleLoad = () => {
    const imgDom = new Image();
    imgDom.src = successImage;
    // 加载完成后显示
    imgDom.onload = () => setImgSrc(successImage);
    imgDom.onError = () => setImgSrc(errorImage);
  }
  return <img onLoad={handleLoad} style={{...props}} src={imgSrc} alt='' />;
};

export default Img;
```