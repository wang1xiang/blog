# Claude Code Posts Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已批准范围内的 19 篇 Claude Code 笔记批量迁移到 Astro 博客内容目录，并生成可复核的迁移报告与敏感信息处理记录。

**Architecture:** 新增一个一次性迁移脚本 `scripts/migrate-claude-code-posts.mjs`，脚本负责收集白名单文件、转换 frontmatter、轻量清洗正文、扫描/脱敏疑似凭证、写入 `src/content/posts/AI工具/Claude Code/.../index.md` 并输出报告。新增 `scripts/migrate-claude-code-posts.test.mjs` 使用 Node 内置 test runner 覆盖纯函数，先验证转换规则，再执行真实迁移。

**Tech Stack:** Node.js ESM、`gray-matter`、Node 内置 `node:test` / `node:assert`、Astro content collection、pnpm。

---

## 文件结构

**创建：**

- `scripts/migrate-claude-code-posts.mjs`  
  一次性迁移脚本。暴露纯函数供测试使用；直接执行时执行迁移。

- `scripts/migrate-claude-code-posts.test.mjs`  
  Node 内置测试文件，覆盖日期归一化、slug 生成、Obsidian 内链清洗、描述提取、敏感信息扫描/脱敏和目标路径生成。

- `docs/migration/claude-code-posts-migration-report.md`  
  脚本生成的迁移报告，不手写。

**生成：**

- `src/content/posts/AI工具/Claude Code/Hook配置/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/LSP集成/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/Skills技能/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/Token与缓存机制/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/并行开发/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/记忆系统/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/任务与Agent/<slug>/index.md`
- `src/content/posts/AI工具/Claude Code/团队落地/<slug>/index.md`

**不修改：**

- 不修改现有路由、UI、Astro collection schema。
- 不修改已有 `scripts/migrate.mjs`，避免影响历史迁移脚本。
- 不创建 git commit，除非用户后续明确要求。

---

## 待迁移文件清单

脚本必须只迁移以下 19 个源文件：

```text
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Hook配置/Claude Code Hooks深度解析总结.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Hook配置/Claude-Code-Hook-配置完整记录.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/LSP集成/Claude Code LSP 配置指南.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Skills技能/Claude Code 的 skills 源码解析.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Skills技能/Claude-Code-自定义Command封装.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Skills技能/video-use-视频编辑-skill-安装记录.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Token与缓存机制/Claude-Code-Token-缓存机制解读.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/并行开发/04-Claude Code多会话管理配置.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/并行开发/Claude Code 并行开发完全指南.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/并行开发/claude-code-deepseek-原生API接入.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/并行开发/claude-code-hermes-模型切换同步.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/记忆系统/Claude-Code-三层记忆系统.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/记忆系统/claude-mem完整工作原理调研.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/任务与Agent/Agent-View-后台任务与交互式会话的区别-实践验证.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/任务与Agent/Claude-Code-Agent-View-踩坑与修复实录.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/任务与Agent/Claude-Code-Agent-View-使用指南.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/任务与Agent/Claude-Code-tasks-后台任务详解.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/任务与Agent/Claude-Code-Task系统详解.md
/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/团队落地/ClaudeCode团队落地指南总结.md
```

---

### Task 1: 编写迁移脚本测试

**Files:**

- Create: `scripts/migrate-claude-code-posts.test.mjs`
- Create later in Task 2: `scripts/migrate-claude-code-posts.mjs`

- [ ] **Step 1: 写失败测试**

创建 `scripts/migrate-claude-code-posts.test.mjs`：

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTargetPath,
  cleanContent,
  extractDescription,
  normalizeDate,
  scanAndRedactSensitiveContent,
  slugify,
} from "./migrate-claude-code-posts.mjs";

test("normalizeDate prefers valid date-like strings and strips time", () => {
  assert.equal(normalizeDate("2026-04-07 11:14"), "2026-04-07");
  assert.equal(normalizeDate("2026-4-7"), "2026-04-07");
});

test("normalizeDate falls back to file mtime when source date is missing", () => {
  assert.equal(
    normalizeDate(undefined, new Date("2026-06-09T08:00:00Z")),
    "2026-06-09",
  );
});

test("slugify creates stable readable slugs", () => {
  assert.equal(
    slugify("Claude Code Hooks深度解析总结"),
    "claude-code-hooks深度解析总结",
  );
  assert.equal(
    slugify("04-Claude Code多会话管理配置"),
    "04-claude-code多会话管理配置",
  );
});

test("cleanContent converts Obsidian wiki links and collapses excessive blank lines", () => {
  const input =
    "参考 [[Claude-Code-Hook-配置完整记录|Hook 配置]]\n\n\n\n以及 [[CLAUDE.md]]";
  assert.equal(cleanContent(input), "参考 Hook 配置\n\n以及 CLAUDE.md");
});

test("extractDescription uses the first meaningful paragraph and removes markdown markers", () => {
  const input =
    "# 标题\n\n> 引用不作为摘要\n\n这是第一段有效正文，包含 **加粗** 和 `code`，应该被清理。";
  assert.equal(
    extractDescription(input),
    "这是第一段有效正文，包含 加粗 和 code，应该被清理。",
  );
});

test("scanAndRedactSensitiveContent keeps placeholders but redacts real-looking secrets", () => {
  const input = [
    "ANTHROPIC_API_KEY=YOUR_API_KEY",
    "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890",
    "Authorization: Bearer abcdefghijklmnopqrstuvwxyz1234567890",
  ].join("\n");

  const result = scanAndRedactSensitiveContent(input);

  assert.equal(result.content.includes("YOUR_API_KEY"), true);
  assert.equal(
    result.content.includes("sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"),
    false,
  );
  assert.equal(result.content.includes("<REDACTED>"), true);
  assert.equal(result.findings.length >= 2, true);
});

test("buildTargetPath maps subtopic into AI工具/Claude Code path", () => {
  const source =
    "/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code/Hook配置/Claude Code Hooks深度解析总结.md";
  assert.equal(
    buildTargetPath(source),
    "src/content/posts/AI工具/Claude Code/Hook配置/claude-code-hooks深度解析总结/index.md",
  );
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run:

```bash
node --test scripts/migrate-claude-code-posts.test.mjs
```

Expected:

```text
FAIL
Error [ERR_MODULE_NOT_FOUND]: Cannot find module .../scripts/migrate-claude-code-posts.mjs
```

不要因为失败修改测试；这个失败证明测试先写成功。

---

### Task 2: 实现迁移脚本纯函数

**Files:**

- Create: `scripts/migrate-claude-code-posts.mjs`
- Test: `scripts/migrate-claude-code-posts.test.mjs`

- [ ] **Step 1: 写最小可测试实现**

创建 `scripts/migrate-claude-code-posts.mjs`，先实现纯函数和常量：

````js
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const SOURCE_ROOT =
  "/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code";
const TARGET_ROOT = "src/content/posts";
const REPORT_PATH = "docs/migration/claude-code-posts-migration-report.md";
const CATEGORY = "AI工具";
const SERIES = "Claude Code";

const INCLUDED_FILES = [
  "Hook配置/Claude Code Hooks深度解析总结.md",
  "Hook配置/Claude-Code-Hook-配置完整记录.md",
  "LSP集成/Claude Code LSP 配置指南.md",
  "Skills技能/Claude Code 的 skills 源码解析.md",
  "Skills技能/Claude-Code-自定义Command封装.md",
  "Skills技能/video-use-视频编辑-skill-安装记录.md",
  "Token与缓存机制/Claude-Code-Token-缓存机制解读.md",
  "并行开发/04-Claude Code多会话管理配置.md",
  "并行开发/Claude Code 并行开发完全指南.md",
  "并行开发/claude-code-deepseek-原生API接入.md",
  "并行开发/claude-code-hermes-模型切换同步.md",
  "记忆系统/Claude-Code-三层记忆系统.md",
  "记忆系统/claude-mem完整工作原理调研.md",
  "任务与Agent/Agent-View-后台任务与交互式会话的区别-实践验证.md",
  "任务与Agent/Claude-Code-Agent-View-踩坑与修复实录.md",
  "任务与Agent/Claude-Code-Agent-View-使用指南.md",
  "任务与Agent/Claude-Code-tasks-后台任务详解.md",
  "任务与Agent/Claude-Code-Task系统详解.md",
  "团队落地/ClaudeCode团队落地指南总结.md",
];

const PLACEHOLDER_PATTERN =
  /(?:YOUR|your|example|EXAMPLE|xxx|XXX|placeholder|PLACEHOLDER|<[^>]+>)/;
const SECRET_PATTERNS = [
  { type: "openai-key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { type: "github-token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { type: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { type: "bearer-token", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}\b/gi },
  {
    type: "env-secret",
    pattern:
      /\b(?:ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*([^\s"']{12,})/gi,
  },
  {
    type: "url-token",
    pattern: /([?&](?:key|token|access_token)=)([^\s&#)]{12,})/gi,
  },
];
const SENSITIVE_KEYWORD_PATTERN =
  /\b(api_key|apikey|token|secret|password|authorization|bearer|ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY)\b/i;

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

export function normalizeDate(value, fallbackDate = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (value) {
    const raw = String(value).trim();
    const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      return `${match[1]}-${padDatePart(match[2])}-${padDatePart(match[3])}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return fallbackDate.toISOString().slice(0, 10);
}

export function slugify(title) {
  return String(title)
    .trim()
    .replace(/\.mdx?$/i, "")
    .normalize("NFKC")
    .replace(/[\s_]+/g, "-")
    .replace(/[，。！？、：；（）()【】\[\]{}《》"'“”‘’]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function cleanContent(content) {
  return String(content)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMarkdownInline(value) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDescription(content) {
  const paragraphs = String(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const paragraph = paragraphs.find((item) => {
    return (
      !item.startsWith("#") &&
      !item.startsWith(">") &&
      !item.startsWith("```") &&
      !item.startsWith("---")
    );
  });

  if (!paragraph) return "";

  const description = stripMarkdownInline(paragraph.replace(/^[-*+]\s+/, ""));
  return description.length > 120
    ? `${description.slice(0, 117)}...`
    : description;
}

function isPlaceholderSecret(value) {
  return PLACEHOLDER_PATTERN.test(value);
}

export function scanAndRedactSensitiveContent(content) {
  let processed = String(content);
  const findings = [];

  for (const { type, pattern } of SECRET_PATTERNS) {
    processed = processed.replace(
      pattern,
      (match, prefixOrValue, maybeValue) => {
        const secretValue = maybeValue || prefixOrValue || match;
        if (isPlaceholderSecret(secretValue) || isPlaceholderSecret(match)) {
          return match;
        }

        findings.push({ type, action: "redacted", sample: match.slice(0, 80) });

        if (type === "env-secret") {
          return match.replace(secretValue, "<REDACTED>");
        }

        if (type === "url-token") {
          return `${prefixOrValue}<REDACTED>`;
        }

        if (type === "bearer-token") {
          return "Bearer <REDACTED>";
        }

        return "<REDACTED>";
      },
    );
  }

  const keywordLines = processed
    .split("\n")
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => SENSITIVE_KEYWORD_PATTERN.test(line))
    .filter(({ line }) => !isPlaceholderSecret(line))
    .slice(0, 20);

  for (const { line, number } of keywordLines) {
    findings.push({
      type: "keyword",
      action: "review",
      sample: `line ${number}: ${line.trim().slice(0, 120)}`,
    });
  }

  return { content: processed, findings };
}

export function buildTargetPath(sourcePath) {
  const relativePath = relative(SOURCE_ROOT, sourcePath);
  const [subtopic, fileName] = relativePath.split("/");
  const slug = slugify(basename(fileName, ".md"));
  return `${TARGET_ROOT}/${CATEGORY}/${SERIES}/${subtopic}/${slug}/index.md`;
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function buildFrontmatter(data, content, sourcePath, draft) {
  const relativePath = relative(SOURCE_ROOT, sourcePath);
  const subtopic = relativePath.split("/")[0];
  const fileTitle = basename(sourcePath, ".md");
  const stat = statSync(sourcePath);
  const tags = [
    ...new Set(["Claude Code", subtopic, ...toArray(data.tags).map(String)]),
  ];

  const frontmatter = [
    "---",
    `title: ${yamlString(data.title || fileTitle)}`,
    `published: ${normalizeDate(data.publish_date || data.extracted_date, stat.mtime)}`,
    `description: ${yamlString(data.description || extractDescription(content))}`,
    `tags: [${tags.map(yamlString).join(", ")}]`,
    `category: ${yamlString(CATEGORY)}`,
    "image: api",
    `draft: ${draft ? "true" : "false"}`,
    "---",
    "",
  ];

  return frontmatter.join("\n");
}

function appendSourceLink(content, data) {
  if (!data.source) return content;
  return `${content}\n\n---\n\n原文链接：${data.source}`;
}

function migrateOne(sourcePath, { write = false } = {}) {
  const raw = readFileSync(sourcePath, "utf-8");
  const parsed = matter(raw);
  const cleaned = cleanContent(parsed.content);
  const withSource = appendSourceLink(cleaned, parsed.data);
  const sensitiveResult = scanAndRedactSensitiveContent(withSource);
  const shouldDraft = sensitiveResult.findings.some(
    (finding) => finding.action === "review",
  );
  const targetPath = buildTargetPath(sourcePath);

  if (existsSync(targetPath)) {
    return {
      source: sourcePath,
      target: targetPath,
      title: parsed.data.title || basename(sourcePath, ".md"),
      published: normalizeDate(
        parsed.data.publish_date || parsed.data.extracted_date,
        statSync(sourcePath).mtime,
      ),
      tags: ["Claude Code", relative(SOURCE_ROOT, sourcePath).split("/")[0]],
      status: "conflict",
      draft: shouldDraft,
      findings: sensitiveResult.findings,
      reason: "目标文件已存在，未覆盖",
    };
  }

  const finalContent = `${buildFrontmatter(parsed.data, sensitiveResult.content, sourcePath, shouldDraft)}${sensitiveResult.content}\n`;

  if (write) {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, finalContent, "utf-8");
  }

  return {
    source: sourcePath,
    target: targetPath,
    title: parsed.data.title || basename(sourcePath, ".md"),
    published: normalizeDate(
      parsed.data.publish_date || parsed.data.extracted_date,
      statSync(sourcePath).mtime,
    ),
    tags: ["Claude Code", relative(SOURCE_ROOT, sourcePath).split("/")[0]],
    status: write ? "migrated" : "dry-run",
    draft: shouldDraft,
    findings: sensitiveResult.findings,
    reason: "",
  };
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row) =>
      `| ${row.map((cell) => String(cell || "").replace(/\n/g, " ")).join(" | ")} |`,
  );
  return [header, divider, ...body].join("\n");
}

function buildReport(results) {
  const migrated = results.filter((item) => item.status === "migrated");
  const conflicts = results.filter((item) => item.status === "conflict");
  const drafts = results.filter((item) => item.draft);
  const findings = results.flatMap((item) =>
    item.findings.map((finding) => ({ ...finding, source: item.source })),
  );

  return [
    "# Claude Code 文章迁移报告",
    "",
    "## 汇总",
    "",
    `- 待迁移：${results.length}`,
    `- 已迁移：${migrated.length}`,
    `- 标记 draft：${drafts.length}`,
    "- 跳过：0",
    `- 路径冲突：${conflicts.length}`,
    `- 敏感信息命中：${findings.length}`,
    "",
    "## 已迁移文件",
    "",
    markdownTable(
      ["源文件", "目标文件", "标题", "published", "tags"],
      migrated.map((item) => [
        item.source,
        item.target,
        item.title,
        item.published,
        item.tags.join(", "),
      ]),
    ),
    "",
    "## 敏感信息处理",
    "",
    findings.length
      ? markdownTable(
          ["源文件", "类型", "处理方式", "说明"],
          findings.map((finding) => [
            finding.source,
            finding.type,
            finding.action,
            finding.sample,
          ]),
        )
      : "无敏感信息命中。",
    "",
    "## Draft 文件",
    "",
    drafts.length
      ? markdownTable(
          ["目标文件", "原因"],
          drafts.map((item) => [
            item.target,
            "存在需要人工复核的敏感关键词命中",
          ]),
        )
      : "无 draft 文件。",
    "",
    "## 路径冲突",
    "",
    conflicts.length
      ? markdownTable(
          ["源文件", "目标文件", "原因"],
          conflicts.map((item) => [item.source, item.target, item.reason]),
        )
      : "无路径冲突。",
    "",
    "## 跳过文件",
    "",
    "本次脚本采用白名单文件清单，未在白名单中的文件不会进入待迁移列表。",
    "",
  ].join("\n");
}

function runMigration({ write = false } = {}) {
  const sourceFiles = INCLUDED_FILES.map((file) => `${SOURCE_ROOT}/${file}`);
  const missing = sourceFiles.filter((file) => !existsSync(file));
  if (missing.length > 0) {
    throw new Error(`Missing source files:\n${missing.join("\n")}`);
  }

  const results = sourceFiles.map((file) => migrateOne(file, { write }));
  const report = buildReport(results);

  if (write) {
    mkdirSync(dirname(REPORT_PATH), { recursive: true });
    writeFileSync(REPORT_PATH, report, "utf-8");
  }

  return { results, report };
}

const currentFile = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] === currentFile;

if (isDirectRun) {
  const write = process.argv.includes("--write");
  const { results, report } = runMigration({ write });
  console.log(report);
  if (!write) {
    console.log("\nDry run only. Re-run with --write to create files.");
  }
  const conflicts = results.filter((item) => item.status === "conflict");
  if (conflicts.length > 0) {
    process.exitCode = 1;
  }
}

export { INCLUDED_FILES, runMigration };
````

- [ ] **Step 2: 运行测试，确认通过**

Run:

```bash
node --test scripts/migrate-claude-code-posts.test.mjs
```

Expected:

```text
# tests 7
# pass 7
# fail 0
```

- [ ] **Step 3: 如果测试失败，按失败信息只修脚本，不改测试意图**

常见修复点：

- `slugify()` 输出不稳定：只调整 `slugify()`。
- 敏感信息测试失败：只调整 `scanAndRedactSensitiveContent()`。
- 目标路径测试失败：只调整 `buildTargetPath()`。

---

### Task 3: dry-run 迁移并检查报告预览

**Files:**

- Modify: `scripts/migrate-claude-code-posts.mjs` only if dry-run 暴露问题
- No generated post files yet

- [ ] **Step 1: 运行 dry-run**

Run:

```bash
node scripts/migrate-claude-code-posts.mjs
```

Expected:

```text
# Claude Code 文章迁移报告

## 汇总

- 待迁移：19
- 已迁移：0
- 标记 draft：N
- 跳过：0
- 路径冲突：0
- 敏感信息命中：N
...
Dry run only. Re-run with --write to create files.
```

注意：dry-run 中 `已迁移：0` 是正常的，因为还没写文件。

- [ ] **Step 2: 检查 dry-run 没有源文件缺失**

如果输出包含：

```text
Missing source files:
```

只允许修正 `INCLUDED_FILES` 中拼写错误；不要扩大迁移范围。

- [ ] **Step 3: 检查路径冲突**

如果 dry-run 报 `路径冲突`，读取冲突目标文件确认内容：

```bash
find "src/content/posts/AI工具/Claude Code" -name index.md -print
```

处理规则：

- 如果目标是本次脚本之前生成的废弃文件，先询问用户再删除。
- 如果目标是已有正式文章，不覆盖，保留冲突报告并停止真实迁移。

---

### Task 4: 执行真实迁移

**Files:**

- Generated: `src/content/posts/AI工具/Claude Code/**/index.md`
- Generated: `docs/migration/claude-code-posts-migration-report.md`

- [ ] **Step 1: 执行写入**

Run:

```bash
node scripts/migrate-claude-code-posts.mjs --write
```

Expected:

```text
# Claude Code 文章迁移报告

## 汇总

- 待迁移：19
- 已迁移：19
- 标记 draft：N
- 跳过：0
- 路径冲突：0
- 敏感信息命中：N
```

如果 `路径冲突` 大于 0，脚本应以非 0 状态退出；不要继续后续验证，先处理冲突。

- [ ] **Step 2: 确认生成文件数量**

Run:

```bash
find "src/content/posts/AI工具/Claude Code" -name index.md | wc -l
```

Expected:

```text
19
```

- [ ] **Step 3: 确认报告存在**

Run:

```bash
test -f docs/migration/claude-code-posts-migration-report.md && echo ok
```

Expected:

```text
ok
```

---

### Task 5: 敏感信息复扫

**Files:**

- Modify generated posts only if复扫发现需要补脱敏
- Modify: `docs/migration/claude-code-posts-migration-report.md` only through rerun script

- [ ] **Step 1: 对生成文章做关键词复扫**

Run:

```bash
grep -RInE 'api_key|apikey|token|secret|password|authorization|bearer|ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}' "src/content/posts/AI工具/Claude Code" || true
```

Expected:

- 可以出现 `YOUR_API_KEY`、`<REDACTED>`、示例性 `token` 说明。
- 不应出现真实长串密钥。

- [ ] **Step 2: 如果发现真实凭证，修脚本规则并重新迁移**

操作顺序：

```bash
rm -rf "src/content/posts/AI工具/Claude Code"
node scripts/migrate-claude-code-posts.mjs --write
```

执行前必须确认这些文件确实是 Task 4 生成的迁移产物；如果目录中混入手写文章，停止并报告。

- [ ] **Step 3: 检查 draft 文件**

Run:

```bash
grep -RIn 'draft: true' "src/content/posts/AI工具/Claude Code" || true
```

Expected:

- 如果没有输出：所有文章都发布。
- 如果有输出：报告给用户具体文件，说明因为敏感关键词需要人工复核。

---

### Task 6: Astro 内容与构建验证

**Files:**

- No expected source changes

- [ ] **Step 1: 跑 Astro 内容检查**

Run:

```bash
pnpm check
```

Expected:

```text
Result (...): 0 errors
```

如果出现已有 `tsconfig.json` paths warning，但没有 error，如实记录为 warning。

- [ ] **Step 2: 跑构建**

Run:

```bash
pnpm build
```

Expected:

```text
astro build
...
pagefind --site dist
```

构建成功才算迁移技术验证通过。若失败，区分：

- 新文章 frontmatter/schema 问题：修迁移脚本并重跑迁移。
- 既有项目 unrelated 问题：不擅自修，报告失败输出。

- [ ] **Step 3: 检查 git diff**

Run:

```bash
git status --short
```

Expected includes:

```text
?? docs/migration/claude-code-posts-migration-report.md
?? docs/superpowers/plans/2026-06-09-claude-code-posts-migration.md
?? docs/superpowers/specs/2026-06-09-claude-code-posts-migration-design.md
?? scripts/migrate-claude-code-posts.mjs
?? scripts/migrate-claude-code-posts.test.mjs
?? src/content/posts/AI工具/
```

不提交 commit。把状态摘要报告给用户。

---

## 自查结果

**Spec coverage:**

- 迁移范围：Task 2 的 `INCLUDED_FILES` 使用白名单覆盖 19 篇，排除版本变更、历史汇总、`CLAUDE.md` 和根目录泛文章。
- 目标结构：Task 2 `buildTargetPath()` 固定生成 `src/content/posts/AI工具/Claude Code/<子主题>/<slug>/index.md`。
- frontmatter：Task 2 `buildFrontmatter()` 实现 title、published、description、tags、category、image、draft。
- 内容轻量清洗：Task 2 `cleanContent()` 与 `appendSourceLink()` 实现，不做大段重写。
- 敏感信息：Task 2 `scanAndRedactSensitiveContent()`、Task 5 复扫覆盖。
- 报告：Task 2 `buildReport()` 与 Task 4 写入 `docs/migration/claude-code-posts-migration-report.md`。
- 验证：Task 5 敏感信息复扫，Task 6 `pnpm check` 与 `pnpm build`。

**Placeholder scan:**

- 计划中没有 `TBD`、`TODO`、`implement later`。
- 所有代码步骤给出完整代码或精确命令。
- commit 步骤已按用户全局规则移除，不会未经同意提交。

**Type consistency:**

- 测试引用的函数名与脚本 export 一致：`normalizeDate`、`slugify`、`cleanContent`、`extractDescription`、`scanAndRedactSensitiveContent`、`buildTargetPath`。
- 迁移结果对象字段在 `migrateOne()` 与 `buildReport()` 中一致：`source`、`target`、`title`、`published`、`tags`、`status`、`draft`、`findings`、`reason`。
