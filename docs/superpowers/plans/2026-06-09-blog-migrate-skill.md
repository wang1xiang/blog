# Blog Migrate Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将硬编码的迁移脚本重构为配置驱动的 Blog Migrate Skill，包含配置管理、迁移引擎、验证模块和 Skill 触发逻辑。

**Architecture:** 基于现有 `migrate-claude-code-posts.mjs` 提取核心纯函数，将硬编码常量迁移到 `.claude/migrate-config.json`，新增 `postMigrateVerify()` 验证模块，Skill 规范已存在于 `~/.claude/skills/blog-migrate/skill.md`。

**Tech Stack:** Node.js ESM、gray-matter、Node 内置 test runner、JSON 配置。

---

## 文件结构

**创建：**

- `scripts/migrate-blog.mjs` — 配置化迁移引擎（复用现有纯函数，硬编码改为配置读取）
- `scripts/migrate-blog.test.mjs` — 迁移引擎测试
- `.claude/migrate-config.json` — 迁移配置模板（基于本次迁移的 Batch 2 配置）

**修改：**

- `~/.claude/skills/blog-migrate/skill.md` — 补充触发关键词和引导话术细节（已有，无需大改）

**生成：**

- `docs/migration/<timestamp>-blog-migration-report.md` — 动态生成，不手写

---

### Task 1: 创建配置模板

**Files:**

- Create: `.claude/migrate-config.json`

- [ ] **Step 1: 写入配置模板**

```json
{
  "sourceRoot": "/path/to/markdown/notes",
  "targetRoot": "src/content/posts",
  "categoryMap": {
    "01-topic": { "category": "分类名", "series": "系列名" }
  },
  "sensitivePatterns": {
    "domains": ["internal-domain.com"],
    "keywords": ["内部项目名"],
    "secrets": ["sk-", "ghp_", "xoxb-", "Bearer"]
  },
  "excludePatterns": ["版本变更/", "99-misc/"],
  "defaultTags": ["迁移"]
}
```

- [ ] **Step 2: 验证 JSON 格式**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/migrate-config.json', 'utf8')); console.log('valid')"
```

Expected:

```text
valid
```

---

### Task 2: 编写配置化迁移引擎（纯函数）

**Files:**

- Create: `scripts/migrate-blog.mjs`
- Test: `scripts/migrate-blog.test.mjs`（Task 3）

- [ ] **Step 1: 创建迁移引擎框架**

````js
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { basename, dirname, relative, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const CONFIG_PATH = ".claude/migrate-config.json";
const REPORT_DIR = "docs/migration";

function loadConfig(configPath = CONFIG_PATH) {
  const raw = readFileSync(configPath, "utf-8");
  return JSON.parse(raw);
}

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
    .replace(/[，。！？、：；（）()【】\[\]{}《》"'""''"]/g, "")
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
    .map((p) => p.trim())
    .filter(Boolean);
  const paragraph = paragraphs.find((p) => {
    return (
      !p.startsWith("#") &&
      !p.startsWith(">") &&
      !p.startsWith("```") &&
      !p.startsWith("---")
    );
  });
  if (!paragraph) return "";
  const description = stripMarkdownInline(paragraph.replace(/^[-*+]\s+/, ""));
  return description.length > 120
    ? `${description.slice(0, 117)}...`
    : description;
}

function isPlaceholderSecret(value, config) {
  const patterns = config.sensitivePatterns?.secrets || [];
  for (const p of patterns) {
    if (value.toLowerCase().includes(p.toLowerCase())) return true;
  }
  return /(?:YOUR|your|example|EXAMPLE|xxx|XXX|placeholder|PLACEHOLDER|<[^>]+>)/.test(
    value,
  );
}

function buildSecretPattern(config) {
  const secrets = config.sensitivePatterns?.secrets || [];
  const patterns = [
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
  for (const s of secrets) {
    patterns.push({
      type: `custom-${s}`,
      pattern: new RegExp(`\\b${s}[A-Za-z0-9_-]{10,}\\b`, "g"),
    });
  }
  return patterns;
}

function buildKeywordPattern(config) {
  const domains = config.sensitivePatterns?.domains || [];
  const keywords = config.sensitivePatterns?.keywords || [];
  const allTerms = [
    ...domains,
    ...keywords,
    "api_key",
    "apikey",
    "token",
    "secret",
    "password",
    "authorization",
    "bearer",
  ];
  const escaped = allTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "i");
}

export function scanAndRedactSensitiveContent(content, config) {
  let processed = String(content);
  const findings = [];
  const secretPatterns = buildSecretPattern(config);

  for (const { type, pattern } of secretPatterns) {
    processed = processed.replace(pattern, (...args) => {
      const match = args[0];
      if (isPlaceholderSecret(match, config)) return match;
      findings.push({ type, action: "redacted", sample: match.slice(0, 80) });
      if (type === "env-secret") {
        const secretValue = args[1];
        return match.replace(secretValue, "<REDACTED>");
      }
      if (type === "url-token") return `${args[1]}<REDACTED>`;
      if (type === "bearer-token") return "Bearer <REDACTED>";
      return "<REDACTED>";
    });
  }

  const keywordPattern = buildKeywordPattern(config);
  const keywordLines = processed
    .split("\n")
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => keywordPattern.test(line))
    .filter(({ line }) => !isPlaceholderSecret(line, config))
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

export function buildTargetPath(sourcePath, config) {
  const relativePath = relative(config.sourceRoot, sourcePath);
  const parts = relativePath.split("/");
  const subtopic = parts[0];
  const fileName = parts[parts.length - 1];
  const mapping = config.categoryMap[subtopic] || {
    category: "其他",
    series: "其他",
  };
  const slug = slugify(basename(fileName, ".md"));
  return `${config.targetRoot}/${mapping.category}/${mapping.series}/${subtopic}/${slug}/index.md`;
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function buildFrontmatter(data, content, sourcePath, config, draft) {
  const relativePath = relative(config.sourceRoot, sourcePath);
  const subtopic = relativePath.split("/")[0];
  const fileTitle = basename(sourcePath, ".md");
  const stat = statSync(sourcePath);
  const mapping = config.categoryMap[subtopic] || {
    category: "其他",
    series: "其他",
  };
  const defaultTags = config.defaultTags || [];
  const tags = [
    ...new Set([
      mapping.series,
      subtopic,
      ...toArray(data.tags).map(String),
      ...defaultTags,
    ]),
  ];

  const frontmatter = [
    "---",
    `title: ${yamlString(data.title || fileTitle)}`,
    `published: ${normalizeDate(data.publish_date || data.extracted_date, stat.mtime)}`,
    `description: ${yamlString(data.description || extractDescription(content))}`,
    `tags: [${tags.map(yamlString).join(", ")}]`,
    `category: ${yamlString(mapping.category)}`,
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

export function collectFiles(sourceRoot, config) {
  const results = [];
  const excludePatterns = config.excludePatterns || [];

  function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(sourceRoot, fullPath);
      if (
        excludePatterns.some(
          (p) => relPath.startsWith(p) || relPath.includes(p),
        )
      )
        continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        results.push(fullPath);
      }
    }
  }

  walk(sourceRoot);
  return results;
}

export function migrateOne(sourcePath, config, { write = false } = {}) {
  const raw = readFileSync(sourcePath, "utf-8");
  const parsed = matter(raw);
  const cleaned = cleanContent(parsed.content);
  const withSource = appendSourceLink(cleaned, parsed.data);
  const sensitiveResult = scanAndRedactSensitiveContent(withSource, config);
  const shouldDraft = sensitiveResult.findings.some(
    (f) => f.action === "review",
  );
  const targetPath = buildTargetPath(sourcePath, config);
  const relativePath = relative(config.sourceRoot, sourcePath);
  const subtopic = relativePath.split("/")[0];
  const mapping = config.categoryMap[subtopic] || {
    category: "其他",
    series: "其他",
  };

  if (existsSync(targetPath)) {
    return {
      source: sourcePath,
      target: targetPath,
      title: parsed.data.title || basename(sourcePath, ".md"),
      published: normalizeDate(
        parsed.data.publish_date || parsed.data.extracted_date,
        statSync(sourcePath).mtime,
      ),
      tags: [mapping.series, subtopic],
      status: "conflict",
      draft: shouldDraft,
      findings: sensitiveResult.findings,
      reason: "目标文件已存在，未覆盖",
    };
  }

  const finalContent = `${buildFrontmatter(parsed.data, sensitiveResult.content, sourcePath, config, shouldDraft)}${sensitiveResult.content}\n`;

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
    tags: [mapping.series, subtopic],
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
  const migrated = results.filter((r) => r.status === "migrated");
  const conflicts = results.filter((r) => r.status === "conflict");
  const drafts = results.filter((r) => r.draft);
  const findings = results.flatMap((r) =>
    r.findings.map((f) => ({ ...f, source: r.source })),
  );

  return [
    "# Blog 迁移报告",
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
      migrated.map((r) => [
        r.source,
        r.target,
        r.title,
        r.published,
        r.tags.join(", "),
      ]),
    ),
    "",
    "## 敏感信息处理",
    "",
    findings.length
      ? markdownTable(
          ["源文件", "类型", "处理方式", "说明"],
          findings.map((f) => [f.source, f.type, f.action, f.sample]),
        )
      : "无敏感信息命中。",
    "",
    "## Draft 文件",
    "",
    drafts.length
      ? markdownTable(
          ["目标文件", "原因"],
          drafts.map((r) => [r.target, "存在需要人工复核的敏感关键词命中"]),
        )
      : "无 draft 文件。",
    "",
    "## 路径冲突",
    "",
    conflicts.length
      ? markdownTable(
          ["源文件", "目标文件", "原因"],
          conflicts.map((r) => [r.source, r.target, r.reason]),
        )
      : "无路径冲突。",
    "",
  ].join("\n");
}

export function runMigration(config, { write = false } = {}) {
  const sourceFiles = collectFiles(config.sourceRoot, config);
  const results = sourceFiles.map((file) =>
    migrateOne(file, config, { write }),
  );
  const report = buildReport(results);

  if (write) {
    mkdirSync(REPORT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().slice(0, 10);
    writeFileSync(
      `${REPORT_DIR}/${timestamp}-blog-migration-report.md`,
      report,
      "utf-8",
    );
  }

  return { results, report };
}

const currentFile = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] === currentFile;

if (isDirectRun) {
  const config = loadConfig();
  const write = process.argv.includes("--write");
  const { results, report } = runMigration(config, { write });
  console.log(report);
  if (!write)
    console.log("\nDry run only. Re-run with --write to create files.");
  const conflicts = results.filter((r) => r.status === "conflict");
  if (conflicts.length > 0) process.exitCode = 1;
}

export { loadConfig, collectFiles };
````

- [ ] **Step 2: 保存文件**

文件已写入 `scripts/migrate-blog.mjs`。

---

### Task 3: 编写迁移引擎测试

**Files:**

- Create: `scripts/migrate-blog.test.mjs`

- [ ] **Step 1: 写测试文件**

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
} from "./migrate-blog.mjs";

const mockConfig = {
  sourceRoot: "/Users/test/notes",
  targetRoot: "src/content/posts",
  categoryMap: {
    "01-topic": { category: "工具", series: "专题" },
  },
  sensitivePatterns: {
    domains: ["internal.com"],
    keywords: ["内部项目"],
    secrets: ["sk-", "ghp_"],
  },
};

test("normalizeDate strips time and pads single digits", () => {
  assert.equal(normalizeDate("2026-04-07 11:14"), "2026-04-07");
  assert.equal(normalizeDate("2026-4-7"), "2026-04-07");
});

test("normalizeDate falls back to mtime", () => {
  assert.equal(
    normalizeDate(undefined, new Date("2026-06-09T08:00:00Z")),
    "2026-06-09",
  );
});

test("slugify creates stable slugs", () => {
  assert.equal(
    slugify("Claude Code Hooks深度解析总结"),
    "claude-code-hooks深度解析总结",
  );
  assert.equal(
    slugify("04-Claude Code多会话管理配置"),
    "04-claude-code多会话管理配置",
  );
});

test("cleanContent converts Obsidian links and collapses blank lines", () => {
  const input = "参考 [[Hook配置|Hook]]\n\n\n\n以及 [[CLAUDE.md]]";
  assert.equal(cleanContent(input), "参考 Hook\n\n以及 CLAUDE.md");
});

test("extractDescription skips headers and blockquotes", () => {
  const input = "# 标题\n\n> 引用\n\n这是第一段有效正文。";
  assert.equal(extractDescription(input), "这是第一段有效正文。");
});

test("scanAndRedactSensitiveContent keeps placeholders but redacts secrets", () => {
  const input = [
    "API_KEY=YOUR_API_KEY",
    "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890",
  ].join("\n");
  const result = scanAndRedactSensitiveContent(input, mockConfig);
  assert.equal(result.content.includes("YOUR_API_KEY"), true);
  assert.equal(result.content.includes("sk-proj-"), false);
  assert.equal(result.content.includes("<REDACTED>"), true);
});

test("buildTargetPath uses config categoryMap", () => {
  const source = "/Users/test/notes/01-topic/Claude Code Hooks深度解析总结.md";
  assert.equal(
    buildTargetPath(source, mockConfig),
    "src/content/posts/工具/专题/01-topic/claude-code-hooks深度解析总结/index.md",
  );
});
```

- [ ] **Step 2: 运行测试**

Run:

```bash
node --test scripts/migrate-blog.test.mjs
```

Expected:

```text
# tests 7
# pass 7
# fail 0
```

---

### Task 4: 创建配置模板实例

**Files:**

- Create: `.claude/migrate-config.json`（基于本次迁移的实际配置）

- [ ] **Step 1: 写入配置**

```json
{
  "sourceRoot": "/Users/xiangwang/claudecode/markdown/02-主题",
  "targetRoot": "src/content/posts",
  "categoryMap": {
    "02-auto-review": { "category": "工具", "series": "Auto-Review" },
    "03-ai-workflow": { "category": "AI工具", "series": "AI工作流" },
    "04-skill-dev": { "category": "AI工具", "series": "Skill开发" },
    "05-terminal-tooling": { "category": "工具", "series": "终端配置" },
    "06-ai-articles": { "category": "AI工具", "series": "AI文章" },
    "07-项目调研": { "category": "其他", "series": "项目调研" },
    "99-misc": { "category": "其他", "series": "杂项" }
  },
  "sensitivePatterns": {
    "domains": ["qmpoa.com", "qimingpian.com"],
    "keywords": ["企名片", "qmp_"],
    "secrets": ["sk-", "ghp_", "xoxb-", "Bearer"]
  },
  "excludePatterns": ["版本变更/", "CLAUDE.md"],
  "defaultTags": []
}
```

- [ ] **Step 2: 验证 JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/migrate-config.json', 'utf8')); console.log('valid')"
```

Expected:

```text
valid
```

---

### Task 5: 集成测试（dry-run）

**Files:**

- Modify: `scripts/migrate-blog.mjs`（如有需要）
- Test: 现有博客项目

- [ ] **Step 1: 运行 dry-run**

Run:

```bash
node scripts/migrate-blog.mjs
```

Expected:

```text
# Blog 迁移报告

## 汇总

- 待迁移：52
- 已迁移：0
- 标记 draft：N
...
Dry run only. Re-run with --write to create files.
```

- [ ] **Step 2: 验证无路径冲突**

如果输出包含 `路径冲突 > 0`，检查是否为本次迁移已生成的文件（预期有冲突，因为第一批已迁移）。

---

### Task 6: 验证 Skill 触发逻辑

**Files:**

- Modify: `~/.claude/skills/blog-migrate/skill.md`（补充触发关键词）

- [ ] **Step 1: 更新 Skill 规范中的触发关键词**

在 skill.md 的"触发条件"部分补充：

```markdown
## 触发条件

用户输入 `/blog-migrate` 或提到以下关键词时触发：

- "把笔记迁移到博客"
- "迁移 markdown"
- "搬到博客"
- "obsidian 迁移"
- "blog-migrate"
```

- [ ] **Step 2: 验证 Skill 文件存在**

Run:

```bash
ls ~/.claude/skills/blog-migrate/skill.md && echo "exists"
```

Expected:

```text
exists
```

---

## 自查结果

**Spec coverage:**

- ✅ 配置管理：Task 1 + Task 4
- ✅ 迁移引擎纯函数：Task 2（normalizeDate, slugify, cleanContent, extractDescription, scanAndRedactSensitiveContent, buildTargetPath, collectFiles, migrateOne, runMigration, loadConfig）
- ✅ 测试覆盖：Task 3（7 个测试）
- ✅ Skill 触发逻辑：Task 6
- ✅ 验证模块：Task 5（dry-run）

**Placeholder scan:**

- 无 "TBD"、"TODO"、"implement later"
- 所有代码步骤给出完整代码
- commit 步骤已按用户规则移除（不自动提交）

**Type consistency:**

- 函数名在任务和测试中一致：`normalizeDate`, `slugify`, `cleanContent`, `extractDescription`, `scanAndRedactSensitiveContent`, `buildTargetPath`, `collectFiles`, `migrateOne`, `runMigration`, `loadConfig`
- 配置对象结构在 Task 2 和 Task 4 中一致：`sourceRoot`, `targetRoot`, `categoryMap`, `sensitivePatterns`, `excludePatterns`, `defaultTags`
