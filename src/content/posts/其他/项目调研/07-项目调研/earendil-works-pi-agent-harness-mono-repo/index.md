---
title: "earendil-works-pi-Agent-Harness-Mono-Repo"
published: 2026-05-25
description: "高速迭代的开源 AI 编码代理 + 多 provider LLM 抽象 + TUI 库的单仓集合，主打“自扩展编码代理 CLI”，工程实践高度严谨。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# earendil-works/pi Agent Harness Mono Repo

## 一句话定位

高速迭代的开源 AI 编码代理 + 多 provider LLM 抽象 + TUI 库的单仓集合，主打“自扩展编码代理 CLI”，工程实践高度严谨。

## 基本信息

| 项             | 值                                      |
| -------------- | --------------------------------------- |
| Stars / Forks  | 54,190 / 6,460                          |
| 最近提交       | 2026-05-24                              |
| 最近 release   | v0.75.5（2026-05-23），数日内多次小版本 |
| 语言 / License | TypeScript / MIT                        |
| Open issues    | 34                                      |
| 默认分支       | main                                    |

## 解决什么问题

不是 Claude Code 的复制品，差异化定位在“**可被代理自己扩展、provider 无关、TUI 可独立用**”这个组合：

| 包                                | 作用                                               |
| --------------------------------- | -------------------------------------------------- |
| `@earendil-works/pi-coding-agent` | 交互式编码代理 CLI（对标 Claude Code、Codex CLI）  |
| `@earendil-works/pi-agent-core`   | agent runtime + tool calling + state，可独立嵌入   |
| `@earendil-works/pi-ai`           | 统一多 provider LLM API（OpenAI/Anthropic/Google） |
| `@earendil-works/pi-tui`          | 终端 UI 库，差分渲染（differential rendering）     |

姊妹仓 `earendil-works/pi-chat` 负责 Slack/聊天自动化与 workflow。

## 技术栈与依赖

- Node 22.19+（强制 erasable TS / strip-only mode）
- TypeScript 5.9.3 + **tsgo（TypeScript Native Preview）** 做 typecheck
- **Biome 2.3.5** 替代 ESLint+Prettier
- esbuild、husky、jiti、tsx、shx
- 自有 `@anthropic-ai/sandbox-runtime`
- 所有外部直接依赖**精确 pin**，工作区内部包用 range
- npm workspaces monorepo，`packages/*` + `coding-agent/examples/extensions/*`

## 关键文件/目录

```
packages/agent/                                # agent runtime
packages/ai/                                   # 多 provider LLM 抽象
packages/ai/src/models.generated.ts            # 不可手改，必须通过 scripts/generate-models.ts
packages/coding-agent/                         # CLI 入口
packages/coding-agent/test/suite/harness.ts    # faux provider 测试 harness
packages/coding-agent/npm-shrinkwrap.json      # 发布产物，钉死传递依赖
packages/tui/                                  # 差分渲染 TUI 库
scripts/check-pinned-deps.mjs
scripts/check-ts-relative-imports.mjs
scripts/generate-coding-agent-shrinkwrap.mjs
scripts/local-release.mjs
scripts/release.mjs
AGENTS.md                                      # ⭐ AI + 人协作的硬规则
CONTRIBUTING.md                                # 新贡献者门槛（auto-close / lgtm / lgtmi）
.npmrc                                         # save-exact=true, min-release-age=2
```

## 基本使用方式

个人试用（**不要 clone 源码**）：

```bash
npm install -g @earendil-works/pi-coding-agent
pi
```

源码开发：

```bash
npm install --ignore-scripts
npm run build                                  # tui → ai → agent → coding-agent
npm run check                                  # biome → pinned-deps → ts-imports → shrinkwrap → tsgo → browser-smoke
./test.sh                                      # 跳过需要真实 LLM key 的 e2e
./pi-test.sh                                   # 从源码跑 pi，任意目录可用
```

## 维护状态

**极度活跃**。两周内连续发了 v0.74.x → v0.75.5，单日多次提交。新贡献者 issue/PR 默认 auto-close，需 maintainer 标 `lgtm`/`lgtmi`，质量门槛硬。

## 优点

1. **工程实践教科书级**：依赖锁版本 + `min-release-age=2` + npm shrinkwrap + lockfile 提交防护 + lifecycle script allowlist + `npm audit signatures` 定时跑。
2. **AGENTS.md 极清晰**：直接给出“哪些 git 命令禁用、什么时候用 `--ignore-scripts`、faux provider 怎么写、tmux 怎么测 TUI”等可直接抄走的规则。
3. **包边界干净**：`pi-ai` 可独立做多 provider LLM 接入；`pi-tui` 可独立做 TUI；`pi-agent-core` 可嵌入自己的 CLI。
4. **真实工程化的 monorepo**：lockstep 版本、`release:patch/minor`、本地 release smoke test、Bun + Node 双产物。
5. **数据反哺机制**：鼓励用户把 OSS coding session 公开发到 HuggingFace（`badlogic/pi-share-hf`），作为模型训练素材。

## 风险和限制

1. **版本节奏太快**：一周 5 个 release，pin 一个版本是使用者自己的事。
2. **新贡献者门槛硬**：issue/PR 默认 auto-close，没有 maintainer review 走不通。
3. **工具链激进**：tsgo、erasable TS、Biome 全套替换 ESLint+Prettier+tsc。想 fork 改造的话要接受这套工具栈或重建。
4. **架构与 Claude Code 高度重合**：核心交互（TUI + tool calling + skills 类扩展）思路相近，差异化在 provider 无关 + 自扩展。
5. **强约束的 git 工作流**：禁 `git reset --hard`、`git add -A`、`git stash`、`--no-verify`；为多 session 并行设计，单人单仓显得繁琐。
6. **skill / extension 生态成熟度未确认**：例子仓有 `coding-agent/examples/extensions/`，但是否有类似 Claude Code skill marketplace 的可发现机制未确认。

## 适合谁用

- 想要 **provider 无关**的 coding agent CLI，不想锁在 Anthropic。
- 想把 agent runtime **嵌进自家 CLI/IDE**：`pi-agent-core` + `pi-ai` 拆开用。
- 想抄工程实践：依赖锁定、shrinkwrap、lockfile 防护、faux provider 测试、tmux TUI 测试。
- 想做差分渲染 TUI 库选型：`pi-tui` 独立可用。

## 不适合谁用

- 想要稳定 LTS 版本。
- 想自己 fork 大改：版本节奏 + 严苛工具链让 fork 很快脱节。
- 想在企业内推动统一编码代理：还在快速迭代，不适合做长期标准。
- 不熟悉 TypeScript / Node 22 现代工具链：tsgo + erasable TS + Biome 上手不友好。

## 与替代方案对比

| 方案                 | 与 pi 关系                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| Claude Code          | 同类，CC 绑 Anthropic；pi provider 无关 + 开源 + 自扩展。CC 当前生态更成熟（skills/hook/plugin marketplace）。 |
| Codex CLI / OpenCode | 同类开源代理；pi 工程化程度（依赖治理、release）更严肃。                                                       |
| aider / continue     | aider 偏 git-native pair programming；continue 偏 IDE 插件，用户目标不同。                                     |
| Cline / Roo          | VS Code 插件形态，pi 是 CLI/TUI。                                                                              |

## 建议

1. **个人用 CLI**：`npm install -g @earendil-works/pi-coding-agent` 直接试，**不要 clone 源码**，版本节奏跟不上。
2. **学工程实践**：重点抄 `AGENTS.md`、`scripts/check-pinned-deps.mjs`、`scripts/generate-coding-agent-shrinkwrap.mjs`、`packages/coding-agent/test/suite/harness.ts`（faux provider）、`.npmrc`、git 防护规则。这些是这个项目最值钱的部分。
3. **不要 fork 做生产改造**：节奏太快、工具链太激进。
4. **关注 `@earendil-works/pi-ai` 单独使用价值**：只想要“一套 SDK 统一调多个 LLM provider”时，比抄 LiteLLM 可能更轻。
5. **观察姊妹仓 `pi-chat`**：Slack/聊天 workflow 是 Claude Code 当前较弱的地方，可对比借鉴。
