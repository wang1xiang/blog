import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// === Batch 1: Claude Code 专题（已完成）===
// const SOURCE_ROOT = "/Users/xiangwang/claudecode/markdown/02-主题/01-claude-code";
// const CATEGORY = "AI工具";
// const SERIES = "Claude Code";
// const INCLUDED_FILES = [
//   "Hook配置/Claude Code Hooks深度解析总结.md",
//   ... (21 files)
// ];

// === Batch 2: 02-主题 剩余全部 ===
const SOURCE_ROOT = "/Users/xiangwang/claudecode/markdown/02-主题";
const TARGET_ROOT = "src/content/posts";
const REPORT_PATH = "docs/migration/02-theme-posts-migration-report.md";

const BATCH_MAP = {
  "02-auto-review": { category: "工具", series: "Auto-Review" },
  "03-ai-workflow": { category: "AI工具", series: "AI工作流" },
  "04-skill-dev": { category: "AI工具", series: "Skill开发" },
  "05-terminal-tooling": { category: "工具", series: "终端配置" },
  "06-ai-articles": { category: "AI工具", series: "AI文章" },
  "07-项目调研": { category: "其他", series: "项目调研" },
  "99-misc": { category: "其他", series: "杂项" },
};

const INCLUDED_FILES = [
  "02-auto-review/Auto-Review项目搭建实录.md",
  "02-auto-review/GitLab自动Review流程接入指南.md",
  "02-auto-review/GitLab自动Review实操-NodeJS版.md",
  "02-auto-review/自动Review流程详解.md",
  "03-ai-workflow/AI-负责筛选与结构化而不是最终创作.md",
  "03-ai-workflow/AI编程组合实战指南.md",
  "03-ai-workflow/Claude-Code-plan-mode-与-Superpowers-brainstorming-配合使用.md",
  "03-ai-workflow/OpenAI-Codex-Use-Cases-案例库深度调研.md",
  "03-ai-workflow/OpenAI-Harness-Engineering-智能体优先方法论调研.md",
  "03-ai-workflow/Subagent学习与实践.md",
  "03-ai-workflow/Superpowers-给-Agent-加上跳不过去的工作流.md",
  '03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md',
  '03-ai-workflow/放弃Vibe Coding：我用Superpowers+gstack沉淀出一套大幅减少返工的skill组合工作流（附案例）.md',
  "03-ai-workflow/高德OPC+Harness自主增长系统方法论.md",
  "03-ai-workflow/开发流程skill化.md",
  "03-ai-workflow/用好-Coding-Agent-的重点是两头抓.md",
  '03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md',
  "04-skill-dev/Claude-Code-重复工作流审计与项目级Skill沉淀.md",
  "04-skill-dev/claude-mem故障排查与修复实录.md",
  "04-skill-dev/daily-recap-skill改造与Claude-Memory系统.md",
  "04-skill-dev/Prompt-Optimizer技能封装全过程.md",
  "04-skill-dev/skill-cleaner-开发与首轮审计.md",
  "04-skill-dev/TechDebt-Skill-封装实录.md",
  "04-skill-dev/TTS-Skill-百聆-CosyVoice-封装全记录.md",
  "04-skill-dev/video-edit-pipeline-skill开发.md",
  "04-skill-dev/web-access-技能安装与Claude周报实践记录.md",
  "04-skill-dev/爆火Skill合集总结.md",
  "04-skill-dev/技能清单-2026-04-21.md",
  "04-skill-dev/我的Skill装备库.md",
  "04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md",
  "05-terminal-tooling/git-reflog-找回丢失代码教程.md",
  "05-terminal-tooling/LazyVim-从入门到配置体系学习记录.md",
  "05-terminal-tooling/macOS终端工具链搭建实录.md",
  "05-terminal-tooling/Neovim-终端开发配置指南.md",
  "05-terminal-tooling/Tmux-Agent-配置实录.md",
  "05-terminal-tooling/tmux配置总结.md",
  "05-terminal-tooling/从iTerm2到cmux终端工作流升级与自动化实录.md",
  "06-ai-articles/AI寓言故事教学法.md",
  "07-项目调研/baoyu-skillsREADME.zh.md at main.md",
  "07-项目调研/Claude-Code-插件-security-guidance-与-Webwright-框架调研.md",
  "07-项目调研/earendil-works-pi-Agent-Harness-Mono-Repo.md",
  "07-项目调研/kimi-code打包与配置记录.md",
  "07-项目调研/MiniCPM5-1B-本地部署实录.md",
  "07-项目调研/Open-Design-DESIGN.md-提炼指南.md",
  "07-项目调研/Open-Design-开源版-Claude-Design-完整调研.md",
  "07-项目调研/pi-agent-harness-研究笔记.md",
  "07-项目调研/repomix-工具使用探索.md",
  "07-项目调研/understand-anything插件使用指南.md",
  "07-项目调研/video-use-视频编辑agent.md",
  "07-项目调研/wshobson-commands仓库调研.md",
  "99-misc/GPT-Image-2-提示词案例合集.md",
  "99-misc/管理后台API迁移NestJS方案.md",
];

const PLACEHOLDER_PATTERN = /(?:YOUR|your|example|EXAMPLE|xxx|XXX|placeholder|PLACEHOLDER|<[^>]+>)/;
const SECRET_PATTERNS = [
  { type: "openai-key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { type: "github-token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { type: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { type: "bearer-token", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}\b/gi },
  {
    type: "env-secret",
    pattern: /\b(?:ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*([^\s"']{12,})/gi,
  },
  { type: "url-token", pattern: /([?&](?:key|token|access_token)=)([^\s&#)]{12,})/gi },
];
const SENSITIVE_KEYWORD_PATTERN = /\b(api_key|apikey|token|secret|password|authorization|bearer|ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY)\b/i;

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
    return !p.startsWith("#") && !p.startsWith(">") && !p.startsWith("```") && !p.startsWith("---");
  });

  if (!paragraph) return "";

  const description = stripMarkdownInline(paragraph.replace(/^[-*+]\s+/, ""));
  return description.length > 120 ? `${description.slice(0, 117)}...` : description;
}

function isPlaceholderSecret(value) {
  return PLACEHOLDER_PATTERN.test(value);
}

export function scanAndRedactSensitiveContent(content) {
  let processed = String(content);
  const findings = [];

  for (const { type, pattern } of SECRET_PATTERNS) {
    processed = processed.replace(pattern, (...args) => {
      const match = args[0];

      if (isPlaceholderSecret(match)) {
        return match;
      }

      findings.push({ type, action: "redacted", sample: match.slice(0, 80) });

      // env-secret: 1 capture group for the secret value → args[1]
      if (type === "env-secret") {
        const secretValue = args[1];
        return match.replace(secretValue, "<REDACTED>");
      }

      // url-token: 2 capture groups: param prefix → args[1], token value → args[2]
      if (type === "url-token") {
        return `${args[1]}<REDACTED>`;
      }

      if (type === "bearer-token") {
        return "Bearer <REDACTED>";
      }

      return "<REDACTED>";
    });
  }

  const keywordLines = processed
    .split("\n")
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => SENSITIVE_KEYWORD_PATTERN.test(line))
    .filter(({ line }) => !isPlaceholderSecret(line))
    .slice(0, 20);

  for (const { line, number } of keywordLines) {
    findings.push({ type: "keyword", action: "review", sample: `line ${number}: ${line.trim().slice(0, 120)}` });
  }

  return { content: processed, findings };
}

export function buildTargetPath(sourcePath) {
  const relativePath = relative(SOURCE_ROOT, sourcePath);
  const [subtopic] = relativePath.split("/");
  const mapping = BATCH_MAP[subtopic] || { category: "其他", series: "其他" };
  const fileName = relativePath.split("/").pop();
  const slug = slugify(basename(fileName, ".md"));
  return `${TARGET_ROOT}/${mapping.category}/${mapping.series}/${subtopic}/${slug}/index.md`;
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
  const mapping = BATCH_MAP[subtopic] || { category: "其他", series: "其他" };
  const tags = [...new Set([mapping.series, subtopic, ...toArray(data.tags).map(String)])];

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

function migrateOne(sourcePath, { write = false } = {}) {
  const raw = readFileSync(sourcePath, "utf-8");
  const parsed = matter(raw);
  const cleaned = cleanContent(parsed.content);
  const withSource = appendSourceLink(cleaned, parsed.data);
  const sensitiveResult = scanAndRedactSensitiveContent(withSource);
  const shouldDraft = sensitiveResult.findings.some((f) => f.action === "review");
  const targetPath = buildTargetPath(sourcePath);
  const relativePath = relative(SOURCE_ROOT, sourcePath);
  const subtopic = relativePath.split("/")[0];
  const mapping = BATCH_MAP[subtopic] || { category: "其他", series: "其他" };

  if (existsSync(targetPath)) {
    return {
      source: sourcePath,
      target: targetPath,
      title: parsed.data.title || basename(sourcePath, ".md"),
      published: normalizeDate(parsed.data.publish_date || parsed.data.extracted_date, statSync(sourcePath).mtime),
      tags: [mapping.series, subtopic],
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
    published: normalizeDate(parsed.data.publish_date || parsed.data.extracted_date, statSync(sourcePath).mtime),
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
  const body = rows.map((row) => `| ${row.map((cell) => String(cell || "").replace(/\n/g, " ")).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function buildReport(results) {
  const migrated = results.filter((r) => r.status === "migrated");
  const conflicts = results.filter((r) => r.status === "conflict");
  const drafts = results.filter((r) => r.draft);
  const findings = results.flatMap((r) => r.findings.map((f) => ({ ...f, source: r.source })));

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
      migrated.map((r) => [r.source, r.target, r.title, r.published, r.tags.join(", ")]),
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
      ? markdownTable(["目标文件", "原因"], drafts.map((r) => [r.target, "存在需要人工复核的敏感关键词命中"]))
      : "无 draft 文件。",
    "",
    "## 路径冲突",
    "",
    conflicts.length
      ? markdownTable(["源文件", "目标文件", "原因"], conflicts.map((r) => [r.source, r.target, r.reason]))
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

  const results = sourceFiles.map((file) => {
    try {
      return migrateOne(file, { write });
    } catch (err) {
      return {
        source: file,
        target: "FAILED",
        title: "",
        published: "",
        tags: [],
        status: `error: ${err.message.split("\n")[0]}`,
        draft: false,
        findings: [],
        reason: err.message.split("\n")[0],
      };
    }
  });
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
  const conflicts = results.filter((r) => r.status === "conflict");
  if (conflicts.length > 0) {
    process.exitCode = 1;
  }
}

export { INCLUDED_FILES, runMigration };
