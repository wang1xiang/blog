---
title: "Open-Design-开源版-Claude-Design-完整调研"
published: 2026-06-09
description: "OD 不是设计工具，不是 Figma/Sketch 替代品，没有画布、没有属性面板、没有\"设计师视角\"。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: true
---
# Open Design 完整调研：开源版 Claude Design 的定位、能力与落地路径

## 1. 核心定位（破除误解）

**OD 不是设计工具**，不是 Figma/Sketch 替代品，没有画布、没有属性面板、没有"设计师视角"。

**OD 是「Agent 原生前端交付编译器」**：

```
输入：需求字符串 + DESIGN.md 品牌契约
输出：可运行的 .html / .tsx / .vue 代码（不是图片，不是设计稿）
```

它取代的不是 UI 设计师这个职业，而是「根据设计稿手写 CSS / 还原 UI」这个前端工种的中间环节。

| 对比维度   | Figma                   | OD                                 |
| :--------- | :---------------------- | :--------------------------------- |
| 输出格式   | `.fig` 设计稿（图片）   | `.html` / `.tsx` / `.vue` 真实代码 |
| 是否可运行 | ❌ 需要前端翻译         | ✅ 双击就在浏览器跑                |
| 品牌一致性 | 设计师人肉对齐 + 组件库 | DESIGN.md 机械强制执行             |
| 接入生产   | 还要 3 天开发           | 30 分钟接接口上线                  |

## 2. 架构与产品形态

### 2.1 五大工件类型（Studio：一个项目产出所有）

| 类型                 | 说明                                                |
| :------------------- | :-------------------------------------------------- |
| **原型**             | Web/桌面/移动单页 HTML，沙箱 iframe 渲染            |
| **实时仪表盘**       | KPI 大屏，调参面板无刷新重渲染                      |
| **演示文稿**         | 15 套 Deck 模板，导出 PPTX/PDF/HTML                 |
| **图片**             | 93 个可复刻 prompt，品牌级视觉素材                  |
| **HyperFrames 视频** | HTML+CSS+GSAP → headless Chrome+FFmpeg → 确定性 MP4 |

### 2.2 三层组合（核心架构）

```
插件（261 个）   ← 承载可运行的工作流
技能（100+）     ← 承载 Agent 的设计品味
设计系统（150）   ← 承载品牌契约（9 节 DESIGN.md schema）
```

三者都是普通文件，可独立 git 版本控制和发布。

### 2.3 不发自家 Agent，接所有 Agent

OD 不参与 Agent 竞争，做 Agent 生态的基础设施。21 个 Agent 都能接：Claude Code、Codex、Cursor、Copilot、Gemini、OpenCode、Kimi 等。添加新 Agent 只需在 `apps/daemon/src/agents.ts` 加一条记录。

## 3. vs Claude Design

**两者不是同一个赛道的竞品**：

- Claude Design 跟 Figma / v0 / Bolt 竞争——做云端 AI 设计工具
- Open Design 在定义「Agent 原生设计基础设施」这个新品类

| 维度             | Claude Design     | Open Design            |
| :--------------- | :---------------- | :--------------------- |
| 形态             | SaaS 服务（云端） | 本地工具（你的笔记本） |
| Agent            | 仅 Anthropic      | 21 个本地 CLI + BYOK   |
| 数据归属         | 上传到 Anthropic  | `.od/` 本地，无遥测    |
| 付费             | Anthropic 订阅    | 开源 + BYOK            |
| 演示文稿/视频    | ❌                | ✅ 一等公民            |
| 现有代码库刷品牌 | ❌                | ✅ git + DESIGN.md     |
| Qwen/Kimi 网关   | ❌ 接不了         | ✅ BYOK 直接接         |

**对个人选型**：用 Qwen 网关 + 已用 Claude Code 的场景，Open Design 是唯一可行的、功能完整的 Agent 原生设计方案。

## 4. 对前端开发的真实价值

### 4.1 能直接出 UI 的场景（替代率）

| 场景                           | 替代率 |
| :----------------------------- | :----- |
| 营销页 / 落地页 / 静态产品官网 | 90%+   |
| 演示文稿 / Deck                | 95%    |
| 仪表盘 / 数据展示              | 80%    |
| 简单 CRUD 后台                 | 60%    |
| C 端复杂交互（短视频/购物）    | 30%    |
| B 端复杂工作流（CRM/ERP）      | 20%    |
| 多页面完整产品                 | 10%    |

### 4.2 OD 干不了的边界

- 复杂交互逻辑（多步骤状态机、富文本编辑、实时协作）
- 真正的 UX 决策（Modal 时机、错误提示策略、加载状态选择）
- 复杂业务场景的信息架构（权限分级、长流程拆分）
- 跨页面的设计一致性（产品级体验管理）

### 4.3 为什么不是直接让 Claude Code 写代码就行

**核心区别：品牌一致性**

| 方式               | 第 1 次  | 第 10 次 | 第 100 次  |
| :----------------- | :------- | :------- | :--------- |
| Claude Code 直接写 | 还行     | 开始走样 | 100 种风格 |
| OD + DESIGN.md     | 符合规范 | 完全一致 | 1 种风格   |

Claude Code 没有"记忆"，OD 的核心价值是**所有输出强制对齐同一个 DESIGN.md 契约**。

## 5. 安装与使用全流程（含踩坑）

### 5.1 文档严重过时的几个点

调研时验证了 README 多处**误导/过时**信息：

| README 写的                                                    | 实际情况                                          |
| :------------------------------------------------------------- | :------------------------------------------------ |
| `curl -fsSL https://open-design.ai/install.sh \| sh -s claude` | ❌ install.sh 不存在，URL 返回首页 HTML           |
| `od mcp install <agent>` 一行命令                              | ❌ 没有 `od` 二进制，GitHub Releases 只有桌面 DMG |
| daemon 端口 `7456`                                             | ❌ 实际是动态分配，本次启动是 `61096`             |
| 「21 个 CLI 适配器」                                           | ⚠️ 是规划/愿景，当前 release 实际只有 MCP server  |

**唯一真正可用的两个安装路径**：

1. 桌面应用（GitHub Release DMG / 官方 CDN）
2. `npm install -g open-design-mcp`（依赖桌面应用启动 daemon）

### 5.2 完整安装步骤（实测可用）

**Step 1：装桌面应用**

```bash
# 249MB，官方 CDN 国内可达
curl -L "https://releases.open-design.ai/stable/versions/0.9.0/open-design-0.9.0-mac-arm64.dmg" \
  -o ~/Downloads/open-design-0.9.0-mac-arm64.dmg
# 双击 DMG 拖到 /Applications
```

**Step 2：启动应用让 daemon 启动**

```bash
open -a "Open Design"
```

启动后 daemon 会在动态端口监听，401 个 bundled 插件会自动注册。

**Step 3：找到 daemon 真实端口**

```bash
cat "/Users/xiangwang/Library/Application Support/Open Design/namespaces/release-stable/logs/daemon/latest.log" | tail -10
# 找 "url": "http://127.0.0.1:XXXXX"
```

或者直接读 daemon 元数据：

```bash
# daemon 信息在日志末尾的 JSON 块里
grep -o 'http://127.0.0.1:[0-9]*' "/Users/xiangwang/Library/Application Support/Open Design/namespaces/release-stable/logs/daemon/latest.log" | tail -1
```

**Step 4：安装 MCP server 并接入 Claude Code**

```bash
# 装 npm 包
npm install -g open-design-mcp

# 加到 Claude Code（注意带环境变量）
claude mcp add open-design \
  --scope user \
  -e OD_DAEMON_URL=http://127.0.0.1:61096 \
  -- open-design-mcp

# 验证
claude mcp list | grep open-design
# 应显示：open-design: open-design-mcp - ✓ Connected
```

### 5.3 关键踩坑记录

| 坑                  | 现象                                                     | 解决                                         |
| :------------------ | :------------------------------------------------------- | :------------------------------------------- |
| MCP 装好直接连不上  | `✗ Failed to connect`                                    | 必须先启动桌面应用、daemon 起来              |
| 缺环境变量          | `FATAL: invalid core env vars - OD_DAEMON_URL: Required` | `claude mcp add` 时用 `-e OD_DAEMON_URL=xxx` |
| 端口不是 7456       | 文档说 7456，实际是 61096 等动态端口                     | 从 daemon 日志读真实端口                     |
| daemon 重启端口会变 | 重启电脑或退出应用后 MCP 断连                            | 需要写个脚本自动读最新端口（未实施）         |
| node 版本警告       | `EBADENGINE undici@7.27.2 require >=20.18.1`             | 当前 node 18.18 警告但能用，未阻塞           |

## 6. MCP 工具清单（10 个）

| 工具                   | 类型                 | 用途                                     |
| :--------------------- | :------------------- | :--------------------------------------- |
| `od_list_projects`     | read                 | 列出所有项目                             |
| `od_get_project`       | read                 | 读项目详情 + 文件                        |
| `od_create_project`    | write                | 新建项目                                 |
| `od_update_project`    | write                | 更新项目设置                             |
| `od_delete_project`    | write                | 删除项目（不可逆）                       |
| `od_save_artifact`     | write                | 保存 HTML 工件到全局                     |
| `od_save_project_file` | write                | 保存文件到项目（UI 可见）                |
| `od_lint_artifact`     | validate             | Lint 检查 HTML                           |
| `od_compose_brief`     | format               | 格式化 Turn 3 prompt（纯函数）           |
| `od_generate_design`   | generate (streaming) | **核心**：流式生成设计，需 BYOK 环境变量 |

只有 `od_generate_design` 需要 BYOK：`BYOK_BASE_URL` + `BYOK_API_KEY` + `BYOK_MODEL`，其他 9 个工具只需 `OD_DAEMON_URL`。

## 7. 8 种任务类型详解（选错产物形态会差很多）

OD 创建项目时会让你先选「任务类型」，决定输出形态。

### 7.1 一览表

| 类型              | 输出形态         | 一句话说清楚                | 典型场景                     |
| :---------------- | :--------------- | :-------------------------- | :--------------------------- |
| **Prototype**     | 单页 HTML        | 静态网页，能看能点          | 落地页、产品介绍页、个人主页 |
| **Live artifact** | 可交互单页 HTML  | 带数据 + 调参面板的"活"页面 | 仪表盘、决策室、数据展示     |
| **Slide deck**    | 多页 HTML/PPTX   | 演示文稿                    | 周报、技术分享、汇报 PPT     |
| **Image**         | PNG/JPG/SVG      | 一张静态图片                | 小红书封面、插画、海报       |
| **Video**         | MP4              | 真实画面的视频              | 短视频开场、产品宣传片       |
| **HyperFrames**   | MP4（HTML 渲染） | 程序化动效视频，完全确定性  | KPI 增长动画、数据可视化     |
| **Audio**         | MP3              | 音频文件                    | 视频配音、播客片头           |
| **Other**         | 自定义           | 不在上述分类里的兜底选项    | SVG icon set、设计规范文档   |

### 7.2 每类详细说明

#### Prototype（原型）— 最高频

- 输出：一个 `.html` 文件，CSS 内联，双击就能打开
- 有 hover/点击等基础交互，不连真实数据
- 可直接当生产代码用或作前端还原参考
- 适合：产品官网、招聘页、营销活动页、移动端 App 原型（含设备外框）

#### Live artifact（可交互工件）

- 输出：带**调参面板**的 HTML，原地改数据/参数无刷新重渲染
- 包含 manifest + iframe 渲染逻辑
- 数据可 mock 也可接真实 API
- 适合：KPI 大屏、运营看板、决策室、A/B 测试结果展示、财务报表
- **vs Prototype**：Prototype 是"看的"，Live artifact 是"用的"

#### Slide deck（演示文稿）

- 输出：多页结构化文档，导出 `.pptx` / `.pdf` / `.html`（单文件）/ `.zip`
- 内置 15 套 Deck 模板 + 36 个主题（杂志风格、瑞士国际风、路演风等）
- 支持键盘翻页、动画、章节导航
- 适合：周报/月报、技术分享、产品发布会、客户提案、教学课件
- **技巧**：直接粘 markdown 文档，让 OD 自动拆章节

#### Image（图片）

- 输出：PNG/JPG/SVG 单张或多张
- 内置 93 个可复刻 prompt 模板（手绘、电影感、赛博朋克、棚拍人像等）
- 支持高分辨率 + 指定宽高比（1:1 / 3:4 / 16:9）
- 多模型路由（gpt-image-2 / ImageRouter / 自定义 API）
- 适合：小红书封面（1080×1440）、公众号封面、信息图、插画、海报
- **vs Prototype**：Image 是真图片文件，可直接发社交平台

#### Video（视频）

- 输出：MP4，AI 模型直接生成画面
- 通过 Seedance 2.0、Veo 3、Sora 2、Kling 2 路由
- 支持 t2v（文生视频）和 i2v（图生视频）
- 适合：产品宣传片、短视频开场、抖音/小红书视频、vlog 转场
- ⚠️ **成本最高**（既贵又慢），轻易不用

#### HyperFrames（程序化动效视频）— OD 杀手锏

- 输出：MP4，但底层是 **HTML+CSS+GSAP 代码渲染**
- 流程：Agent 写代码 → headless Chrome 渲染 → FFmpeg 导出
- **完全确定性**：同样代码每次输出一模一样
- 可缓存、可复现、可微调
- 适合：KPI 增长动画（0→10K 计数器）、数据柱状图竞赛（NYT 风格）、网站功能演示、Logo 动画、TikTok 卡拉 OK 字幕、航线图

**Video vs HyperFrames 关键区别**：

| 维度     | Video                | HyperFrames        |
| :------- | :------------------- | :----------------- |
| 渲染方式 | AI 模型生成画面      | HTML 代码渲染      |
| 可控性   | 低（AI 自己理解）    | 高（代码精确控制） |
| 成本     | 高                   | 低                 |
| 可复现   | 不可（每次都不一样） | 完全可复现         |
| 适合场景 | 需要真实画面         | 需要精准动效       |

#### Audio（音频）

- 输出：MP3，通过 Suno v5、Lyria 2 等模型
- 可生成 BGM、配音、音效
- 适合：视频背景音乐、播客片头、App 提示音
- 偶尔用，**不是日常高频**

#### Other（其他）

- 兜底选项，让你自己描述要什么
- 适合：SVG icon set、品牌设计规范文档、自定义格式输出
- **99% 用不到**，前 7 个分类覆盖所有日常需求

### 7.3 选型决策树

```
你要做的东西：
│
├── 给人看的网页 → Prototype
│
├── 给人用的可交互页面（有数据、有参数）→ Live artifact
│
├── 给人讲的 PPT → Slide deck
│
├── 静态图片（发社交、做封面）→ Image
│
├── 动态视频
│   ├── 真实画面（人物、风景、产品镜头）→ Video
│   └── 数据/UI 动效（精准可控）→ HyperFrames
│
├── 音频 → Audio
│
└── 都不是 → Other
```

### 7.4 个人场景对应

| 你的需求                   | 选什么        |
| :------------------------- | :------------ |
| 写个博客 / 产品官网        | Prototype     |
| 给项目做仪表盘             | Live artifact |
| 周报 / 技术分享 / 月报     | Slide deck    |
| 小红书爆款笔记封面         | Image         |
| 涨粉数据动画、技术分享开场 | HyperFrames   |
| 个人 IP 介绍视频           | Video         |

## 8. 已知未解决问题

1. **daemon 端口动态化**：每次重启端口变，MCP 连接需要更新环境变量。需要写个 wrapper 脚本自动读 daemon 日志拿端口。
2. **Qwen 网关 BYOK 未测试**：DashScope 的 Anthropic 兼容端点是否能用、配置参数还需要实测。
3. **桌面应用与 MCP 是否要同时开**：daemon 是桌面应用启动的，关掉应用 MCP 就断了。后台运行方案待研究。

## 8. 下一步行动

| 优先级 | 任务                                                       |
| :----- | :--------------------------------------------------------- |
| 🔥 高  | 用 GUI 出一个 landing page，验证代码质量是否达预期         |
| 🔥 高  | 把项目组件库规范提炼成一份 DESIGN.md，做 A/B 对比          |
| 中     | 测试 BYOK 接 Qwen 网关，跑通 `od_generate_design`          |
| 中     | 写 daemon 端口自动检测脚本，让 MCP 重启后能自动连上        |
| 低     | 评估是否把 OD 集成进日常 Claude Code 工作流，还是只 GUI 用 |

## 9. 关联资料

- 同目录：OpenAI-Codex-Use-Cases-案例库深度调研（OpenAI 的对标产品策略）
- 同目录：OpenAI-Harness-Engineering-智能体优先方法论调研（背后的方法论）
- 原始项目：<https://github.com/nexu-io/open-design>
- 官网：<https://open-design.ai>
- MCP 包：<https://www.npmjs.com/package/open-design-mcp>
