---
title: "Web-Access Skill 安装与 Claude 周报实践记录"
published: 2026-05-20
description: "想让 Claude Code 每周一自动收集最新关于 Claude 的实战文章，整理成周报。但发现 Claude Code 内置的 WebSearch 工具不可用（当前模型 qwen3.6-plus 不支持），需要找一个替代方案。"
tags: ["Skill开发", "04-skill-dev", "web-access", "CDP", "自动化工具"]
category: "AI工具"
image: api
draft: false
---
# Web-Access Skill 安装与 Claude 周报实践

## 背景

想让 Claude Code 每周一自动收集最新关于 Claude 的实战文章，整理成周报。但发现 Claude Code 内置的 WebSearch 工具不可用（当前模型 qwen3.6-plus 不支持），需要找一个替代方案。

## 方案选择

在 GitHub 上发现了 **web-access skill**（eze-is/web-access，5300+ star），核心能力是：

- **多通道联网调度**：WebSearch → WebFetch → Jina → CDP 浏览器，按场景自动选择最优方式
- **CDP 直连 Chrome**：通过 Chrome DevTools Protocol 操控本地浏览器，天然携带登录态
- **站点经验积累**：按域名存储操作经验，跨 session 复用
- **兼容所有支持 SKILL.md 的 Agent**

## 安装过程

### 1. 克隆到 skills 目录

```bash
git clone https://github.com/eze-is/web-access ~/.claude/skills/web-access
```

同时创建了软链接：
```bash
ln -sf ~/.claude/skills/web-access ~/.agents/skills/web-access
```

### 2. 前置检查踩坑

运行 `check-deps.mjs` 时遇到两个问题：

**问题一：Node.js 18 缺少 ws 模块**

```
[CDP Proxy] 错误：Node.js 版本 < 22 且未安装 ws 模块
```

- 第一次 `npm install -g ws` 装到了全局，但 Node 18 的 require 路径找不到
- 最终解决方案：**安装到 skill 本地目录**
  ```bash
  cd ~/.agents/skills/web-access && npm install ws
  ```

**问题二：Chrome 远程调试未开启**

需要在 Chrome 地址栏输入 `chrome://inspect/#remote-debugging`，勾选 **"Allow remote debugging for this browser instance"**。

### 3. 验证成功

```bash
node ~/.agents/skills/web-access/scripts/check-deps.mjs
# 输出：node: warn (v18.18.0, 建议升级到 22+)
#      chrome: ok (port 49465)
#      proxy: ready
```

## Claude 周报 Skill 封装

将搜索需求封装为独立 skill：`claude-weekly-digest`

- 位置：`~/.agents/skills/claude-weekly-digest/SKILL.md`
- 用法：`/claude-weekly-digest` 或直接说"生成 Claude 周报"
- 目标：每周收集 20 篇文章（英文 10 篇 + 中文 10 篇）
- 中文来源：知乎、微信公众号、个人博客
- **排除掘金**：用户反馈质量不行

### 搜索策略

| 类别 | 关键词 | 来源 |
|------|--------|------|
| 英文 | Claude Code tips/best practices/hooks/MCP/prompt engineering | Google + dev.to + Medium + GitHub |
| 中文 | Claude Code 编程技巧/agent 工作流/最佳实践 | 知乎搜索 + 搜狗微信 |

### 抓取方式

- **知乎/微信公众号**：CDP 浏览器（需要 JS 渲染、滚动加载）
- **独立博客/文档**：Jina（r.jina.ai/URL，省 token）

## 定时任务问题

尝试了多种持久化方案，均有局限：

| 方案 | 问题 |
|------|------|
| `CronCreate` | 只支持 session-only，关闭会话就消失，`durable: true` 参数不生效 |
| `/loop` | 最大延迟 3600 秒，无法设周一 9 点，且同样 session-only |
| 系统 crontab | 不依赖 Claude Code，但需要独立脚本 |

**最终方案**：封装为 skill，每周手动触发一次。

## 关键决策

### 为什么需要 CDP？

英文搜索用 WebSearch/Jina 就够了，但中文知乎和微信公众号需要 JS 渲染和滚动加载，纯 HTML 抓取不到内容。CDP 是唯一能拿到完整内容的方案。

### 为什么不用掘金？

用户明确反馈「质量不行」，改为只用知乎 + 微信公众号 + 其他中文博客。

### Token 消耗

每次约 6-10 万 tokens，约 $0.3-$1.5，一周一次成本可接受。

## web-access 在实际开发中的应用

### 1. 调研第三方 API

```
"帮我调研 Supabase 最新认证 API"
```

直接读官方文档，不靠训练记忆，信息实时准确。

### 2. 排查报错

```
"帮我搜索这个错误的最新解决方案"
```

搜索 Stack Overflow、GitHub Issues，找最新修复方案。

### 3. 对比竞品

```
"同时调研 Vercel、Netlify、Cloudflare Pages 的定价"
```

并行分治给子 agent，同时打开三个官网，不串行浪费时间。

### 4. 读取需要登录的页面

```
"帮我看看 Jenkins 上最新的构建记录"
```

直连 Chrome，天然带 cookie，不用重新登录。本次实践中成功读取了 cuiniao_admin 项目的 Jenkins 构建历史，拿到最近 10 次构建状态。

## 踩坑与注意事项

1. **ws 模块必须本地安装**：`npm install -g ws` 在 Node 18 环境下不可用，需要装到 skill 目录下
2. **Chrome 远程调试需要手动开启**：不是一次性的，Chrome 重启后需要重新勾选
3. **Jina 有 20 RPM 限速**：批量抓取时需要注意频率
4. **掘金域名被 Jina 限流**：返回 451 错误，这也是后来排除掘金的原因之一
5. **抖音 DOM 提取困难**：Shadow DOM + 虚拟滚动导致常规 eval 拿不到内容
6. **CDP 不影响日常使用**：可以在同一个 Chrome 里继续浏览，web-access 创建的后台 tab 和用户的 tab 完全隔离

## 总结

web-access 的核心价值不是「它自己有搜索能力」，而在于它是一个**调度层**——知道什么时候该用什么工具。

- 英文静态页面 → WebSearch/Jina，快且省 token
- 中文动态页面（知乎/公众号）→ CDP 浏览器，能渲染能滚动
- 需要登录态 → CDP 直连 Chrome，天然带 cookie

封装成 skill 后，每周只需要一句 `/claude-weekly-digest` 就能自动生成包含 20 篇文章的周报，大幅减少了重复搜索的时间成本。
