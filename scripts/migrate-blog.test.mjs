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
  assert.equal(normalizeDate(undefined, new Date("2026-06-09T08:00:00Z")), "2026-06-09");
});

test("slugify creates stable slugs", () => {
  assert.equal(slugify("Claude Code Hooks深度解析总结"), "claude-code-hooks深度解析总结");
  assert.equal(slugify("04-Claude Code多会话管理配置"), "04-claude-code多会话管理配置");
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
  const input = ["API_KEY=YOUR_API_KEY", "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"].join("\n");
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
