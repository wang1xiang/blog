---
date: 2023-11-12
title: 拍摄影片时为什么需要 ND 镜
tags:
  - photography
describe: nd
---

## 拍视频的快门速度

拍视频一般要用多少快门速度呢？

根据前辈们的经验，快门速度应该是帧数的两倍分之一。

如果拍摄 60 帧的视频，那么快门速度就是 1/(60X2)，也就是 1/120 秒；如果拍摄 30 帧视频，那就是 1/60 秒的快门速度。

快门速度过高单帧画面清晰，但画面不连贯感增强，而快门速度等于 1/帧率，画面整体连贯但容易有拖影。也就是有一种动态模糊（也就是拉丝效果），看起来有运动的感觉。

快门速度最低需要设置**1/帧率**，设想一下，如果拍 60 帧视频，也就是每秒 60 张画面，那每张画面最多也只能包含 1/60 秒的时间。

同理，如果是 1/60 秒的快门，连按一秒钟，也最多只能出 60 张，出不了 61 张。所以快门速度只能高于或等于 1/帧率，无法低于 1/帧率。

## 户外大晴天拍摄

如果将快门速度设置成 2 倍帧率的倒数，问题出现了：如果此时是大晴天，不安装任何 ND 镜设备，导致**快门速度过快**，ISO 最低时，光圈 2.8，可能快门就会到 1/2000s，导致拍摄的视频看起来不够流畅，速度感也不够。此时暂停后，每一帧画面都很清晰。

搭配不同的 ND 镜（ND 镜的数字以 2 的次方增长）：

- ND2 = ND0.3 = 降低 1 档曝光，1/2000 \* 2 = 1/1000s

- ND4 = ND0.6 = 降低 2 档曝光，1/2000 \* 4 = 1/500s

- ND8 = ND0.9 = 降低 3 档曝光，1/2000 \* 8 = 1/250s

- ND16 = ND1.2= 降低 4 档曝光，1/2000 \* 16 = 1/125s，拍摄 60 帧可以

- ND32 降低 5 档曝光，1/2000 \* 32 约= 1/60s，拍摄 30 帧可以

- ND64 = ND1.8= 降低 6 档曝光，1/2000 \* 64 约= 1/30s

- ND128 降低 7 档曝光，1/2000 \* 128 约= 1/15s

- ND256 降低 8 档曝光，1/2000 \* 128 约= 1/8s

- ND512 降低 9 档曝光，1/2000 \* 128 约= 1/4s

- ND1000 降低 10 档曝光，1/2000 \* 128 约= 1/2s

关于 ND 镜减光的计算，可以这么理解：**光线剩下原来的几分之一**

比如说 ND512，光线只剩下原来的 1/2000。如果想要调节快门至正常曝光，那么曝光时间就要 x 500 倍，之前快门是 1/2000，x 500 就是 1/4s。

如果安装 ND 镜后，视频拍摄效果就会流畅很多，速度感更好，暂停后画面中间清晰，边缘模糊，这种就是运动模糊效果，大脑会觉得这样的视频更有运动感。

**动态模糊效果：快门越低越强烈**，但在运动相机的设置，快门速度低于 1/60，防抖会失效。