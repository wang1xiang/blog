import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync, readdirSync } from "node:fs";
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
  const paragraphs = String(content).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const paragraph = paragraphs.find((p) => {
    return !p.startsWith("#") && !p.startsWith(">") && !p.startsWith("```") && !p.startsWith("---");
  });
  if (!paragraph) return "";
  const description = stripMarkdownInline(paragraph.replace(/^[-*+]\s+/, ""));
  return description.length > 120 ? `${description.slice(0, 117)}...` : description;
}

function isPlaceholderSecret(value) {
  return /(?:YOUR|your|example|EXAMPLE|xxx|XXX|placeholder|PLACEHOLDER|<[^>]+>)/.test(value);
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
      pattern: /\b(?:ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|BYOK_API_KEY|API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*([^\s"']{12,})/gi,
    },
    { type: "url-token", pattern: /([?&](?:key|token|access_token)=)([^\s&#)]{12,})/gi },
  ];
  for (const s of secrets) {
    patterns.push({ type: `custom-${s}`, pattern: new RegExp(`\\b${s}[A-Za-z0-9_-]{10,}\\b`, "g") });
  }
  return patterns;
}

function buildKeywordPattern(config) {
  const domains = config.sensitivePatterns?.domains || [];
  const keywords = config.sensitivePatterns?.keywords || [];
  const allTerms = [...domains, ...keywords, "api_key", "apikey", "token", "secret", "password", "authorization", "bearer"];
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
      if (isPlaceholderSecret(match)) return match;
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
    .filter(({ line }) => !isPlaceholderSecret(line))
    .slice(0, 20);

  for (const { line, number } of keywordLines) {
    findings.push({ type: "keyword", action: "review", sample: `line ${number}: ${line.trim().slice(0, 120)}` });
  }

  return { content: processed, findings };
}

export function buildTargetPath(sourcePath, config) {
  const relativePath = relative(config.sourceRoot, sourcePath);
  const parts = relativePath.split("/");
  const subtopic = parts[0];
  const fileName = parts[parts.length - 1];
  const mapping = config.categoryMap[subtopic] || { category: "其他", series: "其他" };
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
  const mapping = config.categoryMap[subtopic] || { category: "其他", series: "其他" };
  const defaultTags = config.defaultTags || [];
  const tags = [...new Set([mapping.series, subtopic, ...toArray(data.tags).map(String), ...defaultTags])];

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
      if (excludePatterns.some((p) => relPath.startsWith(p) || relPath.includes(p))) continue;
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
  const shouldDraft = sensitiveResult.findings.some((f) => f.action === "review");
  const targetPath = buildTargetPath(sourcePath, config);
  const relativePath = relative(config.sourceRoot, sourcePath);
  const subtopic = relativePath.split("/")[0];
  const mapping = config.categoryMap[subtopic] || { category: "其他", series: "其他" };

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

  const finalContent = `${buildFrontmatter(parsed.data, sensitiveResult.content, sourcePath, config, shouldDraft)}${sensitiveResult.content}\n`;

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
      migrated.map((r) => [r.source, r.target, r.title, r.published, r.tags.join(", ")]),
    ),
    "",
    "## 敏感信息处理",
    "",
    findings.length
      ? markdownTable(["源文件", "类型", "处理方式", "说明"], findings.map((f) => [f.source, f.type, f.action, f.sample]))
      : "无敏感信息命中。",
    "",
    "## Draft 文件",
    "",
    drafts.length ? markdownTable(["目标文件", "原因"], drafts.map((r) => [r.target, "存在需要人工复核的敏感关键词命中"])) : "无 draft 文件。",
    "",
    "## 路径冲突",
    "",
    conflicts.length ? markdownTable(["源文件", "目标文件", "原因"], conflicts.map((r) => [r.source, r.target, r.reason])) : "无路径冲突。",
    "",
  ].join("\n");
}

export function runMigration(config, { write = false } = {}) {
  const sourceFiles = collectFiles(config.sourceRoot, config);
  const results = sourceFiles.map((file) => {
    try {
      return migrateOne(file, config, { write });
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
    mkdirSync(REPORT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().slice(0, 10);
    writeFileSync(`${REPORT_DIR}/${timestamp}-blog-migration-report.md`, report, "utf-8");
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
  if (!write) console.log("\nDry run only. Re-run with --write to create files.");
  const conflicts = results.filter((r) => r.status === "conflict");
  if (conflicts.length > 0) process.exitCode = 1;
}

export { loadConfig };
