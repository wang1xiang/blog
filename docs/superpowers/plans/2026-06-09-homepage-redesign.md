# 首页重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 OD 设计稿 `new-design.html` 适配到当前 Astro + Firefly 博客首页，让首页脱离三栏 `MainGridLayout`，使用独立的 `HomeLayout` 渲染极简单列布局，保持其他页面完全不变。

**Architecture:** 新增 `HomeLayout.astro` 包裹现有 `Layout.astro`（复用 head/SEO/字体/analytics），不复用 `MainGridLayout`。新增 `src/components/pages/home/` 目录存放首页专用组件（HomeNavbar/HomeFooter/HomeHero/HomeFeatured/HomeArticleList/HomeCategoryGrid + home.css）。样式用 `.home-page` class 作用域隔离 oklch 变量。Swup 必需的 6 个 container 全部提供（1 真 5 假）。

**Tech Stack:** Astro 5 + Firefly 模板 (v6.10.5)，pnpm，Biome (lint/format)，TypeScript，Svelte (复用 LightDarkSwitch)，@swup/astro，astro:content。

**Spec:** `docs/superpowers/specs/2026-06-09-homepage-redesign-design.md`

---

## 前置说明

### 项目验证命令

- 类型检查：`pnpm type-check`
- Lint：`pnpm lint`
- 启动 dev：`pnpm dev`
- 构建：`pnpm build`
- 项目无单元测试体系（Astro SSG 站点），验证靠类型检查 + dev/build + 手动浏览器检查

### 关键路径常量

- 项目根：`/Users/xiangwang/My/github/blog`
- 首页路由文件：`src/pages/[...page].astro`
- 现有 Layout：`src/layouts/Layout.astro`（不动，HomeLayout 会包裹它）
- 现有 MainGridLayout：`src/layouts/MainGridLayout.astro`（不动）
- Swup 配置：`astro.config.mjs:66-93`
- 主题切换组件：`src/components/controls/LightDarkSwitch.svelte`
- 现有分页组件：`src/components/common/Pagination.astro`
- 主题钩子：写入 `html.dark` class + `html[data-theme="dark"]` 属性（见 `src/layouts/Layout.astro:285-292`）

### Astro 路径别名

`@/` 和 `@components/` 都映射到 `src/`，沿用现有代码风格：

- 现有 `src/utils/content-utils.ts` 用 `@i18n/` `@utils/`
- 现有 `src/pages/[...page].astro` 用 `@/components/` `@/config`
- **本计划统一用 `@/` 风格**与首页路由一致

### Git Commit 规约

参照仓库现有 commit 风格（`feat:` / `fix:` / `style:` 前缀，简短中英混排）。**禁止添加 `Co-Authored-By` 行**（用户私规约）。

---

## 任务概览

| 任务 | 内容                                                          | 文件数 | 预估时间 |
| ---- | ------------------------------------------------------------- | ------ | -------- |
| 1    | 在 `footerConfig.ts` + `FooterConfig` 类型加 `startYear` 字段 | 2 改   | 5 分钟   |
| 2    | 写 `src/utils/home-utils.ts`                                  | 1 新   | 10 分钟  |
| 3    | 写 `src/components/pages/home/home.css`                       | 1 新   | 30 分钟  |
| 4    | 写 `HomeNavbar.astro`                                         | 1 新   | 15 分钟  |
| 5    | 写 `HomeFooter.astro`                                         | 1 新   | 10 分钟  |
| 6    | 写 `HomeHero.astro`                                           | 1 新   | 10 分钟  |
| 7    | 写 `HomeFeatured.astro`                                       | 1 新   | 15 分钟  |
| 8    | 写 `HomeArticleList.astro`                                    | 1 新   | 15 分钟  |
| 9    | 写 `HomeCategoryGrid.astro`                                   | 1 新   | 10 分钟  |
| 10   | 写 `HomeLayout.astro`（组合 + Swup 占位）                     | 1 新   | 15 分钟  |
| 11   | 改 `src/pages/[...page].astro` 切换到 HomeLayout              | 1 改   | 5 分钟   |
| 12   | 全量验证：type-check + lint + build + 5 个手动场景            | 0      | 20 分钟  |

---

## Task 1: 在 footerConfig 加 startYear 字段

**Files:**

- Modify: `src/types/config.ts`（找到 `FooterConfig` 类型加字段）
- Modify: `src/config/footerConfig.ts`（实例加字段）

- [ ] **Step 1: 查看 FooterConfig 类型定义**

Run: `grep -n "FooterConfig" src/types/config.ts`

预期输出包含一行形如 `export type FooterConfig = {`，记下行号。

- [ ] **Step 2: 修改 FooterConfig 类型，增加可选 startYear 字段**

打开 `src/types/config.ts`，定位到 `FooterConfig` 类型：

```ts
export type FooterConfig = {
  enable: boolean; // 是否启用Footer HTML注入功能
  customHtml?: string; // 自定义HTML内容，用于添加备案号等信息
};
```

改为：

```ts
export type FooterConfig = {
  enable: boolean; // 是否启用Footer HTML注入功能
  customHtml?: string; // 自定义HTML内容，用于添加备案号等信息
  startYear?: number; // 首页 Footer 起始版权年份（默认 2021）
};
```

- [ ] **Step 3: 修改 footerConfig.ts 实例，写入 startYear**

打开 `src/config/footerConfig.ts`，改为：

```ts
import type { FooterConfig } from "../types/config";

export const footerConfig: FooterConfig = {
  // 是否启用Footer HTML注入功能
  enable: false,
  // 首页 Footer 起始版权年份
  startYear: 2021,
};

// 直接编辑 config/FooterConfig.html 文件来添加备案号等自定义内容
```

- [ ] **Step 4: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误（项目原本可能已有 tsconfig 警告，关注是否引入新报错）。如果输出包含 `error TS` 且涉及上面两个文件，回到 Step 2-3 检查。

- [ ] **Step 5: Commit**

```bash
git add src/types/config.ts src/config/footerConfig.ts
git commit -m "feat(config): add startYear field to FooterConfig for home page footer"
```

---

## Task 2: 写 src/utils/home-utils.ts

**Files:**

- Create: `src/utils/home-utils.ts`

- [ ] **Step 1: 创建文件并写入内容**

创建 `src/utils/home-utils.ts`：

```ts
import { type CollectionEntry, render } from "astro:content";
import { getSortedPosts } from "@/utils/content-utils";

/**
 * 取最新一篇 pinned=true 的文章。
 * getSortedPosts() 已经把 pinned 文章排在前面，所以遍历到第一个 pinned 就是目标。
 * @returns 最新的置顶文章，或 undefined（无任何置顶文章时）
 */
export async function getFeaturedPost(): Promise<
  CollectionEntry<"posts"> | undefined
> {
  const sorted = await getSortedPosts();
  return sorted.find((p) => p.data.pinned === true);
}

/**
 * 获取一篇文章的阅读时长 / 字数 meta，来自 remark-reading-time plugin。
 * 仅用于 HomeFeatured（只调用一次，性能可接受）。
 */
export async function getFeaturedPostMeta(
  post: CollectionEntry<"posts">,
): Promise<{ minutes: number; words: number }> {
  const { remarkPluginFrontmatter } = await render(post);
  return {
    minutes: remarkPluginFrontmatter.minutes ?? 0,
    words: remarkPluginFrontmatter.words ?? 0,
  };
}
```

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。如有 `Cannot find module 'astro:content'` 错误，可能是 `pnpm dev` 未跑过 Astro 生成 `.astro/types.d.ts`——跑 `pnpm astro sync` 解决。

- [ ] **Step 3: Commit**

```bash
git add src/utils/home-utils.ts
git commit -m "feat(utils): add home-utils for featured post and reading meta"
```

---

## Task 3: 写 src/components/pages/home/home.css

**Files:**

- Create: `src/components/pages/home/home.css`

**说明：** 本任务搬运 `new-design.html` 第 7-695 行 `<style>` 块的全部 CSS，但做两个改造：

1. 所有选择器加 `.home-page ` 前缀，作用域隔离
2. 暗色模式钩子从 `@media (prefers-color-scheme: dark)` + `[data-theme]` 改成监听 Firefly 的 `html.dark` 和 `html[data-theme="dark"]`

- [ ] **Step 1: 创建目录**

Run: `mkdir -p src/components/pages/home`

- [ ] **Step 2: 创建 home.css 并写入完整样式**

创建 `src/components/pages/home/home.css`，写入：

```css
/* ============================================================
 * 首页专用样式 — 作用域：.home-page
 * 设计稿来源：new-design.html (OD 生成)
 * Spec: docs/superpowers/specs/2026-06-09-homepage-redesign-design.md
 * ============================================================ */

/* ============ 字体 & 布局变量 ============ */
.home-page {
  --font-display:
    "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", system-ui,
    sans-serif;
  --font-body:
    -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei",
    system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace;
  --maxw: 1080px;
  --gutter: clamp(20px, 4vw, 40px);

  /* 浅色（默认） */
  --bg: oklch(99% 0.004 270);
  --surface: oklch(100% 0 0);
  --surface-soft: oklch(97.5% 0.008 270);
  --fg: oklch(18% 0.02 270);
  --fg-strong: oklch(12% 0.025 270);
  --muted: oklch(50% 0.015 270);
  --muted-soft: oklch(62% 0.012 270);
  --border: oklch(92% 0.008 270);
  --border-soft: oklch(95% 0.006 270);
  --accent: oklch(56% 0.18 270);
  --accent-soft: oklch(96% 0.025 270);
  --accent-fg: oklch(48% 0.2 270);
}

/* 暗色：复用 Firefly 主题钩子（双钩子兜底） */
html.dark .home-page,
html[data-theme="dark"] .home-page {
  --bg: oklch(15% 0.018 270);
  --surface: oklch(18% 0.022 270);
  --surface-soft: oklch(20% 0.025 270);
  --fg: oklch(94% 0.008 270);
  --fg-strong: oklch(98% 0.004 270);
  --muted: oklch(65% 0.015 270);
  --muted-soft: oklch(55% 0.012 270);
  --border: oklch(28% 0.025 270);
  --border-soft: oklch(24% 0.022 270);
  --accent: oklch(72% 0.16 270);
  --accent-soft: oklch(25% 0.05 270);
  --accent-fg: oklch(80% 0.15 270);
}

/* ============ 基础层：撑满 + 覆盖 Firefly 全局背景 ============ */
.home-page {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.65;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "ss01", "cv11";
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}
.home-page a {
  color: inherit;
  text-decoration: none;
}
.home-page button {
  font: inherit;
  cursor: pointer;
  background: none;
  border: 0;
  color: inherit;
}

/* ============ Top navigation ============ */
.home-page .nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bg) 88%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border-soft);
}
.home-page .nav-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 14px var(--gutter);
  display: flex;
  align-items: center;
  gap: 24px;
}
.home-page .brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  color: var(--fg-strong);
  letter-spacing: -0.01em;
}
.home-page .brand-mark {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    oklch(45% 0.22 290) 100%
  );
  display: grid;
  place-items: center;
  color: white;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 2px 8px color-mix(in oklab, var(--accent) 35%, transparent);
}
.home-page .nav-links {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.home-page .nav-link {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--muted);
  transition:
    color 0.15s,
    background 0.15s;
}
.home-page .nav-link:hover {
  color: var(--fg-strong);
  background: var(--surface-soft);
}
.home-page .nav-link.active {
  color: var(--fg-strong);
  font-weight: 500;
}
.home-page .nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.home-page .search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
  min-width: 200px;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.home-page .search-trigger:hover {
  border-color: var(--accent);
}
.home-page .search-trigger svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}
.home-page .kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  color: var(--muted);
  margin-left: auto;
}
.home-page .icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: var(--muted);
  transition:
    background 0.15s,
    color 0.15s;
}
.home-page .icon-btn:hover {
  background: var(--surface-soft);
  color: var(--fg-strong);
}
.home-page .icon-btn svg {
  width: 16px;
  height: 16px;
}

/* ============ Hero ============ */
.home-page .hero {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 96px var(--gutter) 56px;
}
.home-page .hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-fg);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.home-page .hero-eyebrow::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent);
}
.home-page .hero-headline {
  font-family: var(--font-display);
  font-size: clamp(36px, 5.6vw, 56px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  font-weight: 600;
  color: var(--fg-strong);
  max-width: 18ch;
  text-wrap: balance;
}
.home-page .hero-headline em {
  font-style: normal;
  color: var(--accent-fg);
  font-weight: 500;
}
.home-page .hero-sub {
  margin-top: 22px;
  max-width: 56ch;
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
}
.home-page .hero-meta {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}
.home-page .hero-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.home-page .hero-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    oklch(45% 0.22 290) 100%
  );
  display: grid;
  place-items: center;
  color: white;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 2px 12px color-mix(in oklab, var(--accent) 30%, transparent);
}
.home-page .hero-author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}
.home-page .hero-author-info strong {
  color: var(--fg-strong);
  font-weight: 500;
}
.home-page .hero-author-info span {
  color: var(--muted-soft);
}

/* ============ Section header ============ */
.home-page .section {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 var(--gutter);
}
.home-page .section + .section {
  margin-top: 80px;
}
.home-page .section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-soft);
}
.home-page .section-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-strong);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}
.home-page .section-title::before {
  content: "";
  width: 18px;
  height: 1px;
  background: var(--accent);
}
.home-page .section-action {
  font-size: 13px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
}
.home-page .section-action:hover {
  color: var(--accent-fg);
}
.home-page .section-action svg {
  width: 12px;
  height: 12px;
}

/* ============ Featured ============ */
.home-page .featured {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin-bottom: 64px;
}
.home-page .featured-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 36px 32px;
  background: linear-gradient(
    180deg,
    var(--surface) 0%,
    var(--surface-soft) 100%
  );
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s,
    transform 0.2s;
}
.home-page .featured-card:hover {
  border-color: color-mix(in oklab, var(--accent) 50%, var(--border));
  transform: translateY(-2px);
}
.home-page .featured-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle at top right,
    color-mix(in oklab, var(--accent) 16%, transparent),
    transparent 70%
  );
  pointer-events: none;
}
.home-page .featured-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent-fg);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  position: relative;
}
.home-page .featured-eyebrow svg {
  width: 12px;
  height: 12px;
}
.home-page .featured-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  color: var(--fg-strong);
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  max-width: 28ch;
  text-wrap: balance;
  position: relative;
}
.home-page .featured-excerpt {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 64ch;
  margin-bottom: 22px;
  position: relative;
}
.home-page .featured-foot {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 13px;
  color: var(--muted-soft);
  font-family: var(--font-mono);
  position: relative;
}
.home-page .featured-foot .dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--muted-soft);
}
.home-page .featured-foot .read-more {
  margin-left: auto;
  color: var(--accent-fg);
  font-family: var(--font-body);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ============ Article list ============ */
.home-page .article-list {
  display: flex;
  flex-direction: column;
}
.home-page .article {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  align-items: start;
  gap: 28px;
  padding: 22px 0;
  border-bottom: 1px solid var(--border-soft);
  transition: padding 0.2s;
}
.home-page .article:hover {
  padding-left: 8px;
}
.home-page .article:last-child {
  border-bottom: 0;
}
.home-page .article-date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted-soft);
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
  padding-top: 3px;
}
.home-page .article-date .year {
  color: var(--muted);
  display: block;
  font-size: 11px;
  opacity: 0.7;
}
.home-page .article-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.home-page .article-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--fg-strong);
  line-height: 1.4;
  letter-spacing: -0.01em;
}
.home-page .article:hover .article-title {
  color: var(--accent-fg);
}
.home-page .article-excerpt {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.55;
  max-width: 60ch;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.home-page .article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--muted-soft);
  margin-top: 2px;
}
.home-page .tag-pill {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--surface-soft);
  border: 1px solid var(--border-soft);
  color: var(--muted);
}
.home-page .article-arrow {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--muted-soft);
  transition:
    color 0.2s,
    transform 0.2s;
  margin-top: 2px;
}
.home-page .article:hover .article-arrow {
  color: var(--accent-fg);
  transform: translateX(2px);
}

/* ============ Categories grid ============ */
.home-page .category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.home-page .cat-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 18px;
  background: var(--surface);
  transition:
    border-color 0.15s,
    transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.home-page .cat-card:hover {
  border-color: color-mix(in oklab, var(--accent) 40%, var(--border));
  transform: translateY(-1px);
}
.home-page .cat-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-strong);
  display: flex;
  align-items: center;
  gap: 10px;
}
.home-page .cat-icon {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.home-page .cat-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted-soft);
  font-variant-numeric: tabular-nums;
}

/* ============ Footer ============ */
.home-page .foot {
  max-width: var(--maxw);
  margin: 96px auto 0;
  padding: 32px var(--gutter) 48px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--muted-soft);
}
.home-page .foot-links {
  display: flex;
  gap: 18px;
}
.home-page .foot-links a:hover {
  color: var(--accent-fg);
}
.home-page .foot-mono {
  font-family: var(--font-mono);
}

/* ============ Pagination 微调（复用 Pagination.astro，仅调整视觉） ============ */
.home-page .pagination-container {
  max-width: var(--maxw);
  margin: 48px auto 0;
  padding: 0 var(--gutter);
  display: flex;
  justify-content: center;
}

/* ============ Responsive ============ */
@media (max-width: 720px) {
  .home-page .nav-links {
    display: none;
  }
  .home-page .search-trigger {
    min-width: 0;
    padding: 6px 10px;
  }
  .home-page .search-trigger span:not(.kbd) {
    display: none;
  }
  .home-page .hero {
    padding: 56px var(--gutter) 40px;
  }
  .home-page .hero-meta {
    gap: 16px;
  }
  .home-page .article {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 18px 0;
  }
  .home-page .article-date {
    font-size: 11px;
    order: 0;
  }
  .home-page .article-date .year {
    display: inline;
  }
  .home-page .article-arrow {
    display: none;
  }
  .home-page .article-excerpt {
    -webkit-line-clamp: 2;
  }
  .home-page .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .home-page .featured-card {
    padding: 24px 22px;
  }
  .home-page .foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
```

- [ ] **Step 3: 验证不影响其他页面**

CSS 此时还没被任何文件 import，对站点行为无影响。但确认文件可被静态检查通过：

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/home/home.css
git commit -m "feat(home): add scoped CSS with oklch variables for redesigned home page"
```

---

## Task 4: 写 HomeNavbar.astro

**Files:**

- Create: `src/components/pages/home/HomeNavbar.astro`

- [ ] **Step 1: 创建组件文件**

创建 `src/components/pages/home/HomeNavbar.astro`：

```astro
---
import LightDarkSwitch from "@/components/controls/LightDarkSwitch.svelte";
import { profileConfig, siteConfig } from "@/config";
import { url } from "@/utils/url-utils";

const currentPath = Astro.url.pathname;
const isActive = (path: string): boolean => {
	if (path === "/") {
		// 首页 + 分页页都算 active
		return currentPath === url("/") || /^\/(page\/\d+\/?)?$/.test(currentPath);
	}
	return currentPath.startsWith(url(path));
};

const githubLink = profileConfig.links.find((l) => l.name === "GitHub")?.url;
const brandInitial = siteConfig.title.charAt(0);
---

<header class="nav">
	<div class="nav-inner">
		<a class="brand" href={url("/")}>
			<span class="brand-mark">{brandInitial}</span>
			<span>{siteConfig.title}</span>
		</a>
		<nav class="nav-links">
			<a class={`nav-link ${isActive("/") ? "active" : ""}`} href={url("/")}>文章</a>
			<a class={`nav-link ${isActive("/archive") ? "active" : ""}`} href={url("/archive/")}>归档</a>
			<a class={`nav-link ${isActive("/about") ? "active" : ""}`} href={url("/about/")}>关于</a>
		</nav>
		<div class="nav-right">
			<a class="search-trigger" href={url("/search/")} aria-label="搜索文章">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="7"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</svg>
				<span>搜索文章…</span>
				<span class="kbd">⌘K</span>
			</a>
			<div class="home-theme-toggle">
				<LightDarkSwitch client:only="svelte" />
			</div>
			<a class="icon-btn" href={url("/rss.xml")} aria-label="RSS">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"></path>
					<circle cx="5" cy="19" r="1"></circle>
				</svg>
			</a>
			{githubLink && (
				<a class="icon-btn" href={githubLink} aria-label="GitHub" target="_blank" rel="noopener noreferrer">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.64.71 1.03 1.61 1.03 2.71 0 3.84-2.34 4.69-4.57 4.94.36.31.67.92.67 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"></path>
					</svg>
				</a>
			)}
		</div>
	</div>
</header>

<script is:inline data-astro-rerun>
	// ⌘K 全局快捷键：跳转到 /search
	(function bindSearchHotkey() {
		if (window.__homeNavSearchBound) return;
		window.__homeNavSearchBound = true;
		document.addEventListener("keydown", function (e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				// 仅在首页生效，避免覆盖其他页面的 ⌘K
				if (!document.querySelector(".home-page")) return;
				e.preventDefault();
				window.location.href = "/search/";
			}
		});
	})();
</script>

<style is:global>
	/* LightDarkSwitch 容器适配：把 Svelte 组件按钮缩到 icon-btn 同尺寸 */
	.home-page .home-theme-toggle {
		display: inline-flex;
		align-items: center;
	}
	.home-page .home-theme-toggle :global(button) {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		display: grid;
		place-items: center;
		color: var(--muted);
		background: transparent;
		border: none;
		transition: background 0.15s, color 0.15s;
	}
	.home-page .home-theme-toggle :global(button:hover) {
		background: var(--surface-soft);
		color: var(--fg-strong);
	}
</style>
```

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。如有 `LightDarkSwitch` 相关错误，确认路径 `@/components/controls/LightDarkSwitch.svelte` 存在：`ls src/components/controls/LightDarkSwitch.svelte`

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeNavbar.astro
git commit -m "feat(home): add HomeNavbar with search link and theme toggle"
```

---

## Task 5: 写 HomeFooter.astro

**Files:**

- Create: `src/components/pages/home/HomeFooter.astro`

- [ ] **Step 1: 创建组件**

创建 `src/components/pages/home/HomeFooter.astro`：

```astro
---
import { footerConfig, profileConfig, siteConfig } from "@/config";
import { url } from "@/utils/url-utils";

const currentYear = new Date().getFullYear();
const startYear = footerConfig.startYear ?? 2021;
const yearRange = startYear === currentYear ? `${currentYear}` : `${startYear} — ${currentYear}`;
const githubLink = profileConfig.links.find((l) => l.name === "GitHub")?.url;
---

<footer class="foot">
	<div class="foot-mono">© {yearRange} · {profileConfig.name}</div>
	<div class="foot-links">
		<a href={url("/rss.xml")}>RSS</a>
		<a href={url("/sitemap-index.xml")}>Sitemap</a>
		{githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer">GitHub</a>}
		<a href={url("/about/")}>关于</a>
	</div>
	<div class="foot-mono">Astro · Firefly · {siteConfig.title}</div>
</footer>
```

**说明：** 仓库的 `footerConfig.html` 用于注入备案号等 HTML（来自 `customHtml` 字段，本页未启用 `enable: false`）。如果未来用户启用该字段，可后续 iteration 把 `customHtml` 也渲染到 Footer。

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeFooter.astro
git commit -m "feat(home): add HomeFooter with config-driven copyright and links"
```

---

## Task 6: 写 HomeHero.astro

**Files:**

- Create: `src/components/pages/home/HomeHero.astro`

- [ ] **Step 1: 创建组件**

创建 `src/components/pages/home/HomeHero.astro`：

```astro
---
import { profileConfig } from "@/config";

// Hero 文案硬编码（spec 明确选择）
const eyebrow = "FRONTEND · ENGINEERING NOTES";
const headlinePrefix = "写代码，";
const headlineEm = "记问题";
const headlineSuffix = "，";
const headlineLine2 = "偶尔聊点工程之外。";
const subtitle =
	"翔子的个人博客。前端 / Node.js / 工程化 / 工具，以及把重复 3 次的事 AI 化的尝试。";
const authorLocation = "前端开发工程师 · 上海";
const avatarChar = profileConfig.name.charAt(0);
---

<section class="hero">
	<div class="hero-eyebrow">{eyebrow}</div>
	<h1 class="hero-headline">
		{headlinePrefix}<em>{headlineEm}</em>{headlineSuffix}<br />{headlineLine2}
	</h1>
	<p class="hero-sub">{subtitle}</p>
	<div class="hero-meta">
		<div class="hero-author">
			<div class="hero-avatar">{avatarChar}</div>
			<div class="hero-author-info">
				<strong>{profileConfig.name}</strong>
				<span>{authorLocation}</span>
			</div>
		</div>
	</div>
</section>
```

**注意：** HomeLayout 提供了一个隐藏的 `<h1 class="sr-only">` 用于 SEO。这里 Hero 的 `<h1>` 是可见标题。Layout.astro 没有强制要求只有一个 h1，但为避免双 h1 SEO 警告，HomeLayout 的 `sr-only h1` 应改成 `<span class="sr-only">`（在 Task 10 中处理）。

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeHero.astro
git commit -m "feat(home): add HomeHero with hardcoded copy"
```

---

## Task 7: 写 HomeFeatured.astro

**Files:**

- Create: `src/components/pages/home/HomeFeatured.astro`

- [ ] **Step 1: 创建组件**

创建 `src/components/pages/home/HomeFeatured.astro`：

```astro
---
import type { CollectionEntry } from "astro:content";
import { getFeaturedPostMeta } from "@/utils/home-utils";
import { getPostUrlBySlug } from "@/utils/url-utils";

interface Props {
	post: CollectionEntry<"posts">;
}

const { post } = Astro.props;
const { minutes } = await getFeaturedPostMeta(post);

const publishedDate = new Date(post.data.published);
const publishedStr = `${publishedDate.getFullYear()}-${String(publishedDate.getMonth() + 1).padStart(2, "0")}-${String(publishedDate.getDate()).padStart(2, "0")}`;

const excerpt =
	post.data.description && post.data.description.length > 0
		? post.data.description
		: "";

const tagsToShow = (post.data.tags ?? []).slice(0, 2);
const postUrl = getPostUrlBySlug(post.id);
---

<section class="section">
	<div class="featured">
		<a class="featured-card" href={postUrl}>
			<div class="featured-eyebrow">
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 2 14.5 8.5 21 9 16 13.5 17.5 20 12 16.5 6.5 20 8 13.5 3 9 9.5 8.5z"></path>
				</svg>
				PINNED · 最新长文
			</div>
			<h2 class="featured-title">{post.data.title}</h2>
			{excerpt && <p class="featured-excerpt">{excerpt}</p>}
			<div class="featured-foot">
				<span>{publishedStr}</span>
				{minutes > 0 && (
					<>
						<span class="dot"></span>
						<span>{minutes} min read</span>
					</>
				)}
				{tagsToShow.length > 0 && (
					<>
						<span class="dot"></span>
						<span>{tagsToShow.map((t) => `#${t}`).join(" · ")}</span>
					</>
				)}
				<span class="read-more">阅读全文 →</span>
			</div>
		</a>
	</div>
</section>
```

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeFeatured.astro
git commit -m "feat(home): add HomeFeatured card for latest pinned post"
```

---

## Task 8: 写 HomeArticleList.astro

**Files:**

- Create: `src/components/pages/home/HomeArticleList.astro`

- [ ] **Step 1: 创建组件**

创建 `src/components/pages/home/HomeArticleList.astro`：

```astro
---
import type { CollectionEntry } from "astro:content";
import { url } from "@/utils/url-utils";
import { getPostUrlBySlug } from "@/utils/url-utils";

interface Props {
	posts: CollectionEntry<"posts">[];
	totalCount?: number;
}

const { posts, totalCount } = Astro.props;
const archiveCount = totalCount ?? posts.length;

function formatDateParts(date: Date | string) {
	const d = new Date(date);
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	const yyyy = d.getFullYear();
	return { md: `${mm}-${dd}`, year: yyyy };
}
---

<section class="section" id="articles">
	<div class="section-head">
		<h2 class="section-title">最近文章</h2>
		<a class="section-action" href={url("/archive/")}>
			归档 ({archiveCount})
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M5 12h14M13 5l7 7-7 7"></path>
			</svg>
		</a>
	</div>

	<div class="article-list">
		{posts.map((post) => {
			const { md, year } = formatDateParts(post.data.published);
			const tagsToShow = (post.data.tags ?? []).slice(0, 2);
			const excerpt = post.data.description ?? "";
			return (
				<a class="article" href={getPostUrlBySlug(post.id)}>
					<div class="article-date">
						{md}<span class="year">{year}</span>
					</div>
					<div class="article-body">
						<h3 class="article-title">{post.data.title}</h3>
						{excerpt && <p class="article-excerpt">{excerpt}</p>}
						{tagsToShow.length > 0 && (
							<div class="article-meta">
								{tagsToShow.map((t) => (
									<span class="tag-pill">#{t}</span>
								))}
							</div>
						)}
					</div>
					<div class="article-arrow" aria-hidden="true">→</div>
				</a>
			);
		})}
	</div>
</section>
```

**说明：** 列表不显示 reading time（避免对每篇 render() 拖慢构建），仅 HomeFeatured 显示。这是与 spec 第 6.3 节一致的取舍。

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeArticleList.astro
git commit -m "feat(home): add HomeArticleList timeline view"
```

---

## Task 9: 写 HomeCategoryGrid.astro

**Files:**

- Create: `src/components/pages/home/HomeCategoryGrid.astro`

- [ ] **Step 1: 创建组件**

创建 `src/components/pages/home/HomeCategoryGrid.astro`：

```astro
---
import type { Category } from "@/utils/content-utils";
import { url } from "@/utils/url-utils";

interface Props {
	categories: Category[];
}

const { categories } = Astro.props;

// 分类色块 hue（按索引循环分配）— spec 第 6.4 节
const HUE_PALETTE = [270, 200, 160, 60, 0, 300, 120, 240, 90];
function hueFor(index: number): number {
	return HUE_PALETTE[index % HUE_PALETTE.length];
}
---

<section class="section" id="categories">
	<div class="section-head">
		<h2 class="section-title">分类</h2>
		<a class="section-action" href={url("/archive/")}>
			全部分类
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M5 12h14M13 5l7 7-7 7"></path>
			</svg>
		</a>
	</div>
	<div class="category-grid">
		{categories.map((cat, i) => (
			<a class="cat-card" href={cat.url}>
				<span class="cat-name">
					<span class="cat-icon" style={`background: oklch(60% 0.16 ${hueFor(i)});`}></span>
					{cat.name}
				</span>
				<span class="cat-count">{cat.count}</span>
			</a>
		))}
	</div>
</section>
```

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/home/HomeCategoryGrid.astro
git commit -m "feat(home): add HomeCategoryGrid using existing Category data"
```

---

## Task 10: 写 HomeLayout.astro

**Files:**

- Create: `src/layouts/HomeLayout.astro`

- [ ] **Step 1: 创建 HomeLayout**

创建 `src/layouts/HomeLayout.astro`：

```astro
---
import HomeFooter from "@/components/pages/home/HomeFooter.astro";
import HomeNavbar from "@/components/pages/home/HomeNavbar.astro";
import Layout from "./Layout.astro";

import "@/components/pages/home/home.css";

interface Props {
	title?: string;
	description?: string;
}

const { title, description } = Astro.props;
---

<Layout title={title} description={description}>
	<slot slot="head" name="head" />

	{/*
		Swup 配置（astro.config.mjs:74-79）要求以下 6 个 container 必须存在，
		否则首页 ↔ 其他页切换会回退到整页刷新。
		HomeLayout 不需要 banner / sidebar / TOC，但必须提供同名占位 div。
	*/}
	<div id="banner-overlay-container" class="hidden" aria-hidden="true"></div>
	<div id="banner-dim-container" class="hidden" aria-hidden="true"></div>
	<div id="left-sidebar-dynamic" class="hidden" aria-hidden="true"></div>
	<div id="right-sidebar-dynamic" class="hidden" aria-hidden="true"></div>
	<div id="floating-toc-wrapper" class="hidden" aria-hidden="true"></div>

	<div class="home-page">
		<HomeNavbar />

		{/* swup-container：唯一会被 Swup 替换的真实内容容器 */}
		<main id="swup-container" class="transition-main">
			{/*
				sr-only 标题用 span 而非 h1，避免与 Hero 的 h1 冲突。
				Layout.astro 已经处理 <title> meta tag，此处仅用于 a11y 兜底。
			*/}
			{title && <span class="sr-only">{title}</span>}
			<div id="content-wrapper" class="onload-animation transition-leaving">
				<slot />
			</div>
		</main>

		<HomeFooter />
	</div>
</Layout>

<style>
	/* sr-only 工具类（项目可能已有，这里独立兜底） */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
```

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: Commit**

```bash
git add src/layouts/HomeLayout.astro
git commit -m "feat(home): add HomeLayout wrapping Layout with home-only structure"
```

---

## Task 11: 改 [...page].astro 切换到 HomeLayout

**Files:**

- Modify: `src/pages/[...page].astro`

- [ ] **Step 1: 替换文件内容**

打开 `src/pages/[...page].astro`，把整个文件内容替换为：

```astro
---
import type { GetStaticPaths } from "astro";
import Pagination from "@/components/common/Pagination.astro";
import HomeArticleList from "@/components/pages/home/HomeArticleList.astro";
import HomeCategoryGrid from "@/components/pages/home/HomeCategoryGrid.astro";
import HomeFeatured from "@/components/pages/home/HomeFeatured.astro";
import HomeHero from "@/components/pages/home/HomeHero.astro";
import { siteConfig } from "@/config";
import HomeLayout from "@/layouts/HomeLayout.astro";
import { getCategoryList, getSortedPosts } from "@/utils/content-utils";
import { getFeaturedPost } from "@/utils/home-utils";

export const getStaticPaths = (async ({ paginate }) => {
	const allBlogPosts = await getSortedPosts();
	const pageSize = siteConfig.pagination.postsPerPage;
	return paginate(allBlogPosts, { pageSize });
}) satisfies GetStaticPaths;

const { page } = Astro.props;

const featuredPost = await getFeaturedPost();
const categories = await getCategoryList();
const len = page.data.length;
---

<HomeLayout title={siteConfig.title} description={siteConfig.subtitle}>
	<HomeHero />
	{featuredPost && <HomeFeatured post={featuredPost} />}
	<HomeArticleList posts={page.data} totalCount={page.total} />
	{page.total > page.size && (
		<div class="pagination-container">
			<Pagination
				class="mx-auto onload-animation"
				page={page}
				style={`animation-delay: calc(var(--content-delay) + ${len * 50}ms)`}
			/>
		</div>
	)}
	<HomeCategoryGrid categories={categories} />
</HomeLayout>
```

**变化说明：**

- 移除 `MainGridLayout`、`PostPage` 导入
- 移除底部 `<script>`（响应式分页脚本是 MainGridLayout 的，HomeLayout 不需要）
- 新增 HomeLayout + 5 个新组件
- 分页器外面包了 `.pagination-container` 让 home.css 控制宽度居中

- [ ] **Step 2: 验证类型检查通过**

Run: `pnpm type-check`

Expected: 无新增错误。

- [ ] **Step 3: 启动 dev server 验证**

Run: `pnpm dev`

打开浏览器访问 `http://localhost:4321/`（或终端实际输出的端口）。

验证清单：

- [ ] 首页能正常加载，不报 500
- [ ] 看到 Hero 区"写代码，记问题，偶尔聊点工程之外。"
- [ ] 看到置顶卡（如果有 pinned 文章）
- [ ] 看到文章时间线列表
- [ ] 看到分页器（如果文章超过 pageSize）
- [ ] 看到分类网格
- [ ] 看到 Footer

如有错误，截屏/复制错误信息，回到对应 Task 检查。

- [ ] **Step 4: Commit**

```bash
git add src/pages/[...page].astro
git commit -m "feat(home): switch home page to HomeLayout with redesigned components"
```

---

## Task 12: 全量验证

**Files:** 无

本任务不写代码，只跑验证。

- [ ] **Step 1: 跑 type-check**

Run: `pnpm type-check`

Expected: 退出码 0，无 error。允许已有的 tsconfig 警告（如非相对路径警告）。

- [ ] **Step 2: 跑 lint**

Run: `pnpm lint`

Expected: 退出码 0。若有自动修复，会被 Biome 处理。

- [ ] **Step 3: 跑 build**

Run: `pnpm build`

Expected: 退出码 0，输出 `Complete!`。Build 时间可能比之前略长（因 HomeFeatured 调用 render()）。

如 build 失败，错误信息中应能定位到哪个文件，回到对应 Task 修复。

- [ ] **Step 4: 启动 preview，做 5 个手动场景验证**

Run: `pnpm preview`

打开浏览器访问首页，按以下场景验证：

**场景 1：浅 / 深色切换**

- 点击 Navbar 主题切换按钮
- 验证：首页色彩立即从浅色切换到深色（或反向），Hero、文章、分类卡片配色全部跟随
- 切换到 `/about` 页面，主题状态保持
- 切回首页，主题状态保持

**场景 2：桌面 / 移动响应式**

- 浏览器开 DevTools，模拟 iPhone 12（375px 宽）
- 验证：Navbar 隐藏中间导航链接、搜索按钮压缩、文章列表变单列、Footer 竖排
- 切回桌面宽度，恢复三列分类网格

**场景 3：分页跳转**

- 点击分页器"下一页"
- 验证：URL 变为 `/2/` 或 `/page/2/`，内容刷新为下一页文章
- 浏览器前进 / 后退按钮工作正常

**场景 4：Swup 软切换**

- DevTools 打开 Network 面板
- 从首页点击"归档 (XXX)"链接
- 验证：Network 中看到 fetch 请求而非 document 请求；页面切换无白屏闪烁
- 点击浏览器后退，回到首页
- 验证：同样是 Swup 软切换

**场景 5：搜索跳转**

- 点击 Navbar 搜索按钮 → 跳转到 `/search/` 页面
- 回到首页，按 `⌘K`（Mac）或 `Ctrl+K`（Win/Linux）→ 跳转到 `/search/`

- [ ] **Step 5: 验证其他页面没有被破坏**

依次访问以下页面，确认视觉与改动前完全一致：

- `/about/` — 应使用 MainGridLayout，三栏 + Banner 不变
- `/archive/` — 同上
- `/posts/<任意一篇>/` — 文章详情页，TOC、侧栏、阅读进度等功能不变
- `/guestbook/`、`/friends/` — 一致
- 暗色模式在所有页面都正常

**关键检查：** 用浏览器 DevTools 的 Elements 面板，确认其他页面的 `<body>` 下**没有** `.home-page` 元素，说明作用域隔离成功。

- [ ] **Step 6: 最终 Commit（如有调整）**

如果发现需要微调（如 LightDarkSwitch 样式不完美、间距偏差），在 `home.css` 里改完后：

```bash
git add src/components/pages/home/home.css
git commit -m "style(home): fine-tune home page styling"
```

如无调整，跳过此步。

---

## 实施完成后的产出清单

**新增文件（9 个）：**

- `src/layouts/HomeLayout.astro`
- `src/utils/home-utils.ts`
- `src/components/pages/home/home.css`
- `src/components/pages/home/HomeNavbar.astro`
- `src/components/pages/home/HomeFooter.astro`
- `src/components/pages/home/HomeHero.astro`
- `src/components/pages/home/HomeFeatured.astro`
- `src/components/pages/home/HomeArticleList.astro`
- `src/components/pages/home/HomeCategoryGrid.astro`

**修改文件（3 个）：**

- `src/types/config.ts`（加 `FooterConfig.startYear` 字段）
- `src/config/footerConfig.ts`（加 `startYear: 2021`）
- `src/pages/[...page].astro`（切换到 HomeLayout）

**Git commits（12 个）：** 每个 Task 一个 commit，便于回滚。

**未修改文件：** Layout.astro、MainGridLayout.astro、其他所有 pages、所有 widget/common 组件、所有 config 文件（除 footerConfig）、astro.config.mjs。

---

## 故障排除参考

| 症状                                | 可能原因                                     | 修复                                                                                                    |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 首页加载白屏                        | HomeLayout 缺 Swup container                 | 检查 5 个隐藏 div 全部存在                                                                              |
| 首页色彩与其他页面一样              | home.css 没 import                           | 检查 HomeLayout `import "@/components/pages/home/home.css"`                                             |
| 暗色切换无效                        | 主题钩子不匹配                               | 浏览器 DevTools 检查 `<html>` 是否有 `class="dark"` 或 `data-theme="dark"`，home.css 是否包含对应选择器 |
| 其他页面被首页样式污染              | CSS 作用域失效                               | 检查 home.css 所有选择器是否都以 `.home-page ` 开头                                                     |
| 首页 ↔ 其他页切换白屏闪烁           | Swup container 不一致                        | 对比 HomeLayout 与 MainGridLayout 的 6 个 ID 名是否完全一致                                             |
| LightDarkSwitch 按钮变形            | 全局样式被 home-theme-toggle 包裹覆盖        | 检查 HomeNavbar.astro 末尾 `<style is:global>` 块                                                       |
| build 报 `render is not a function` | astro:content 类型未同步                     | 跑 `pnpm astro sync`                                                                                    |
| GitHub 链接显示为 undefined         | profileConfig.links 中没有 name=="GitHub" 项 | 用户改了 profileConfig，调整 HomeNavbar/HomeFooter 的查找逻辑                                           |
| `⌘K` 在其他页面也跳转到 /search     | 全局事件未限制作用域                         | 检查 HomeNavbar 的 script 中 `if (!document.querySelector(".home-page")) return;` 是否生效              |

---

## 自检结果

**1. Spec 覆盖：**

- ✅ Spec §2 所有 14 项决策都有 Task 实现
- ✅ Spec §3 文件清单 12 个文件 = Task 1-11 全覆盖
- ✅ Spec §4 HomeLayout 骨架 → Task 10
- ✅ Spec §5 数据层 → Task 2 + Task 11
- ✅ Spec §6 组件 → Task 4-9
- ✅ Spec §7 home.css → Task 3
- ✅ Spec §8 实施步骤 → Task 1-12 对应
- ✅ Spec §11 验收标准 → Task 12 全部验证

**2. 无占位符：** 所有 Task 步骤都有完整代码 / 命令 / 验证方式，无 TBD / TODO / "省略" 字样。

**3. 类型一致性：**

- `getFeaturedPost()` 返回 `CollectionEntry<"posts"> | undefined`，HomeFeatured props `post: CollectionEntry<"posts">`，[...page].astro 用 `featuredPost &&` 守卫 ✅
- `getCategoryList()` 返回 `Category[]`，HomeCategoryGrid props `categories: Category[]` ✅
- `getFeaturedPostMeta()` 返回 `{ minutes; words }`，HomeFeatured 只用 `minutes` ✅
- `footerConfig.startYear?: number`，HomeFooter 用 `?? 2021` 兜底 ✅
- HomeNavbar 引用 `profileConfig.links.find(...)?.url`，全部 optional chain ✅
