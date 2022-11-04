---
date: 2022-10-31
title: http缓存学习
tags:
  - javascript
describe: http缓存学习笔记
---

### HTTP协议

- 请求报文：请求行、请求报头、请求正文
- 响应报文：相应行、响应报头、响应正文
- 首部字段：报头中一些列的属性，如

  ```bash
  Content-Type: text/javascript
  ```

  首部字段包含四种类型：
  - 通用首部字段（请求报头和响应报头都用到的首部）
  - 请求首部字段（请求报头用到的首部）
  - 响应首部字段（响应报头用到的首部）
  - 实体首部字段（针对请求报头和响应报头实体部分使用的首部）

### 与缓存有关的首部字段名

和强缓存有关的首部字段名主要是：Expires和Cache-control

- Expires
  
  定义缓存过期的绝对时间，属于实体首部字段

  ```bash
  Expires: Wed, 11 May 2022 03:50:47 GMT
  ```

  因为Expires设置的缓存过期时间是一个绝对时间，受客户端时间的影响而变得不精准

- Cache-control
  
  定义控制缓存的行为，可以组合使用，属于通用首部字段

  ```bash
  Cache-Control: max-age:3600, s-maxage=3600, public
  Cache-Control: no-cache
  ```

  - max-age：缓存过期相对时间，单位秒，与Expires同时出现时，max-age优先级高
  - public：客户端和代理服务器都可缓存
  - private：客户端缓存、代理服务器不进行缓存，只有发出请求的浏览器才进行缓存，而一些中间的http代理服务器不进行缓存
  - no-cache：请求首部中出现时，表示告知服务器不直接使用缓存，要求向源服务器发起请求；响应首部出现时，表示客户端可以缓存资源，但每次使用缓存资源前，必须向服务器确认其有效性
  - no-store：不进行任何缓存

和协商缓存相关的首部字段名：Last-Modified、If-Modified-Since、Etag、If-None-Match

- Last-Modified与If-Modified-Since
  
  Last-Modified响应首部字段，浏览器第一次收到服务端资源的Last-Modified值后，会将这个值存储，下次继续访问此资源时，会携带If-Modified-Since请求首部发送到服务器，用于验证资源是否过期

  ```bash
  Last-Modified: Fri , 14 May 2021 17:23:13 GMT
  If-Modified-Since: Fri , 14 May 2021 17:23:13 GMT
  ```

  如果在If-Modified-Since字段指定的事件后发生更新，服务器会将更新的资源发送到浏览器，并返回最新的Last-Modified值；如果未更新，则服务端会返回`304 Not Modified`状态码
  
- Etag与If-None-Match
  
  类似于Last-Modified和If-Modified-Since，不同之处在于Last-Modified记录最后需改时间，而Etag代表资源的唯一性标识（资源是否发生改变），资源发生改变则Etag更新，两者同时存在时只有Etag会生效

  ```bash
  Etag: "29322-09SpAhH3nXWd8KIVqB10hSSz66"
  If-None-Match: "29322-09SpAhH3nXWd8KIVqB10hSSz66"
  ```

- Etag和Last-Modified关系
  
  - Last-Modified精确到秒，一秒之内的内容修改Etag才能检测到
  - 内容不变，仅保存时修改时间会发生变化，此时如果使用Last-Modified时就不会走缓存
  - 相辅相成：Etag可以弥补Last-Modified判断的精确性问题，而Last-Modified对静态资源的修改，只需要判断修改时间，对比每次生成Etag来说会快很多

强缓存失效后，浏览器携带缓存标识（If-none-match或If-modified-since）向服务器发起请求，由服务器根据缓存标识决定是否使用缓存

### 网页缓存过程

当浏览器发起Http请求时获取资源时：

1. 向浏览器缓存询问是否有缓存该资源的数据，有的话直接使用
2. 没有时向服务器发起请求，获取资源
3. 将获取到的资源存储在浏览器缓存中

### Disk Cache（磁盘缓存）和Memory Cache（内存缓存）

- Memory Cache从内存中直接读取，读取速度块，但一旦关闭Tab页，Memory Cache就被释放了，下次进还是Disk Cache
- Disk Cache硬盘中的缓存，容量大，但读取速度慢
- Memory Cache比Disk Cache更快原因在于，磁盘缓存会有些许耗时，而内存缓存是及时性的，不存在耗时
- 浏览器会率先查找内存缓存，如果内存中存在则直接加载；不存在时会在磁盘中查找
- 大文件不会存储在内存中
- base64是一串字符串，随着页面渲染而加载，浏览器解析会损耗一定性能，浏览器为了节约渲染开销，会把base64的图片塞进内存

### 缓存新鲜度

缓存新鲜度用于判断缓存是否过期：缓存新鲜度 > 缓存使用期

```bash
缓存新鲜度 = max-age || (expires - date)
```

max-age存在时，缓存新鲜度直接等于它，缓存xxx秒，在这个时间段内都是新鲜的；而max-age不存在时，缓存新鲜度等于expires - date的值，expires绝对时间，表示缓存过期的时间，而date表示创建报文的日期时间（服务器返回新资源的时间），两者相减就可以计算出可以缓存的时间，即新鲜度



