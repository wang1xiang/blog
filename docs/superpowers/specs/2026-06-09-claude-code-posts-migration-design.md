# Claude Code 文章迁移设计

日期：2026-06-09

## 目标

把 `/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/` 中长期有效的 Claude Code 子主题笔记，批量迁移为博客文章，进入 `src/content/posts/`，让 Astro content collection 能识别并发布。

核心目标：

- 只迁移适合公开发布的精选子主题，不全量搬运内部笔记。
- 保留原知识库的子主题结构，方便后续维护。
- 轻量清洗内容，不做发布级重写。
- 把 API key、token、secret 等私密内容扫描与处理作为迁移硬门槛。
- 迁移后生成报告，便于复核已迁移、draft、跳过和敏感信息处理情况。

## 迁移范围

### 包含

迁移以下子主题或文件：

```text
Hook配置/
LSP集成/
Skills技能/
Token与缓存机制/
并行开发/
记忆系统/
任务与Agent/
团队落地/ClaudeCode团队落地指南总结.md
```

### 排除

第一批不迁移以下内容：

```text
版本变更/
团队落地/Claude_CLI历史会话汇总_2026-04-28.md
记忆系统/CLAUDE.md
02-主题/01-claude-code/ 根目录下的 3 篇泛文章
```

排除原因：

- `版本变更/` 更像版本流水账，容易稀释专题质量。
- 历史会话汇总偏内部过程文档，不适合作为公开文章。
- `CLAUDE.md` 是规范文件，不作为博客文章发布。
- 根目录泛文章暂不纳入第一批，避免范围扩大。

## 目标目录结构

目标输出到：

```text
src/content/posts/AI工具/Claude Code/
  Hook配置/<slug>/index.md
  LSP集成/<slug>/index.md
  Skills技能/<slug>/index.md
  Token与缓存机制/<slug>/index.md
  并行开发/<slug>/index.md
  记忆系统/<slug>/index.md
  任务与Agent/<slug>/index.md
  团队落地/<slug>/index.md
```

目录设计原则：

- `AI工具` 作为博客分类，避免把单一产品名变成顶级分类。
- `Claude Code/子主题` 保留知识库结构，便于后续维护和扩展。
- 每篇文章采用现有博客风格：`<slug>/index.md`。

## frontmatter 转换

每篇目标文章统一生成博客所需 frontmatter：

```yaml
---
title: "原文标题"
published: 2026-xx-xx
description: "从正文前 80-120 字自动提取，或保留原 description"
tags: ["Claude Code", "子主题名"]
category: "AI工具"
draft: false
---
```

字段来源规则：

| 博客字段      | 来源规则                                                         |
| ------------- | ---------------------------------------------------------------- |
| `title`       | 优先源 frontmatter `title`，否则使用文件名                       |
| `published`   | 优先 `publish_date`，其次 `extracted_date`，最后使用文件修改时间 |
| `description` | 优先源 `description`，否则从正文提取第一段有效文本               |
| `tags`        | 固定加入 `Claude Code` 与子主题名；如原文有 `tags`，合并去重     |
| `category`    | 固定为 `AI工具`                                                  |
| `draft`       | 默认 `false`；发现疑似敏感内容且无法自动判定时设为 `true`        |

原 frontmatter 中这些字段不迁到博客 frontmatter，但可用于迁移报告：

- `type`
- `source`
- `author`
- `account`
- `cover`
- `extracted_date`

如果源 frontmatter 有 `source`，在正文末尾保留原文链接：

```md
---

原文链接：<source>
```

## 内容轻量清洗

只做格式兼容和低风险清理：

1. 去掉原始 frontmatter，替换为博客 frontmatter。
2. 修正 Obsidian 内链：
   - `[[xxx]]` → `xxx`
   - `[[xxx|别名]]` → `别名`
3. 保留普通 Markdown 链接、代码块和标题层级。
4. 清理明显空行堆叠。
5. 不重写段落，不改观点，不增删大段内容。

## 敏感信息处理

迁移必须扫描疑似私密内容，包括：

- 关键词：`api_key`, `apikey`, `token`, `secret`, `password`, `authorization`, `bearer`
- 环境变量：`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GITHUB_TOKEN`, `BYOK_API_KEY`
- 常见密钥形态：`sk-...`, `ghp_...`, `xoxb-...`
- 带 `key=`, `token=`, `access_token=` 的 URL

处理规则：

| 情况           | 处理                                        |
| -------------- | ------------------------------------------- |
| 明显真实凭证   | 替换为 `<REDACTED>`                         |
| 明显示例占位符 | 保留                                        |
| 无法判断       | `draft: true`，并在报告中列出文件和命中片段 |

迁移完成后，对生成的新文章再进行一次敏感信息复扫。只要仍有疑似真实凭证，不宣称迁移完成。

## 执行流程

采用全自动批量迁移加报告复核。

1. 构建待迁移文件清单。
   - 只包含已确认的 Claude Code 子主题。
   - 排除 `版本变更/`、`CLAUDE.md`、历史汇总和根目录泛文章。
2. 对每篇文章执行转换。
   - 读取源 frontmatter 和正文。
   - 生成目标目录 slug。
   - 生成博客 frontmatter。
   - 执行轻量清洗。
   - 执行敏感信息扫描与替换或标记 draft。
3. 写入目标路径。
   - 输出为 `src/content/posts/AI工具/Claude Code/<子主题>/<slug>/index.md`。
   - 如果目标路径已存在，不直接覆盖；在报告中标记冲突。
4. 生成迁移报告。
   - 保存到 `docs/migration/claude-code-posts-migration-report.md`。
   - 记录迁移成功、跳过、draft、敏感信息处理、路径冲突等。

## 迁移报告

报告结构：

```md
# Claude Code 文章迁移报告

## 汇总

- 待迁移：N
- 已迁移：N
- 标记 draft：N
- 跳过：N
- 路径冲突：N
- 敏感信息命中：N

## 已迁移文件

| 源文件 | 目标文件 | 标题 | published | tags |

## 敏感信息处理

| 源文件 | 类型 | 处理方式 | 说明 |

## Draft 文件

| 目标文件 | 原因 |

## 跳过文件

| 源文件 | 原因 |
```

## 验证方式

迁移完成后主动验证：

1. 内容结构检查。
   - 所有目标文章都是 `index.md`。
   - frontmatter 满足 `src/content.config.ts` schema。
   - 没有重复目标路径。
2. 敏感信息复扫。
   - 扫描新生成文章中的敏感关键词和密钥形态。
   - 发现疑似真实凭证时，报告并保持相关文件为 draft 或停止发布。
3. 构建验证。
   - 跑项目现有 build / lint 命令。
   - 如果失败来自既有 tsconfig warning 或无关问题，如实报告，不擅自改无关内容。

## 用户影响

- 博客新增更体系化的 `AI工具 / Claude Code` 专题内容区。
- 读者能按子主题浏览，不会被版本流水账干扰。
- 内部笔记不会无脑全量公开，敏感内容会被拦截、替换或标记 draft。
- 后续迁移其他主题时，可以复用这次规则，但当前不做配置化迁移工具，避免过度工程。

## 非目标

- 不迁移整个 markdown 知识库。
- 不做逐篇发布级重写。
- 不设计通用迁移框架。
- 不处理博客 UI 或路由改造，除非验证发现现有多级目录无法正常渲染。
- 不创建 git commit，除非用户明确同意。
