---
title: "2026-05-20-blog-v2-migration"
published: 2026-05-20
description: ""
tags: ["superpowers"]
category: "其他"
image: api
draft: false
---
# Blog V2 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 VitePress 0.7.2 博客迁移到 Astro + Firefly 主题，在 v2 分支上完成

**Architecture:** 在当前仓库创建 v2 分支，清空旧文件后初始化 Firefly 模板，编写迁移脚本批量转换 221 篇文章的 frontmatter 和图片路径，配置站点信息，验证后合并

**Tech Stack:** Astro, Firefly (Fuwari fork), pnpm, Node.js >= 22

---

## Task 1: 创建 v2 分支并初始化 Firefly 模板

**Files:**

- Create: `astro.config.mjs` (from Firefly template)
- Create: `src/config/siteConfig.ts` (自定义配置)
- Create: `src/config/profileConfig.ts` (作者信息)
- Create: `src/config/navBarConfig.ts` (导航栏)

- [ ] **Step 1: 创建 v2 分支**

```bash
cd /Users/xiangwang/My/github/blog
git checkout -b v2
```

- [ ] **Step 2: 清空旧文件（保留 .git 目录）**

```bash
# 先备份旧内容到临时目录
mkdir -p /Users/xiangwang/.claude/jobs/2f88b569/blog-backup
cp -r docs /Users/xiangwang/.claude/jobs/2f88b569/blog-backup/
cp -r .vitepress /Users/xiangwang/.claude/jobs/2f88b569/blog-backup/

# 清空工作目录（保留 .git）
git rm -rf .
git clean -fd
```

- [ ] **Step 3: 克隆 Firefly 模板内容到当前目录**

```bash
# 克隆 Firefly 到临时目录
git clone --depth 1 https://github.com/CuteLeaf/Firefly.git /tmp/firefly-template

# 复制 Firefly 文件到当前仓库（排除 .git）
rsync -av --exclude='.git' /tmp/firefly-template/ .

# 清理临时目录
rm -rf /tmp/firefly-template
```

- [ ] **Step 4: 安装依赖**

```bash
pnpm install
```

- [ ] **Step 5: 验证模板可运行**

```bash
pnpm dev
# 访问 http://localhost:4321 确认模板正常
```

- [ ] **Step 6: 提交初始化**

```bash
git add -A
git commit -m "init: Firefly template on v2 branch"
```

---

## Task 2: 配置站点信息

**Files:**

- Modify: `src/config/siteConfig.ts`
- Modify: `src/config/profileConfig.ts`
- Modify: `src/config/navBarConfig.ts`
- Modify: `src/config/sidebarConfig.ts`
- Modify: `astro.config.mjs`（site URL）

- [ ] **Step 1: 修改 siteConfig.ts**

将以下字段改为自定义值：

```typescript
const SITE_LANG = "zh_CN";

export const siteConfig: SiteConfig = {
  title: "翔子的博客",
  subtitle: "学习笔记",
  site_url: "https://wang1xiang.github.io", // 根据实际域名调整
  description: "前端开发工程师的学习笔记与技术分享",
  keywords: ["翔子", "前端", "博客", "技术博客", "Astro"],
  themeColor: {
    hue: 165,
    fixed: false,
    defaultMode: "system",
  },
  // ... 其余保持默认
  navbar: {
    logo: {
      type: "icon",
      value: "material-symbols:home-pin-outline",
    },
    title: "翔子的博客",
  },
  pages: {
    friends: false,
    sponsor: false,
    guestbook: false,
    bangumi: false,
    gallery: false,
  },
  categoryBar: true,
  postListLayout: {
    defaultMode: "list",
    mobileDefaultMode: "list",
    showTags: true,
    descriptionLines: 2,
    allowSwitch: true,
  },
  pagination: {
    postsPerPage: 10,
  },
  showLastModified: true,
  sharePoster: false,
  generateOgImages: false,
  // ... 其余保持默认
};
```

- [ ] **Step 2: 修改 profileConfig.ts**

填入作者信息（翔子，前端开发工程师）。根据 Firefly 模板的 profileConfig 结构填写昵称、头像、简介、社交链接等。

- [ ] **Step 3: 修改 navBarConfig.ts**

设置导航栏菜单项：首页、归档、分类。

- [ ] **Step 4: 修改 astro.config.mjs 的 base 路径**

如果部署到 `wang1xiang.github.io`，base 设为 `"/"`。如果部署到 `wang1xiang.github.io/blog`，base 设为 `"/blog"`。

- [ ] **Step 5: 删除 Firefly 示例文章**

```bash
rm -rf src/content/posts/firefly.md
rm -rf src/content/posts/markdown-*.md
rm -rf src/content/posts/code-examples.md
rm -rf src/content/posts/katex-math-example.md
rm -rf src/content/posts/video.md
rm -rf src/content/posts/draft.md
rm -rf src/content/posts/encrypted-demo.md
rm -rf src/content/posts/guide/
rm -rf src/content/posts/mdx-example.mdx
rm -rf src/content/posts/images/
```

- [ ] **Step 6: 验证配置生效**

```bash
pnpm dev
# 确认站点标题、导航栏、主题色等正确
```

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "config: customize site settings for 翔子的博客"
```

---

## Task 3: 编写迁移脚本

**Files:**

- Create: `scripts/migrate.mjs`

迁移脚本的核心逻辑：

- [ ] **Step 1: 创建迁移脚本**

```javascript
// scripts/migrate.mjs
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, basename, dirname, relative } from "node:path";
import matter from "gray-matter";

// 配置
const OLD_DOCS = "/Users/xiangwang/.claude/jobs/2f88b569/blog-backup/docs";
const NEW_POSTS = "src/content/posts";
const REPORT_PATH = "migration-report.csv";

// 分类映射表
const CATEGORY_MAP = {
  leetcode: "算法",
  work: "工作",
  vue: "前端框架",
  react: "前端框架",
  reactNative: "前端框架",
  taro: "前端框架",
  flutter: "前端框架",
  vite: "前端工程",
  pnpm: "前端工程",
  electron: "前端工程",
  nest: "前端工程",
  node: "前端工程",
  tiptap: "编辑器",
  prosemirror: "编辑器",
  vscode: "编辑器",
  javascript: "语言基础",
  css: "语言基础",
  http: "语言基础",
  docker: "DevOps",
  git: "DevOps",
  linux: "DevOps",
  tool: "工具",
  wechat: "工具",
  mobile: "工具",
  webrtc: "其他",
  photography: "其他",
};

// 日期格式化：2025-2-12 → 2025-02-12
function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return String(dateStr);
  return parts.map((p) => p.padStart(2, "0")).join("-");
}

// 收集所有 md 文件
function collectMdFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过 images 目录
      if (entry.name === "images") continue;
      results.push(...collectMdFiles(fullPath));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

// 迁移单篇文章
function migratePost(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // 确定源目录名（如 leetcode、vue）
  const relativePath = relative(OLD_DOCS, filePath);
  const dirName = relativePath.split("/")[0];

  // 映射分类
  const category = CATEGORY_MAP[dirName] || "其他";

  // 转换 frontmatter
  const newData = {
    title: data.title || basename(filePath, ".md"),
    published: normalizeDate(data.date),
    description: data.describe || data.description || "",
    tags: Array.isArray(data.tags) ? data.tags : [data.tags || dirName],
    category,
    image: "api",
    draft: false,
  };

  // 新的 frontmatter + 内容
  const newRaw = matter.stringify(content, newData);

  // 目标路径（每篇文章一个子目录，md 命名 index.md，图片在同目录下）
  const slug = basename(filePath, ".md").replace(/\.mdx$/, "");
  const targetDir = join(NEW_POSTS, category, slug);
  const targetPath = join(targetDir, "index.md");

  // 复制图片到文章子目录下
  const sourceImagesDir = join(dirname(filePath), "images");
  let imagesMigrated = false;
  if (existsSync(sourceImagesDir)) {
    mkdirSync(targetDir, { recursive: true });
    cpSync(sourceImagesDir, targetDir, { recursive: true });
    imagesMigrated = true;
  }

  // 替换图片路径：./images/xxx.png → ./xxx.png（图片现在和 md 同目录）
  let processedContent = newRaw;
  if (imagesMigrated) {
    processedContent = processedContent.replace(/\.\/images\//g, "./");
    processedContent = processedContent.replace(/(?<!\.\/)images\//g, "./");
  }

  // 写入目标文件
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(targetPath, processedContent, "utf-8");

  return {
    source: relativePath,
    target: relative(NEW_POSTS, targetPath),
    category,
    imagesMigrated,
    status: "success",
  };
}

// 主流程
function main() {
  const files = collectMdFiles(OLD_DOCS);
  console.log(`Found ${files.length} markdown files`);

  // 确保目标目录存在
  const categories = [...new Set(Object.values(CATEGORY_MAP))];
  for (const cat of categories) {
    mkdirSync(join(NEW_POSTS, cat), { recursive: true });
  }

  const results = [];
  for (const file of files) {
    try {
      const result = migratePost(file);
      results.push(result);
    } catch (err) {
      results.push({
        source: relative(OLD_DOCS, file),
        target: "FAILED",
        category: "",
        imagesMigrated: false,
        status: `error: ${err.message}`,
      });
    }
  }

  // 生成报告
  const csvHeader = "source,target,category,imagesMigrated,status";
  const csvRows = results.map(
    (r) =>
      `${r.source},${r.target},${r.category},${r.imagesMigrated},${r.status}`,
  );
  writeFileSync(REPORT_PATH, [csvHeader, ...csvRows].join("\n"), "utf-8");

  // 打印统计
  const success = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;
  console.log(`\nMigration complete: ${success} success, ${failed} failed`);
  console.log(`Report saved to ${REPORT_PATH}`);
}

main();
```

- [ ] **Step 2: 安装 gray-matter 依赖**

```bash
pnpm add -D gray-matter
```

- [ ] **Step 3: 测试运行迁移脚本**

```bash
node scripts/migrate.mjs
```

检查 `migration-report.csv` 确认没有大量失败。

- [ ] **Step 4: 检查迁移结果**

```bash
# 统计各分类文章数
find src/content/posts -name "*.md" | sed 's|src/content/posts/||' | cut -d'/' -f1 | sort | uniq -c | sort -rn

# 查看失败项
grep -v "success" migration-report.csv
```

- [ ] **Step 5: 修复异常项**

根据报告中的失败项，手动修复格式异常的文章。

- [ ] **Step 6: 提交**

```bash
git add src/content/posts/ scripts/migrate.mjs
git commit -m "migrate: import 221 posts from VitePress blog"
```

---

## Task 4: 验证与调试

**Files:**

- 可能修改: `src/content/posts/` 下的异常文章

- [ ] **Step 1: 本地启动验证**

```bash
pnpm dev
```

- [ ] **Step 2: 逐项检查**

- 首页文章列表是否正常显示
- 点击进入文章，内容是否完整
- 图片是否正常加载（重点检查含图片的文章）
- 分类页面 9 个分类是否都有内容
- 标签页面是否正常
- 搜索功能是否可用

- [ ] **Step 3: 修复发现的问题**

记录并修复所有发现的问题，如图片路径错误、frontmatter 格式问题等。

- [ ] **Step 4: 构建验证**

```bash
pnpm build
```

确认构建无错误。

- [ ] **Step 5: 提交修复**

```bash
git add -A
git commit -m "fix: post-migration fixes"
```

---

## Task 5: 部署配置

**Files:**

- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs`（确认 site 和 base 配置）

- [ ] **Step 1: 创建 GitHub Actions 部署工作流**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [v2]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 确认 astro.config.mjs 的 site 和 base**

确保 `site` 指向正确的 GitHub Pages URL，`base` 设置正确。

- [ ] **Step 3: 推送 v2 分支并触发部署**

```bash
git push origin v2
```

在 GitHub 仓库 Settings → Pages 中设置 Source 为 GitHub Actions。

- [ ] **Step 4: 验证线上部署**

访问 GitHub Pages URL 确认部署成功。

- [ ] **Step 5: 提交**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task 6: 合并到 master

- [ ] **Step 1: 确认 v2 分支一切正常**

线上部署可访问，文章内容完整，图片正常。

- [ ] **Step 2: 合并 v2 到 master**

```bash
git checkout master
git merge v2
git push origin master
```

- [ ] **Step 3: 更新 GitHub Pages 部署分支**

如果之前 GitHub Pages 部署的是 master 分支，确认 master 合并后自动部署成功。

- [ ] **Step 4: 清理临时备份**

```bash
rm -rf /Users/xiangwang/.claude/jobs/2f88b569/blog-backup
```

- [ ] **Step 5: 删除迁移脚本和报告（可选）**

```bash
rm scripts/migrate.mjs migration-report.csv
git add -A
git commit -m "chore: clean up migration artifacts"
```
