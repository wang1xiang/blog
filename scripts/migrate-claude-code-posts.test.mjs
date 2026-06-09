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
  assert.equal(normalizeDate(undefined, new Date("2026-06-09T08:00:00Z")), "2026-06-09");
});

test("slugify creates stable readable slugs", () => {
  assert.equal(slugify("Claude Code Hooks深度解析总结"), "claude-code-hooks深度解析总结");
  assert.equal(slugify("04-Claude Code多会话管理配置"), "04-claude-code多会话管理配置");
});

test("cleanContent converts Obsidian wiki links and collapses excessive blank lines", () => {
  const input = "参考 [[Claude-Code-Hook-配置完整记录|Hook 配置]]\n\n\n\n以及 [[CLAUDE.md]]";
  assert.equal(cleanContent(input), "参考 Hook 配置\n\n以及 CLAUDE.md");
});

test("extractDescription uses the first meaningful paragraph and removes markdown markers", () => {
  const input = "# 标题\n\n> 引用不作为摘要\n\n这是第一段有效正文，包含 **加粗** 和 `code`，应该被清理。";
  assert.equal(extractDescription(input), "这是第一段有效正文，包含 加粗 和 code，应该被清理。");
});

test("scanAndRedactSensitiveContent keeps placeholders but redacts real-looking secrets", () => {
  const input = [
    "ANTHROPIC_API_KEY=YOUR_API_KEY",
    "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890",
    "Authorization: Bearer abcdefghijklmnopqrstuvwxyz1234567890",
  ].join("\n");

  const result = scanAndRedactSensitiveContent(input);

  assert.equal(result.content.includes("YOUR_API_KEY"), true);
  assert.equal(result.content.includes("sk-proj-abcdefghijklmnopqrstuvwxyz1234567890"), false);
  assert.equal(result.content.includes("<REDACTED>"), true);
  assert.equal(result.findings.length >= 2, true);
});

test("buildTargetPath maps subtopic into AI工作流 path", () => {
  const source = "/Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/Claude-Code-plan-mode-与-Superpowers-brainstorming-配合使用.md";
  assert.equal(
    buildTargetPath(source),
    "src/content/posts/AI工具/AI工作流/03-ai-workflow/claude-code-plan-mode-与-superpowers-brainstorming-配合使用/index.md",
  );
});
