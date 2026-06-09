---
title: "Claude-Code-插件-security-guidance-与-Webwright-框架调研"
published: 2026-05-27
description: "2026-05-26，Claude Code 生态有两个值得关注的更新："
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# Claude Code 插件 security-guidance 与微软 Webwright 框架调研

## 背景

2026-05-26，Claude Code 生态有两个值得关注的更新：

1. Anthropic 官方发布 `security-guidance` 插件，可在编码时实时识别并修复安全漏洞
2. 微软开源 `Webwright` 框架，采用"代码即动作"设计，在终端实现 Web Agent 自动化

## security-guidance 插件

**来源**：Anthropic 官方开发者账号 [@ClaudeDevs](https://x.com/ClaudeDevs)

### 功能

- 在 Claude Code 对话过程中**实时**做安全审查，不是事后扫描
- 识别潜在漏洞：SQL 注入、XSS、不安全的正则、路径遍历等
- 给出修复建议

### 安装

```
/plugin install security-guidance
/reload-plugins
```

### 适用场景

- 写后端/Node.js 的开发者（安全漏洞代价高）
- 项目安全漏洞面较大的场景
- 需要实时编码安全提示的场景

### 建议

先开启使用 1-2 周，观察两点：

1. **误报率** — 是否经常把正常代码标红？误报太高会影响心流
2. **覆盖面** — 能否抓到真正有风险的点，而非只提示显而易见的错误

体验好则保留，不好可随时 `/plugin uninstall security-guidance` 卸载。

---

## Webwright 框架

**来源**：微软开源项目 [github.com/microsoft/webwright](https://github.com/microsoft/webwright)

### 核心设计：代码即动作

传统 Web Agent 采用"观察 → 预测下一步点击 → 执行"的循环，每一步都依赖 LLM 判断。

Webwright 的做法更贴近软件工程师思维：

- **让 LLM 写 Playwright 脚本** — 把网页操作变成可运行的 Python 程序
- **工作区即状态** — 脚本、截图、日志保存在本地，浏览器会话可随时重建
- **终端优先** — 核心循环只有三个模块约 1000 行代码，无隐藏编排层

这种模式产生的"副产物"是**可复用的自动化程序**，而非一次性交互痕迹。

### 性能表现

| 基准测试                            | 得分               | 备注                |
| ----------------------------------- | ------------------ | ------------------- |
| Online-Mind2Web (300 任务)          | 86.7% (GPT-5.4)    | 开源框架中最高      |
| Odysseys (200 长程任务，平均 76 步) | 60.1% (GPT-5.4)    | 较此前 SOTA +15.6pt |
| Claude Opus 4.7                     | 84.7% / 难例 80.5% | 难例上超越 GPT-5.4  |

### 架构极简

```
Runner (150行) -> Model Endpoint (550行) -> Environment (300行)
```

- 仅依赖 `httpx`、`pydantic`、`playwright`、`typer`
- 无多智能体系统、无图引擎、无插件层
- 支持 OpenAI、Anthropic、OpenRouter 后端

### 与 Playwright 的区别

|          | Playwright                       | Webwright                                              |
| -------- | -------------------------------- | ------------------------------------------------------ |
| 定位     | 浏览器自动化**库**               | AI Web Agent **框架**                                  |
| 谁写代码 | 你手动写 Python/JS 脚本          | LLM 自动生成 Playwright 脚本                           |
| 核心能力 | 控制浏览器、模拟点击、截图、断言 | 任务规划 → 生成脚本 → 执行 → 失败修复 → 保存可复用脚本 |
| 依赖关系 | 底层引擎                         | 依赖 Playwright 作为执行层                             |

**一句话**：Playwright 是方向盘和油门，Webwright 是自动驾驶系统。

### Claude Code 集成

```
/plugin install webwright@webwright
```

支持命令：

- `/webwright:run` — 执行已有脚本
- `/webwright:craft` — 生成新脚本

### 关键创新

1. **Task2UI 模式**（2026-05-11 新增）：任务完成后自动渲染为 HTML 应用，结果可视化且可重用
2. **脚本可复用性**：即使是 Qwen-3.5-9B 小模型，在预置工具脚本辅助下也能达到 66.2% 的难例完成率
3. **可审计性**：每次运行保存轨迹、截图、报告，便于调试和回归

### 适用场景

- 让 Claude Code 帮你操作网页（批量填表、抓数据、测试页面流程）
- 需要可复用的网页操作脚本
- 做浏览器自动化但不想手动写 Playwright 脚本

### 建议

有用浏览器自动化需求时值得试用，纯后端开发者可能暂时用不上。装上后先用 `/webwright:craft` 生成几个脚本感受质量，再决定是否保留。
