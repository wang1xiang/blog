---
date: '2020-8-15'
title: Http学习简单记录
tags:
  - http
describe: 
---



## http(Hyper Text Transfer Protocol 超文本链接协议)

基于 tcp/ip 协议

### 特点

- 简单快速
- 灵活(任意类型由 Content-Type 标记)
- 无连接(请求完成断开连接)
- 无状态
- 支持 B/S 及 C/S

### URL(Uniform Resource Locator 统一资源定位符)

  http 使用统一资源标识符(URI Uniform Resource Identifiers)来传输数据和建立连接，URL 是特殊的 URI

- URL 构成(<http://www.aspxfans.com:8080/news/index.asp?boardID=5&ID=24618&page=1#name>)
  包括：
  1. 协议部分 http 或 ftp 等
  2. 域名部分：www.aspxfans.com
  3. 端口部分：端口不是必须，如果省略将采用默认端口
  4. 虚拟目录部分：第一个/到最后一个/是虚拟目录部分，/news/
  5. 文件名部分：从域名后的最后一个'/'开始到'?'为止，index.asp
  6. 锚部分：从'#'开始到最后，都是锚部分，name
  7. 参数部分：从'?'开始到'#'之间都是参数
- URL 和 URI 关系
  URI 是 Uniform Resource Identifier，统一资源标识符，用来唯一的表示一个资源(web 上可用的资源：图片、文档、视频、程序)都是 URI 来定位的
  URI 由三部分组成：访问资源的命名机制、存放资源的主机名、资源自身的名称
  URL 由三部分组成：协议、存有该资源的主机 IP 地址、主机资源的具体地址
- HTTP 协议之请求消息 Request
- HTTP 协议之请求消息 Response

### HTTP 之状态码

- 1xx 正在请求状态中
- 2xx 请求成功
- 3xx 需要重定向
- 4xx 资源找不到，客户端问题
- 5xx 服务器错误
常见状态码：
- 200 OK/客户端请求成功
- 400Bad Request/客户端请求有语法错误，不能被服务器所理解
- 401 Unauthorized /请求未经授权
- 403Forbidden / 服务器收到请求，但是拒绝提供服务
- 404Not found / 请求资源找不到
- 500 Internal Serve Error / 服务器不可预期的错误
- 503 Server Unavailable / 服务器不可用

### HTTP 工作原理

  Http 协议采用请求/响应模型，客户端发送请求报文(请求的方法、URL、协议版本、请求头部和请求数据)，服务器返回状态行作为响应(协议的版本、成功或错误代码、服务器信息、响应头部和响应数据)
  HTTP 请求/响应步骤：

  1. 客户端连接到 web 服务器，一个 Http 客户端，通常是浏览器，与 web 服务器的 http 端口建立一个 tcp 套接字连接
  2. 发送 http 请求，通过 TCP 套接字，客户端向 web 服务器发送一个文本的请求报文，由请求行、请求头部、空行和请求数据组成
  3. 服务器接受请求并返回 HTTP 响应，web 服务器解析请求，定位请求资源，服务器将资源副本写到 tcp 套接字，有客户端读取，由状态行、响应头部、空行和响应数据
  4. 放连接 tcp 连接，若 connection 模式为 close，则服务器主动关闭 TCP 连接，客户端被动关闭，释放 tcp 连接；若 connection 模式为 keepalive，则该连接会继续接受请求
  5. 客户端浏览器解析 HTML 内容，客户端浏览器首先解析状态行，查明表明请求是否成功的状态码。然后解析每一个响应头，响应头告知以下为若干字节的 HTML 文档和文档的字符集，客户端浏览器读取响应数据 HTML，根据 HTML 的语法对其进行格式化，并在浏览器窗口展示

### 浏览器地址栏键入 URL，按下回车经历

1. 浏览器向 DNS 服务器请求解析该 URL 中的域名所对应的 IP
2. 解析出 IP 地址后，根据该 IP 地址和端口，和服务器建立 TCP 连接
3. 浏览器发出读取文件(URL 中域名后面部分对应的文件)的 HTTP 请求，该请求报文作为 TCP 三次握手的第三个报文的数据发送给服务器
4. 服务器对浏览器请求做出响应，并把 对应的 html 文本发送给浏览器
5. 释放 tcp 连接
6. 浏览器将该 html 文本显示内容
