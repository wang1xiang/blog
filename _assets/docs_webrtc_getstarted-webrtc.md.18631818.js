import{f as n,g as a,J as s}from"./common-03e46d7f.js";const e='{"title":"WebRTC这么火🔥，前端靓仔，请收下这篇入门教程","frontmatter":{"date":"2023-07-17","title":"WebRTC这么火🔥，前端靓仔，请收下这篇入门教程","tags":["javascript","webrtc"],"describe":"本文是针对小白的 WebRTC 快速入门课，如果你还之前还不了解 WebRTC，不了解实时通讯，希望你能认真阅读本文，实现对 WebRTC 的零的突破 💪。"},"headers":[{"level":2,"title":"什么是 WebRTC","slug":"什么是-webrtc"},{"level":3,"title":"实时通信和即时通信的区别","slug":"实时通信和即时通信的区别"},{"level":2,"title":"WebRTC 发展史","slug":"webrtc-发展史"},{"level":2,"title":"WebRTC 应用场景","slug":"webrtc-应用场景"},{"level":2,"title":"WebRTC 组成部分","slug":"webrtc-组成部分"},{"level":3,"title":"浏览器 API","slug":"浏览器-api"},{"level":3,"title":"音视频引擎","slug":"音视频引擎"},{"level":3,"title":"网络 I/O","slug":"网络-i-o"},{"level":2,"title":"WebRTC 通信过程","slug":"webrtc-通信过程"},{"level":2,"title":"第一步：音视频采集","slug":"第一步：音视频采集"},{"level":3,"title":"Demo 展示","slug":"demo-展示"},{"level":3,"title":"其他相关 API","slug":"其他相关-api"},{"level":2,"title":"第二/三/四步：信令交互","slug":"第二-三-四步：信令交互"},{"level":3,"title":"什么是信令服务器","slug":"什么是信令服务器"},{"level":3,"title":"使用 Node 搭建信令服务器","slug":"使用-node-搭建信令服务器"},{"level":2,"title":"第五步：RTCPeerConnection 对象 媒体协商","slug":"第五步：rtcpeerconnection-对象-媒体协商"},{"level":3,"title":"什么是媒体协商","slug":"什么是媒体协商"},{"level":3,"title":"媒体协商过程","slug":"媒体协商过程"},{"level":3,"title":"代码实现媒体协商过程","slug":"代码实现媒体协商过程"},{"level":2,"title":"第六步：端与端建立连接","slug":"第六步：端与端建立连接"},{"level":3,"title":"什么是 Candidate","slug":"什么是-candidate"},{"level":3,"title":"代码部分","slug":"代码部分"},{"level":2,"title":"第七步：显示远端流","slug":"第七步：显示远端流"},{"level":2,"title":"最后","slug":"最后"}],"relativePath":"docs/webrtc/getstarted-webrtc.md","lastUpdated":1700118039270.2712}';var t={};const p=[s('<p>WebRTC 系列教程分为三篇进行介绍，本篇为第一篇，下一篇<a href="https://juejin.cn/post/7266417942182608955" target="_blank" rel="noopener noreferrer">WebRTC 这么火 🔥，前端靓仔，请收下这篇入门教程</a>。</p><p>本文是针对小白的 WebRTC 快速入门课，如果你还之前还不了解 WebRTC，希望你能认真阅读本文，实现对 WebRTC 的零的突破 💪。如果感兴趣，就跟着我动手实践一下。</p><h2 id="什么是-webrtc"><a class="header-anchor" href="#什么是-webrtc" aria-hidden="true">#</a> 什么是 WebRTC</h2><p>WebRTC（Web Real-Time Communications）是一项实时通讯技术，它允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流和（或）音频流或者其他任意数据的传输。WebRTC 包含的这些标准使用户在无需安装任何插件或者第三方的软件的情况下，创建点对点（Peer-to-Peer）的数据分享和电话会议成为可能。</p><h3 id="实时通信和即时通信的区别"><a class="header-anchor" href="#实时通信和即时通信的区别" aria-hidden="true">#</a> 实时通信和即时通信的区别</h3><p>IM 即时通信，就是通过文字聊天、语音消息发送、文件传输等方式通信，考虑的是<strong>可靠性</strong>；</p><p>RTC 实时通信：音视频通话、电话会议，考虑的是<strong>低延时</strong>。</p><h2 id="webrtc-发展史"><a class="header-anchor" href="#webrtc-发展史" aria-hidden="true">#</a> WebRTC 发展史</h2><p>2011 年开始， Google 先后收购 GIPS 和 On2，组成 GIPS 音视频引擎 + VPx 系列视频编解码器，并将其代码开源，WebRTC 项目应运而生。</p><p>2012 年，Google 将 WebRTC 集成到 Chrome 浏览器中。于是我们就可以愉快的在浏览器之间进行音视频通信。</p><p>当前除了 IE 之外的浏览器都已支持 WebRTC。 <img src="/blog/_assets/can-i-use-webrtc.5ad90cb4.png" alt="can-i-use-webrtc.png"></p><h2 id="webrtc-应用场景"><a class="header-anchor" href="#webrtc-应用场景" aria-hidden="true">#</a> WebRTC 应用场景</h2><p>WebRTC 的能力使其适用于各种实时通信场景：</p><ol><li>点对点通讯：WebRTC 支持浏览器之间进行音视频通话，例如语音通话、视频通话等；</li><li>电话会议：WebRTC 可以支持多人音视频会议，例如腾讯会议、钉钉会议等；</li><li>屏幕共享：WebRTC 不仅可以传输音视频流，还可以用于实时共享屏幕；</li><li>直播：WebRTC 可以用于构建实时直播，用户可以通过浏览器观看直播内容。</li></ol><h2 id="webrtc-组成部分"><a class="header-anchor" href="#webrtc-组成部分" aria-hidden="true">#</a> WebRTC 组成部分</h2><p>在了解 WebRTC 通信过程前，我们需要先来了解下 WebRTC 的组成部分，这可以帮助我们快速建立 WebRTC 的知识体系。</p><p>WebRTC 主要由三部分组成：<strong>浏览器 API</strong>、<strong>音视频引擎</strong>和<strong>网络 IO</strong>。</p><p><img src="/blog/_assets/webrtc-architecture.f89b6c5b.png" alt="webrtc-architecture.png"></p><h3 id="浏览器-api"><a class="header-anchor" href="#浏览器-api" aria-hidden="true">#</a> 浏览器 API</h3><p>用于<strong>采集摄像头和麦克风</strong>生成媒体流，并处理音视频通信相关的<strong>编码、解码、传输</strong>过程，可以使用以下 API 在浏览器中创建实时通信应用程序。</p><ul><li><p>getUserMedia: 获取麦克风和摄像头的许可，使得 WebRTC 可以拿到本地媒体流；</p></li><li><p>RTCPeerConnection: 建立点对点连接的关键，提供了创建，保持，监控，关闭连接的方法的实现。像媒体协商、收集候选地址都需要它来完成；</p></li><li><p>RTCDataChannel: 支持点对点数据传输，可用于传输文件、文本消息等。</p></li></ul><h3 id="音视频引擎"><a class="header-anchor" href="#音视频引擎" aria-hidden="true">#</a> 音视频引擎</h3><p>有了 WebRTC，我们可以很方便的实现音视频通信；而如果没有 WebRTC 的情况下，我们想要实现音视频通信，就需要去了解音视频编码器相关技术。</p><p>WebRTC 已经 <strong>内置了强大的音视频引擎</strong>，可以对媒体流进行编解码、回声消除、降噪、防止视频抖动等处理，我们使用者大可不用去关心如何实现 。主要使用的音视频编解码器有:</p><ul><li><p>OPUS: 一个开源的低延迟音频编解码器，WebRTC 默认使用；</p></li><li><p>G711: 国际电信联盟 ITU-T 定制出来的一套语音压缩标准，是主流的波形声音编解码器；</p></li><li><p>VP8: VP8，VP9，都是 Google 开源的视频编解码器，现在主要用于 WebRTC 视频编码；</p></li><li><p>H264: 视频编码领域的通用标准，提供了高效的视频压缩编码，之前 WebRTC 最先支持的是自己家的 VP8，后面也支持了 H264、H265 等。</p></li></ul><p>还有像回声消除<code>AEC(Acoustic Echo Chancellor)</code>、背景噪音抑制<code>ANS(Automatic Noise Suppression)</code>和<code>Jitter buffer</code>用来防止视频抖动，这些问题在 WebRTC 中也提供了非常成熟、稳定的算法，并且提供图像增加处理，例如美颜，贴图，滤镜处理等。</p><h3 id="网络-i-o"><a class="header-anchor" href="#网络-i-o" aria-hidden="true">#</a> 网络 I/O</h3><p>WebRTC 传输层用的是 <strong>UDP</strong> 协议，因为音视频传输对及时性要求更高，如果使用 TCP 当传输层协议的话，如果发生丢包的情况下，因为 TCP 的可靠性，就会尝试重连，如果第七次之后仍然超时，则断开 TCP 连接。而如果第七次收到消息，那么传输的延迟就会达到 2 分钟。在延迟高的情况下，想做到正常的实时通讯显然是不可能的，此时 TCP 的可靠性反而成了弊端。</p><p>而 UDP 则正好相反，它只负责有消息就传输，不管有没有收到，这里从底层来看是满足 WebRTC 的需求的，所以 WebRTC 是采用 UDP 来当它的传输层协议的。</p><p>这里主要用到以下几种协议/技术：</p><ul><li><p><code>RTP/SRTP</code>: 传输音视频数据流时，我们并不直接将音视频数据流交给 UDP 传输，而是先给音视频数据加个 RTP 头，然后再交给 UDP 进行，但是由于浏览器对安全性要求比较高，增加了加密这块的处理，采用 SRTP 协议；</p></li><li><p><code>RTCP</code>：通过 RTCP 可以知道各端的网络质量，这样对方就可以做流控处理；</p></li><li><p><code>P2P(ICE + STUN + TURN)</code>: 这是 WebRTC 最核心的技术，利用 ICE、STUN、TURN 等技术，实现了浏览器之间的直接点对点连接，解决了 NAT 穿透问题，实现了高质量的网络传输。</p></li></ul><p>除了以上三部分，WebRTC 还需要一个<strong>信令服务</strong>做会话管理，但 WebRTC 规范里没有包含信令协议，需要自行实现。</p><h2 id="webrtc-通信过程"><a class="header-anchor" href="#webrtc-通信过程" aria-hidden="true">#</a> WebRTC 通信过程</h2><p>基于以上，我们来思考下 WebRTC 实现一对一通信需要哪些基本条件？</p><ul><li><p><code>WebRTC 终端（两个）</code>：本地和远端，负责音视频采集、编解码、NAT 穿越以及音视频数据传输等；</p></li><li><p><code>Signal 信令服务器</code>：自行实现的信令服务，负责信令处理，如加入房间、离开房间、媒体协商消息的传递等；</p></li><li><p><code>STUN/TURN 服务器</code>：负责获取 WebRTC 终端在公网的 IP 地址，以及 NAT 穿越失败后的数据中转服务。</p></li></ul><p>通信过程如下：</p><ol><li>本地（WebRTC 终端）启动后，检测设备可用性，如果可用后开始进行音视频采集工作；</li><li>本地就绪后，发送“加入房间”信令到 Signal 服务器；</li><li>Signal 服务器创建房间，等待加入；</li><li>对端（WebRTC 终端）同样操作，加入房间，并通知另一端；</li><li>双端创建媒体连接对象<code>RTCPeerConnection</code>，进行媒体协商；</li><li>双端进行连通性测试，最终建立连接；</li><li>将采集到的音视频数据通过<code>RTCPeerConnection</code>对象进行编码，最终通过 P2P 传送给对端/本地，再进行解码、展示。</li></ol><blockquote><p>第 6 步在建立连接进行 P2P 穿越时很有可能失败。当 P2P 穿越失败时，为了保障音视频数据仍然可以互通，则需要通过 TURN 服务器进行音视频数据中转。后面会讲到 TURN 服务是什么，以及如何搭建 TURN 服务。</p></blockquote><p>接下来，我们按照通信过程，来一一讲解每一步要做的事情。</p><p><img src="/blog/_assets/webrtc-flow.8e70aaa7.png" alt="webrtc-flow.png"></p><h2 id="第一步：音视频采集"><a class="header-anchor" href="#第一步：音视频采集" aria-hidden="true">#</a> 第一步：音视频采集</h2><p>采集音视频数据是 WebRTC 通信的前提，我们可以使用浏览器提供的 <a href="https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia" target="_blank" rel="noopener noreferrer">getUserMedia</a> API 进行音视频采集。</p><div class="language-js"><pre><code><span class="token keyword">const</span> constraints <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">video</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">audio</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span>\n<span class="token keyword">const</span> localStream <span class="token operator">=</span> navigator<span class="token punctuation">.</span>mediaDevices<span class="token punctuation">.</span><span class="token function">getUserMedia</span><span class="token punctuation">(</span>constraints<span class="token punctuation">)</span>\n</code></pre></div><p>getUserMedia 接受参数<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%8F%82%E6%95%B0" target="_blank" rel="noopener noreferrer">constraints</a>用于指定 MediaStream 中包含哪些类型的媒体轨（音频轨、视频轨），并对媒体轨做设置（如设置视频的宽高、帧率等）。</p><p>返回一个 promise 对象，成功后会获得流媒体对象 MediaStream（包含从音视频设备中获取的音视频数据）； 使用 getUserMedia 时，浏览器会询问用户，开启音频和视频权限。如果用户拒绝或无权限时，则返回 error。</p><h3 id="demo-展示"><a class="header-anchor" href="#demo-展示" aria-hidden="true">#</a> Demo 展示</h3><p>通过<code>getUserMedia</code>成功回调拿到媒体流之后，通过将媒体流挂载到<code>videoDOM.srcObject</code>即可显示在页面上。</p><p>效果如下（帅照 🤵 自动马赛克）：</p><p><img src="/blog/_assets/video-demo.6d5c6947.png" alt="video-demo.png"></p><p><a href="https://codepen.io/wang1xiang/pen/jOQdZJz" target="_blank" rel="noopener noreferrer">👉🏻 在线体验地址</a></p><h3 id="其他相关-api"><a class="header-anchor" href="#其他相关-api" aria-hidden="true">#</a> 其他相关 API</h3><h4 id="mediadeviceinfo"><a class="header-anchor" href="#mediadeviceinfo" aria-hidden="true">#</a> <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo" target="_blank" rel="noopener noreferrer">MediaDeviceInfo</a></h4><p>用于表示每个媒体输入/输出设备的信息，包含以下 4 个属性：</p><ul><li><p>deviceId: 设备的唯一标识；</p></li><li><p>groupId: 如果两个设备属于同一物理设备，则它们具有相同的组标识符 - 例如同时具有内置摄像头和麦克风的显示器；</p></li><li><p>label: 返回描述该设备的字符串，即设备名称（例如“外部 USB 网络摄像头”）；</p></li><li><p>kind: 设备种类，可用于识别出是音频设备还是视频设备，是输入设备还是输出设备：<code>audioinput</code>/<code>audiooutput</code>/<code>videoinput</code></p></li></ul><p>可以在浏览器控制台直接输入<code>navigator.mediaDevices.enumerateDevices()</code>返回如下所示： <img src="/blog/_assets/enumerateDevices-demo.8ebc129f.png" alt="enumerateDevices-demo.png"></p><h4 id="mediadevices"><a class="header-anchor" href="#mediadevices" aria-hidden="true">#</a> <a href="https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices" target="_blank" rel="noopener noreferrer">MediaDevices</a></h4><p>该接口提供访问连接媒体输入的设备（如摄像头、麦克风）以及获取屏幕共享等方法。而我们需要获取可用的音视频设备列表，就是通过该接口中的方法来实现的，如前面提到的<code>getUserMedia</code>方法。</p><p>方法：</p><ul><li><p>MediaDevices.enumerateDevices()</p><p>获取可用的媒体输入和输出设备的列表，例如：麦克风、相机、耳机等</p><div class="language-js"><pre><code><span class="token keyword">var</span> enumeratorPromise <span class="token operator">=</span> navigator<span class="token punctuation">.</span>mediaDevices<span class="token punctuation">.</span><span class="token function">enumerateDevices</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div><p>返回的 promise 对象，成功回调时会拿到描述设备的 MediaDeviceInfo 列表，用来存放 WebRTC 获取到的每一个音视频设备信息。</p></li><li><p>MediaDevices.getDisplayMedia()</p><p>提示用户去选择和授权捕获展示的内容或部分内容（如一个窗口）在一个 MediaStream 里。然后，这个媒体流可以通过使用 MediaStream Recording API 被记录或者作为 WebRTC 会话的一部分被传输。用于共享屏幕时传递。</p><div class="language-js"><pre><code><span class="token keyword">var</span> promise <span class="token operator">=</span> navigator<span class="token punctuation">.</span>mediaDevices<span class="token punctuation">.</span><span class="token function">getDisplayMedia</span><span class="token punctuation">(</span>constraints<span class="token punctuation">)</span>\n</code></pre></div><p>接受可选参数 constraints 同<code>getUserMedia</code>方法，不传时也会开启视频轨道。</p><p><img src="/blog/_assets/mediaDevices-getDisplayMedia.e66417f5.png" alt="mediaDevices-getDisplayMedia.png"></p></li><li><p>MediaDevices.getUserMedia()</p></li></ul><p><strong>需要 Https（或者 localhost）环境支持，因为在浏览器上通过 HTTP 请求下来的 JavaScript 脚本是不允话访问音视频设备的，只有通过 HTTPS 请求的脚本才能访问音视频设备。</strong></p><h2 id="第二-三-四步：信令交互"><a class="header-anchor" href="#第二-三-四步：信令交互" aria-hidden="true">#</a> 第二/三/四步：信令交互</h2><h3 id="什么是信令服务器"><a class="header-anchor" href="#什么是信令服务器" aria-hidden="true">#</a> 什么是信令服务器</h3><p>信令可以简单理解为消息，在协调通讯的过程中，为了建立一个 webRTC 的通讯过程，<strong>在通信双方彼此连接、传输媒体数据之前，它们要通过信令服务器交换一些信息，如加入房间、离开房间及媒体协商</strong>等，而这个过程在 webRTC 里面是没有实现的，需要自己搭建信令服务。</p><h3 id="使用-node-搭建信令服务器"><a class="header-anchor" href="#使用-node-搭建信令服务器" aria-hidden="true">#</a> 使用 Node 搭建信令服务器</h3><p>可以使用 <a href="https://socket.io/zh-CN/" target="_blank" rel="noopener noreferrer">Socket.io</a> 来实现 WebRTC 信令服务器，<a href="http://Socket.io" target="_blank" rel="noopener noreferrer">Socket.io</a> 已经内置了房间的概念，所以非常适合用于信令服务器的创建。</p><p>以下使用 <a href="http://Socket.io" target="_blank" rel="noopener noreferrer">Socket.io</a> 的过程中需要用到的知识点：</p><ul><li><p>给本次连接发消息 <code>emit</code>、<code>on</code></p><div class="language-js"><pre><code><span class="token comment">// 如 发送message消息</span>\n<span class="token keyword">const</span> username <span class="token operator">=</span> <span class="token string">&#39;xx&#39;</span>\n<span class="token keyword">const</span> message <span class="token operator">=</span> <span class="token string">&#39;hello&#39;</span>\n<span class="token comment">// 发送消息</span>\nsocket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;message&#39;</span><span class="token punctuation">,</span> username<span class="token punctuation">,</span> message<span class="token punctuation">)</span>\n<span class="token comment">// 接受消息</span>\nsocket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;message&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">username<span class="token punctuation">,</span> message</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div></li><li><p>给某个房间内所有人发消息(除本连接外)</p><div class="language-js"><pre><code>socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>room<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div></li><li><p>给所有人发消息(除本连接外)</p><div class="language-js"><pre><code>socket<span class="token punctuation">.</span>broadcast<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div></li></ul><p>搭建信令服务器过程如下：</p><ol><li><p><a href="http://Socket.io" target="_blank" rel="noopener noreferrer">Socket.io</a> 分为服务端和客户端两部分。服务端由 Node.js 加载后侦听某个服务端口。</p><div class="language-js"><pre><code><span class="token keyword">let</span> app <span class="token operator">=</span> <span class="token function">express</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">let</span> http_server <span class="token operator">=</span> http<span class="token punctuation">.</span><span class="token function">createServer</span><span class="token punctuation">(</span>app<span class="token punctuation">)</span>\nhttp_server<span class="token punctuation">.</span><span class="token function">listen</span><span class="token punctuation">(</span><span class="token number">80</span><span class="token punctuation">)</span>\n\n<span class="token keyword">let</span> io <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">IO</span><span class="token punctuation">(</span>http_server<span class="token punctuation">,</span> <span class="token punctuation">{</span>\n  <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&#39;/&#39;</span><span class="token punctuation">,</span>\n  <span class="token literal-property property">cors</span><span class="token operator">:</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">origin</span><span class="token operator">:</span> <span class="token string">&#39;*&#39;</span><span class="token punctuation">,</span>\n  <span class="token punctuation">}</span><span class="token punctuation">,</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\nhttp_server<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;listening&#39;</span><span class="token punctuation">)</span>\n</code></pre></div></li><li><p>客户端要想与服务端相连，首先要加载 <a href="http://Socket.io" target="_blank" rel="noopener noreferrer">Socket.io</a> 的客户端库，然后调用 io.connect();</p><div class="language-js"><pre><code>socket <span class="token operator">=</span> <span class="token function">io</span><span class="token punctuation">(</span><span class="token string">&#39;http://localhost:80&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n  <span class="token literal-property property">query</span><span class="token operator">:</span> <span class="token punctuation">{</span> username<span class="token punctuation">,</span> room <span class="token punctuation">}</span><span class="token punctuation">,</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">connect</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n</code></pre></div></li><li><p>此时，服务端会接收到<code>connection</code>消息，在此消息中注册接受/发送消息的事件；</p><div class="language-js"><pre><code><span class="token comment">// 监听连接</span>\nio<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;connection&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">socket</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n <span class="token keyword">const</span> <span class="token punctuation">{</span> query <span class="token punctuation">}</span> <span class="token operator">=</span> socket<span class="token punctuation">.</span>handshake\n <span class="token comment">// 获取socket连接参数 username和room</span>\n <span class="token keyword">const</span> <span class="token punctuation">{</span> username<span class="token punctuation">,</span> room <span class="token punctuation">}</span> <span class="token operator">=</span> query\n <span class="token operator">...</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div></li><li><p>客户端同样注册接受/发送消息的事件，双方开始通信。</p><div class="language-js"><pre><code>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;message&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">room<span class="token punctuation">,</span> data</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  socket<span class="token punctuation">.</span><span class="token function">to</span><span class="token punctuation">(</span>room<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;message&#39;</span><span class="token punctuation">,</span> room<span class="token punctuation">,</span> data<span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\nsocket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;leave&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">room<span class="token punctuation">,</span> username</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  socket<span class="token punctuation">.</span><span class="token function">leave</span><span class="token punctuation">(</span>room<span class="token punctuation">)</span>\n  socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;leave&#39;</span><span class="token punctuation">,</span> room<span class="token punctuation">,</span> socket<span class="token punctuation">.</span>id<span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div></li></ol><p>最后，看一下效果如下： <img src="/blog/_assets/socketIO-demo.27ef98fa.png" alt="socketIO-demo.png"></p><p>顺便看一下日志信息： <img src="/blog/_assets/socketIO-demo-log.47016781.png" alt="socketIO-demo-log.png"></p><p><a href="https://github.com/wang1xiang/webrtc-demo/tree/master/03-signal" target="_blank" rel="noopener noreferrer">👉🏻 完整代码地址</a></p><h2 id="第五步：rtcpeerconnection-对象-媒体协商"><a class="header-anchor" href="#第五步：rtcpeerconnection-对象-媒体协商" aria-hidden="true">#</a> 第五步：RTCPeerConnection 对象 媒体协商</h2><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection" target="_blank" rel="noopener noreferrer">RTCPeerConnection</a>是一个由本地计算机到远端的 WebRTC 连接，该接口提供了创建，保持，监控，关闭连接的方法的实现，可以简单理解为功能强大的 socket 连接。</p><p>通过<code>new RTCPeerConnection</code>即可创建一个 RTCPeerConnection 对象，此对象主要负责与<strong>各端建立连接（NAT 穿越），接收、发送音视频数据</strong>，并保障音视频的服务质量，接下来要说的端到端之间的媒体协商，也是基于 RTCPeerConnection 对象来实现的。</p><p>至于它是如何保障端与端之间的连通性，如何保证音视频的服务质量，又如何确定使用的是哪个编解码器等问题，作为应用者的我们大可不必关心，因为所有的这些问题都已经在 RTCPeerConnection 对象的底层实现好了 👍。</p><div class="language-js"><pre><code><span class="token keyword">const</span> localPc <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RTCPeerConnection</span><span class="token punctuation">(</span>rtcConfig<span class="token punctuation">)</span>\n<span class="token comment">// 将音视频流添加到 RTCPeerConnection 对象中</span>\nlocalStream<span class="token punctuation">.</span><span class="token function">getTracks</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">track</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  localPc<span class="token punctuation">.</span><span class="token function">addTrack</span><span class="token punctuation">(</span>track<span class="token punctuation">,</span> localStream<span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre></div><blockquote><p>在第一步获取音视频流后，需要将流添加到创建的 RTCPeerConnection 对象中，当 RTCPeerConnection 对象获得音视频流后，就可以开始与对端进行媒协体协商。</p></blockquote><h3 id="什么是媒体协商"><a class="header-anchor" href="#什么是媒体协商" aria-hidden="true">#</a> 什么是媒体协商</h3><p>媒体协商的作用是<strong>找到双方共同支持的媒体能力</strong>，如双方各自支持的编解码器，音频的参数采样率，采样大小，声道数、视频的参数分辨率，帧率等等。</p><p>就好比两人相亲，通过介绍人男的知道了女的身高、颜值、身材，女的理解了男的家庭、财富、地位，然后找到你们的共同点“穷”，你俩觉得“哇竟然这么合适”，赶紧见面深入交流一下 💓。</p><p>上述说到的这些音频/视频的信息都会在<strong>SDP（Session Description Protocal：即使用文本描述各端的“能力”）</strong> 中进行描述。</p><blockquote><p>一对一的媒体协商大致如下：首先自己在 SDP 中记录自己支持的音频/视频参数和传输协议，然后进行信令交互，交互的过程会同时传递 SDP 信息，另一方接收后与自己的 SDP 信息比对，并取出它们之间的交集，这个交集就是它们协商的结果，也就是它们最终使用的音视频参数及传输协议。</p></blockquote><h3 id="媒体协商过程"><a class="header-anchor" href="#媒体协商过程" aria-hidden="true">#</a> 媒体协商过程</h3><p>一对一通信中，发起方发送的 SDP 称为<code>Offer</code>(提议)，接收方发送的 SDP 称为<code>Answer</code>(应答)。</p><p>每端保持两个描述：描述本身的本地描述<code>LocalDescription</code>，描述呼叫的远端的远程描述<code>RemoteDescription</code>。</p><p>当通信双方 RTCPeerConnection 对象创建完成后，就可以进行媒体协商了，大致过程如下：</p><ol><li>发起方创建 <code>Offer</code> 类型的 SDP，保存为本地描述后再通过信令服务器发送到对端；</li><li>接收方接收到 <code>Offer</code> 类型的 SDP，将 <code>Offer</code> 保存为远程描述；</li><li>接收方创建 <code>Answer</code> 类型的 SDP，保存为本地描述，再通过信令服务器发送到发起方，此时接收方已知道连接双方的配置；</li><li>发起方接收到 <code>Answer</code> 类型的 SDP 后保存到远程描述，此时发起方也已知道连接双方的配置；</li><li>整个媒体协商过程处理完毕。</li></ol><p><img src="/blog/_assets/webrtc-sdp.31e59451.png" alt="webrtc-sdp.png"></p><p>更详细的步骤请参考 MDN 中对<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Connectivity#%E4%BC%9A%E8%AF%9D%E6%8F%8F%E8%BF%B0" target="_blank" rel="noopener noreferrer">会话描述</a>讲解。</p><h3 id="代码实现媒体协商过程"><a class="header-anchor" href="#代码实现媒体协商过程" aria-hidden="true">#</a> 代码实现媒体协商过程</h3><p>通过 MDN 先了解下我们需要用到的 API：</p><ul><li><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/createOffer" target="_blank" rel="noopener noreferrer">createOffer</a>用于创建 Offer；</li><li><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer" target="_blank" rel="noopener noreferrer">createAnswer</a>用于创建 Answer；</li><li><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription" target="_blank" rel="noopener noreferrer">setLocalDescription</a>用于设置本地 SDP 信息；</li><li><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/setRemoteDescription" target="_blank" rel="noopener noreferrer">setRemoteDescription</a>用于设置远端的 SDP 信息。</li></ul><h4 id="发起方创建-rtcpeerconnection"><a class="header-anchor" href="#发起方创建-rtcpeerconnection" aria-hidden="true">#</a> 发起方创建 RTCPeerConnection</h4><div class="language-js"><pre><code><span class="token comment">// 配置</span>\n<span class="token keyword">export</span> <span class="token keyword">const</span> rtcConfig <span class="token operator">=</span> <span class="token keyword">null</span>\n<span class="token keyword">const</span> localPc <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RTCPeerConnection</span><span class="token punctuation">(</span>rtcConfig<span class="token punctuation">)</span>\n</code></pre></div><h4 id="发起方-接收方创建-offer-保存为本地描述"><a class="header-anchor" href="#发起方-接收方创建-offer-保存为本地描述" aria-hidden="true">#</a> 发起方/接收方创建 Offer 保存为本地描述</h4><div class="language-js"><pre><code><span class="token keyword">let</span> offer <span class="token operator">=</span> <span class="token keyword">await</span> localPc<span class="token punctuation">.</span><span class="token function">createOffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token comment">// 保存为本地描述</span>\n<span class="token keyword">await</span> localPc<span class="token punctuation">.</span><span class="token function">setLocalDescription</span><span class="token punctuation">(</span>offer<span class="token punctuation">)</span>\n<span class="token comment">// 通过信令服务器发送到对端</span>\nsocket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;offer&#39;</span><span class="token punctuation">,</span> offer<span class="token punctuation">)</span>\n</code></pre></div><h4 id="接受-offer-后-创建-answer-并发送"><a class="header-anchor" href="#接受-offer-后-创建-answer-并发送" aria-hidden="true">#</a> 接受 Offer 后 创建 Answer 并发送</h4><div class="language-js"><pre><code>socket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;offer&#39;</span><span class="token punctuation">,</span> offer<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token comment">// 将 Offer 保存为远程描述；</span>\n  remotePc <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RTCPeerConnection</span><span class="token punctuation">(</span>rtcConfig<span class="token punctuation">)</span>\n  <span class="token keyword">await</span> remotePc<span class="token punctuation">.</span><span class="token function">setRemoteDescription</span><span class="token punctuation">(</span>offer<span class="token punctuation">)</span>\n  <span class="token keyword">let</span> remoteAnswer <span class="token operator">=</span> <span class="token keyword">await</span> remotePc<span class="token punctuation">.</span><span class="token function">createAnswer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n  <span class="token keyword">await</span> remotePc<span class="token punctuation">.</span><span class="token function">setLocalDescription</span><span class="token punctuation">(</span>remoteAnswer<span class="token punctuation">)</span>\n  socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;answer&#39;</span><span class="token punctuation">,</span> remoteAnswer<span class="token punctuation">)</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><h4 id="接受-answer-存储为远程描述"><a class="header-anchor" href="#接受-answer-存储为远程描述" aria-hidden="true">#</a> 接受 Answer 存储为远程描述</h4><div class="language-js"><pre><code><span class="token comment">// 4. 发起方接收到 Answer 类型的 SDP 后保存到远程描述，此时发起方也已知道连接双方的配置；</span>\nsocket<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&#39;answer&#39;</span><span class="token punctuation">,</span> answer<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token comment">// 将 Answer 保存为远程描述；</span>\n  <span class="token keyword">await</span> localPc<span class="token punctuation">.</span><span class="token function">setRemoteDescription</span><span class="token punctuation">(</span>answer<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><p>至此，媒体协商结束，紧接着在 WebRTC 底层会收集<code>Candidate</code>，并进行连通性检测，最终在通话双方之间建立起一条链路来。</p><h2 id="第六步：端与端建立连接"><a class="header-anchor" href="#第六步：端与端建立连接" aria-hidden="true">#</a> 第六步：端与端建立连接</h2><p>媒体协商结束后，双端统一了传输协议、编解码器等，此时就需要建立连接开始音视频通信了。</p><p>但 WebRTC 既要保持音视频通信的<strong>质量</strong>，又要保证<strong>联通性</strong>。所有，当同时存在多个有效连接时，它首先选择传输质量最好的线路，如能用内网连通就不用公网，优先 P2P 传输，如果 P2P 不通才会选择中继服务器（relay），因为中继方式会增加双端传输的时长。</p><h3 id="什么是-candidate"><a class="header-anchor" href="#什么是-candidate" aria-hidden="true">#</a> 什么是 Candidate</h3><p>第五步最后，我们提到了媒体协商结束后，开始收集 Candidate，那么我们来了解下什么是 Candidate、以及它的作用是什么？</p><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/icecandidate_event" target="_blank" rel="noopener noreferrer">ICE Candidate</a>（ICE 候选者）：表示 WebRTC 与远端通信时使用的协议、IP 地址和端口，结构如下：</p><div class="language-js"><pre><code><span class="token punctuation">{</span>\n  <span class="token literal-property property">address</span><span class="token operator">:</span> xxx<span class="token punctuation">.</span>xxx<span class="token punctuation">.</span>xxx<span class="token punctuation">.</span>xxx<span class="token punctuation">,</span> <span class="token comment">// 本地IP地址</span>\n  <span class="token literal-property property">port</span><span class="token operator">:</span> number<span class="token punctuation">,</span> <span class="token comment">// 本地端口号</span>\n  <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;host/srflx/relay&#39;</span><span class="token punctuation">,</span> <span class="token comment">// 候选者类型</span>\n  <span class="token literal-property property">priority</span><span class="token operator">:</span> number<span class="token punctuation">,</span> <span class="token comment">// 优先级</span>\n  <span class="token literal-property property">protocol</span><span class="token operator">:</span> <span class="token string">&#39;udp/tcp&#39;</span><span class="token punctuation">,</span> <span class="token comment">// 传输协议</span>\n  <span class="token literal-property property">usernameFragment</span><span class="token operator">:</span> string <span class="token comment">// 访问服务的用户名</span>\n  <span class="token operator">...</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p><img src="/blog/_assets/ice-candidate-demo.508081a4.png" alt="ice-candidate-demo.png"></p><p>WebRTC 在进行连接测试后时，通信双端会提供众多候选者，然后按照优先级进行连通性测试，测试成功就会建立连接。</p><p>候选者 Candidate 类型，即 type 分为三种类型：</p><ul><li><p>host：本机候选者</p><p>优先级最高，host 类型之间的连通性测试就是内网之间的连通性测试，P2P</p></li><li><p>srflx：内网主机映射的外网地址和端口</p><p>如果 host 无法建立连接，则选择 srflx 连接，即 P2P 连接</p></li><li><p>relay：中继候选者</p><p>优先级最低，只有上述两种不存在时，才会走中继服务器的模式，因为会增加传输时间，优先级最低</p></li></ul><h4 id="如何收集-candidate"><a class="header-anchor" href="#如何收集-candidate" aria-hidden="true">#</a> 如何收集 Candidate</h4><p>我们已经了解了 Candidate 的三种类型以及各自的优先级，那么我们看下双端是如何收集 Candidate 的。</p><h5 id="host-类型"><a class="header-anchor" href="#host-类型" aria-hidden="true">#</a> host 类型</h5><p>host 类型的 Candidate 是最好收集的，就是本机的 ip 地址 和端口</p><h5 id="srflx-和-relay-类型"><a class="header-anchor" href="#srflx-和-relay-类型" aria-hidden="true">#</a> srflx 和 relay 类型</h5><p>srflx 类型的 Candidate 就是内网通过 NAT（Net Address Translation，作用是进行内外网的地址转换，位于内网的网关上）映射后的外网地址。如：访问百度时 NAT 会将主机内网地址转换为外网地址，发送请求到百度的服务器，服务器返回到公网地址和端口，在通过 NAT 转到内网的主机上。 <img src="/blog/_assets/net-address.2faac727.png" alt="net-address.png"></p><p>那 WebRTC 是怎么处理 NAT 的呢？</p><p>没错，就是我们上面提到的 <strong>STUN</strong> 和 <strong>TURN</strong></p><h5 id="stun-协议"><a class="header-anchor" href="#stun-协议" aria-hidden="true">#</a> STUN 协议</h5><p>全称 Session Traversal Utilities for NAT（NAT 会话穿越应用程序），是一种网络协议，它允许位于 NAT 后的客户端找出自己的公网地址，也就是<strong>遵守这个协议就可以拿到自己的公网 IP</strong>。</p><p>STUN 服务可以直接使用 google 提供的免费服务 <code>stun.l.google.com:19302</code>，或者自己搭建。</p><h5 id="turn-协议"><a class="header-anchor" href="#turn-协议" aria-hidden="true">#</a> TURN 协议</h5><p>全称 Traversal Using Relays around NAT（使用中继穿透 NAT），STUN 的中继扩展。简单的说，TURN 与 STUN 的共同点都是通过修改应用层中的私网地址达到 NAT 穿透的效果，异同点是 TURN 是通过两方通讯的“中间人”方式实现穿透。</p><blockquote><p>上面提到的 relay 服务就是通过 TURN 协议实现的，所以 relay 服务器和 TURN 服务器是同一个意思，都是中继服务器。</p></blockquote><p>relay 类型的 Candidate 获取是通过 TURN 协议完成，它的<strong>连通率是所有候选者中连通率最高的</strong>，优先级也是最低的。</p><p>WebRTC 首会先使用 STUN 服务器去找出自己的 NAT 环境，然后试图找出打“洞”的方式，最后试图创建点对点连接。 当它尝试过不同的穿透方式都失败之后，为保证通信成功率会启用 TURN 服务器进行中转，此时所有的流量都会通过 TURN 服务器。这时如果 TURN 服务器配置不好或带宽不够时，通信质量就会变差。</p><p><strong>重点：STUN 服务器是用来获取外网地址进行 P2P；而 TURN 服务器是在 P2P 失败时进行转发的</strong></p><h5 id="nat-打洞-p2p-穿越"><a class="header-anchor" href="#nat-打洞-p2p-穿越" aria-hidden="true">#</a> NAT 打洞/P2P 穿越</h5><p>NAT 解决了 IPv4 地址不够用的情况，但因为有了 NAT，端与端之间的网络连接变得复杂，也就需要 NAT 穿越等技术。</p><p>收集完 Candidate 后，WebRTC 就按照优先级顺序进行连通性检测。如果双方位于同一个局域网，就会直接建立连接，如果不在同一个局域网内，WebRTC 就会尝试 NAT 打洞，即 P2P 穿越了。</p><h5 id="ice"><a class="header-anchor" href="#ice" aria-hidden="true">#</a> ICE</h5><p>全称 Interactive Connectivity Establishment（交互式连通建立方式），ICE 协议通过一系列的技术（如 STUN、TURN 服务器）帮助通信双方发现和协商可用的公共网络地址，从而实现 NAT 穿越，也就是上面说的获取所有候选者类型的过程，即：在本机收集所有的 host 类型的 Candidate，通过 STUN 协议收集 srflx 类型的 Candidate，使用 TURN 协议收集 relay 类型的 Candidate。</p><h3 id="代码部分"><a class="header-anchor" href="#代码部分" aria-hidden="true">#</a> 代码部分</h3><p>当 Candidate 被收集之后，会触发<code>icecandidate</code>事件，所以需要在代码中监听此事件，以对收集到的 Candidate 做处理。</p><div class="language-js"><pre><code>localPc<span class="token punctuation">.</span><span class="token function-variable function">onicecandidate</span> <span class="token operator">=</span> <span class="token keyword">function</span> <span class="token punctuation">(</span><span class="token parameter">event</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token comment">// 回调时，将自己candidate发给对方，对方可以直接addIceCandidate(candidate)添加可以获取流</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span>event<span class="token punctuation">.</span>candidate<span class="token punctuation">)</span> socket<span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token string">&#39;candidate&#39;</span><span class="token punctuation">,</span> event<span class="token punctuation">.</span>candidate<span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>打印出的 Candidate 如下所示： <img src="/blog/_assets/on-icecandidate.31636f0a.png" alt="on-icecandidate.png"></p><p>与我们上面提到的 Candidate 结构一致，其中<code>type</code>字段为<code>host</code>，即本机候选者。</p><p>对端接收到发送的 candidate 后，再调用 RTCPeerConnection 对象的 addIceCandidate() 方法将收到的 Candidate 保存起 来，然后按照 Candidate 的优先级进行连通性检测。</p><div class="language-js"><pre><code><span class="token keyword">await</span> remotePc<span class="token punctuation">.</span><span class="token function">addIceCandidate</span><span class="token punctuation">(</span>candidate<span class="token punctuation">)</span>\n</code></pre></div><p>如果 Candidate 连通性检测完成，那么端与端之间就建立了物理连接，这时媒体数据就可能通这个物理连接源源不断地传输了 🎉🎉🎉Ï。</p><h2 id="第七步：显示远端流"><a class="header-anchor" href="#第七步：显示远端流" aria-hidden="true">#</a> 第七步：显示远端流</h2><p>通信双方通过 RTCPeerConnection 建立连接后，本地的音视频数据源源不断的传输，要想在远端展示出来，就需要将 RTCPeerConnection 对象与<code>&lt;video&gt;</code>或<code>&lt;audio&gt;</code>进行绑定。</p><p>当远端创建好 RTCPeerConnection 对象后，会为 RTCPeerConnection 绑定<code>ontrack</code>事件，当有音视频数据流到来时，输入参数 event 中包含了远端的音视频流，即 MediaStream 对象，此时将此对象赋值给<code>&lt;video&gt;</code>或<code>&lt;audio&gt;</code>的<code>srcObject</code>字段，这样 RTCPeerConnection 对象就与<code>&lt;video&gt;</code>或<code>&lt;audio&gt;</code>进行了绑定，音频或视频就能展示出来。</p><div class="language-js"><pre><code>remotePc<span class="token punctuation">.</span><span class="token function-variable function">ontrack</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">e</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  video<span class="token punctuation">.</span>srcObject <span class="token operator">=</span> e<span class="token punctuation">.</span>streams<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>\n  video<span class="token punctuation">.</span><span class="token function-variable function">oncanplay</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> video<span class="token punctuation">.</span><span class="token function">play</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>至此，一个完整的 WebRTC 通信过程就结束了。</p><h2 id="最后"><a class="header-anchor" href="#最后" aria-hidden="true">#</a> 最后</h2><p>本文主要是针对小白的 WebRTC 扫盲教程，接下来会详细讲解一对一的音视频聊天，多人聊天，以及使用 Livekit 快速搭建多人音视频聊天系统。</p><p>可以先体验我已经做好的 WebRTC 一对一视频聊天 👇👇👇</p><p><a href="https://wangxiang.website/" target="_blank" rel="noopener noreferrer">👉🏻 在线体验地址</a><a href="https://github.com/wang1xiang/webrtc-demo/tree/master/04-one-to-one" target="_blank" rel="noopener noreferrer">👉🏻 完整代码地址</a></p><p>以上就是本文的全部内容，希望这篇文章对你有所帮助，欢迎点赞和收藏 🙏，如果发现有什么错误或者更好的解决方案及建议，欢迎随时联系。</p>',153)];t.render=function(s,e,t,o,c,r){return n(),a("div",null,p)};export{e as __pageData,t as default};