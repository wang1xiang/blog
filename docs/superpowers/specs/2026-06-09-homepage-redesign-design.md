# 首页重设计 - 适配 new-design.html 到 Firefly 模板

**日期**：2026-06-09
**范围**：仅首页（`src/pages/[...page].astro`），其他页面不受影响
**设计稿来源**：项目根目录 `new-design.html`（OD 生成）

---

## 1. 背景与目标

### 现状

- 当前博客基于 Astro + Firefly 模板（v6.10.5）
- 首页文件 `src/pages/[...page].astro` 使用 `MainGridLayout`（900 行的全站三栏底盘）
- `MainGridLayout` 承载：Banner 壁纸系统、侧边栏 widget、Swup 路由容器、Live2D/Spine、CategoryBar、悬浮控件等

### 设计稿形态

- 极简单列布局（max-width 1080px，居中）
- 无侧边栏、无 Banner 图、无富功能 widget
- 自带顶栏（含搜索 + 主题切换）和 Footer
- 内容流：Hero → 置顶大卡 → 文章时间线列表 → 分类网格 → Footer
- 配色用 oklch 变量，字体用 Inter，与 Firefly 现有体系不同

### 核心矛盾

设计稿与 Firefly 三栏体系**布局哲学冲突**，无法"只换样式不动结构"。

### 目标

在 Firefly 内创建独立的 `HomeLayout`，让首页脱离 `MainGridLayout` 三栏体系，按设计稿走极简单列。**其他页面保持原样不动**。

---

## 2. 关键决策汇总

| 决策点                                | 选择                                                             | 备注                                                  |
| ------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| 范围策略                              | 路径 2：在 Firefly 内新建独立 `HomeLayout`                       | 不回退 VitePress，不动其他页面                        |
| 顶栏 / Footer                         | 设计稿自带的极简版本                                             | 不复用 Firefly 的 Navbar / Footer 组件                |
| ⌘K 搜索                               | 去掉命令面板，搜索按钮跳转 `/search`                             | 复用现有 pagefind 搜索页                              |
| 置顶卡                                | 优先取最新 `pinned: true` 的文章，无 pinned 时回退到最新一篇     | 利用 `getSortedPosts()` 的排序，取 `[0]` 即可同时满足 |
| Hero 文案                             | 标题/副标题/作者**硬编码**在组件中                               | 不引入新配置文件                                      |
| Hero 统计数字                         | **去掉**统计部分                                                 | 简化                                                  |
| 文章列表分页                          | 保留分页器                                                       | 复用现有 `Pagination.astro`                           |
| 分类区 / 标签云                       | **仅保留分类网格，去掉标签云**                                   | 简化                                                  |
| 文章列表样式                          | 不带封面图（时间线风格）                                         | 贴设计稿                                              |
| 色彩体系                              | 首页用设计稿独立 oklch 变量（CSS 作用域隔离）                    | 不污染其他页面                                        |
| 暗色模式                              | 复用 Firefly 现有钩子（`html.dark` + `html[data-theme="dark"]`） | 主题切换状态全站一致                                  |
| Live2D / Spine / CategoryBar / Banner | 首页全部禁用                                                     | 进入其他页面后仍可用                                  |
| Swup 软切换                           | 保留，HomeLayout 提供 5 个隐藏占位容器                           | 避免回退到整页刷新                                    |
| Footer 字段                           | 从 `siteConfig` / `profileConfig` / `footerConfig` 读取          | 需在 `footerConfig.ts` 加 `startYear` 字段            |

---

## 3. 架构与文件清单

### 新增文件

```
src/layouts/HomeLayout.astro                       新增（~150 行，结构骨架）
src/utils/home-utils.ts                            新增（置顶 + 分类聚合工具）
src/components/pages/home/
  ├─ HomeNavbar.astro                              新增（极简顶栏 + 主题切换）
  ├─ HomeFooter.astro                              新增（极简 Footer，读 config）
  ├─ HomeHero.astro                                新增（硬编码 Hero 区，无统计）
  ├─ HomeFeatured.astro                            新增（接受 pinned 文章作为 prop）
  ├─ HomeArticleList.astro                         新增（时间线列表，接受文章数组）
  ├─ HomeCategoryGrid.astro                        新增（接受分类数据）
  └─ home.css                                      新增（所有首页样式 + oklch 变量）
docs/superpowers/specs/2026-06-09-homepage-redesign-design.md   本文件
```

### 修改文件

```
src/pages/[...page].astro                          修改（用 HomeLayout 替代 MainGridLayout）
src/config/footerConfig.ts                         修改（增加 startYear 字段）
```

### 不动文件

- `src/layouts/MainGridLayout.astro`（其他页面继续使用）
- `src/layouts/Layout.astro`（HomeLayout 包裹它，复用 head/meta/字体/analytics）
- 其他所有 `src/pages/*.astro` 页面
- 现有 `src/components/` 下所有组件（包括 Navbar、Footer、PostCard、SideBar 等）

---

## 4. HomeLayout 详细设计

### 4.1 整体骨架

```astro
---
import Layout from "./Layout.astro";
import HomeNavbar from "@/components/pages/home/HomeNavbar.astro";
import HomeFooter from "@/components/pages/home/HomeFooter.astro";
import "@/components/pages/home/home.css";

interface Props { title?: string; description?: string; }
const { title, description } = Astro.props;
---
<Layout title={title} description={description}>
  <slot slot="head" name="head" />

  <!-- Swup 必需的 5 个隐藏占位（顺序按 astro.config.mjs:74-79） -->
  <div id="banner-overlay-container" class="hidden"></div>
  <div id="banner-dim-container" class="hidden"></div>
  <div id="left-sidebar-dynamic" class="hidden"></div>
  <div id="right-sidebar-dynamic" class="hidden"></div>
  <div id="floating-toc-wrapper" class="hidden"></div>

  <div class="home-page">
    <HomeNavbar />
    <main id="swup-container" class="transition-main">
      <h1 class="sr-only">{title}</h1>
      <div id="content-wrapper" class="onload-animation transition-leaving">
        <slot />
      </div>
    </main>
    <HomeFooter />
  </div>
</Layout>
```

### 4.2 Swup 容器约束

`astro.config.mjs` 第 72-80 行定义了 6 个 Swup containers：

```js
containers: [
  "#banner-overlay-container",
  "#banner-dim-container",
  "#swup-container",
  "#left-sidebar-dynamic",
  "#right-sidebar-dynamic",
  "#floating-toc-wrapper",
],
```

**HomeLayout 必须全部提供这 6 个 ID**，否则首页↔其他页切换会回退到整页刷新。其中 `#swup-container` 是真实内容容器，其余 5 个用 `hidden` 隐藏占位。

### 4.3 必须保留的 class

| 元素                         | class                                 | 用途                                           |
| ---------------------------- | ------------------------------------- | ---------------------------------------------- |
| `<main id="swup-container">` | `transition-main`                     | Swup 主容器动画触发器，MainGridLayout 同名使用 |
| `<div id="content-wrapper">` | `onload-animation transition-leaving` | 入场动画 + Swup 离场动画                       |
| `<h1>`                       | `sr-only`                             | SEO + 可访问性，全站约定                       |

---

## 5. 数据层设计

### 5.1 `[...page].astro` 改造

```astro
---
import type { GetStaticPaths } from "astro";
import Pagination from "@/components/common/Pagination.astro";
import HomeLayout from "@/layouts/HomeLayout.astro";
import HomeHero from "@/components/pages/home/HomeHero.astro";
import HomeFeatured from "@/components/pages/home/HomeFeatured.astro";
import HomeArticleList from "@/components/pages/home/HomeArticleList.astro";
import HomeCategoryGrid from "@/components/pages/home/HomeCategoryGrid.astro";
import { siteConfig } from "@/config";
import { getSortedPosts, getCategoryList } from "@/utils/content-utils";
import { getFeaturedPost } from "@/utils/home-utils";

export const getStaticPaths = (async ({ paginate }) => {
  const allBlogPosts = await getSortedPosts();
  const pageSize = siteConfig.pagination.postsPerPage;
  return paginate(allBlogPosts, { pageSize });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
const featuredPost = await getFeaturedPost();
const categories = await getCategoryList();
---

<HomeLayout title={siteConfig.title} description={siteConfig.subtitle}>
  <HomeHero />
  {featuredPost && <HomeFeatured post={featuredPost} />}
  <HomeArticleList posts={page.data} />
  {page.total > page.size && (
    <Pagination
      class="mx-auto onload-animation"
      page={page}
      style={`animation-delay: calc(var(--content-delay) + ${page.data.length * 50}ms)`}
    />
  )}
  <HomeCategoryGrid categories={categories} />
</HomeLayout>
```

### 5.2 `src/utils/home-utils.ts`

```ts
// getFeaturedPost(): 取首页 Featured 卡片要展示的文章
//   - 优先级：最新 pinned 文章 > 最新一篇文章
//   - getSortedPosts() 已把 pinned 排在最前、其余按时间倒序，所以 sorted[0] 同时满足两种情况
//   - 只有当站点没有任何文章时才返回 undefined
//   - 返回 CollectionEntry<"posts"> | undefined

// getFeaturedPostMeta(post): 调用 astro:content render() 获取 reading time
//   - 返回 { minutes: number; words: number }
//   - 用于 HomeFeatured 显示 "X min read"
//   - 仅调用一次（只有一篇置顶），性能开销可接受
```

**分类数据复用现有 `getCategoryList()`**（位于 `src/utils/content-utils.ts:86`），返回 `Category[] = { name, count, url }[]`。不重复实现。

### 5.3 组件 Props 规范

| 组件               | Props                                               | 数据来源                                           |
| ------------------ | --------------------------------------------------- | -------------------------------------------------- |
| `HomeHero`         | 无（硬编码）                                        | —                                                  |
| `HomeFeatured`     | `post: CollectionEntry<"posts">`                    | `getFeaturedPost()`                                |
| `HomeArticleList`  | `posts: CollectionEntry<"posts">[]`                 | `page.data`                                        |
| `HomeCategoryGrid` | `categories: Category[]` (`{ name; count; url }[]`) | `getCategoryList()` (复用现有)                     |
| `HomeNavbar`       | 无                                                  | 读 `siteConfig` + `Astro.url.pathname`             |
| `HomeFooter`       | 无                                                  | 读 `siteConfig` + `profileConfig` + `footerConfig` |

---

## 6. 组件设计细节

### 6.1 HomeHero

硬编码内容（用户已明确选择硬编码）：

- Eyebrow：`FRONTEND · ENGINEERING NOTES`
- 标题：`写代码，记问题，偶尔聊点工程之外。`（"记问题"用 `<em>` 高亮）
- 副标题：`翔子的个人博客。前端 / Node.js / 工程化 / 工具，以及把重复 3 次的事 AI 化的尝试。`
- 作者卡：头像（"翔" 字 + 渐变）+ 名字（翔子）+ 描述（前端开发工程师 · 上海）
- **不渲染统计数字**（已确认去掉）

### 6.2 HomeFeatured

接受 `post` prop，渲染：

- Eyebrow：`PINNED · 最新长文`（含星形 icon）
- 标题：`post.data.title`
- 摘要：`post.data.description`（若无则截取正文前 120 字）
- Footer：发布日期 + 阅读时长（通过 `render(post)` 获取 `remarkPluginFrontmatter.minutes`）+ 标签 + "阅读全文 →"
- 链接：`/posts/{post.slug}`

如果 `featuredPost` 为 `undefined`，整个区块不渲染。

### 6.3 HomeArticleList

遍历 `posts` 数组，每条渲染：

- 日期列：`MM-DD` 大字号 + `<span class="year">YYYY</span>` 小字号
- 标题：`post.data.title`
- 摘要：`post.data.description`（截取，移动端 2 行，桌面 1 行）
- 标签 pill：`post.data.tags.slice(0, 2)`，每个加 `#` 前缀
- 阅读时长：`{minutes} min`
- 箭头列：`→`（移动端隐藏）
- 链接：`/posts/{post.slug}`
- 不渲染封面图

### 6.4 HomeCategoryGrid

3 列网格（移动端 2 列），每个分类卡：

- 色块：按索引循环分配 oklch hue：`[270, 200, 160, 60, 0, 300, 120, 240, 90]`
- 分类名 + 计数
- 链接：`/archive?category={slug}`

### 6.5 HomeNavbar

```astro
- 品牌区：翔 字标 + 站名（读 siteConfig.title）
- 导航：文章 / 归档 / 关于（按 Astro.url.pathname 判断 active 状态）
- 右侧：
  - 搜索按钮 = <a href="/search">（不开命令面板）
  - 主题切换 = 复用 <LightDarkSwitch> 组件（Svelte）
  - RSS 图标 = <a href={url("/rss.xml")}>
  - GitHub 图标 = <a href={profileConfig.links.find(l => l.name === "GitHub")?.url}>
- ⌘K 全局快捷键：监听 keydown，按下跳转 /search
- 所有 href 用 url() 工具函数包装（兼容 base path）
```

### 6.6 HomeFooter

```astro
- 左侧版权：© {startYear} — {currentYear} · {profileConfig.name} · {ICP if exists}
  - startYear 从 footerConfig 读（新增字段）
  - currentYear 用 new Date().getFullYear()
  - ICP 仅在 footerConfig 中有此字段时渲染
- 中间链接：RSS / Sitemap / GitHub / 关于
- 右侧署名："Astro · Firefly"（硬编码，去掉 "自托管于 Vercel"）
- 响应式：移动端竖排
```

---

## 7. 样式设计（home.css）

### 7.1 作用域策略

所有选择器加 `.home-page` 前缀，确保不污染其他页面：

```css
.home-page {
  /* 变量 + 基础样式 */
}
.home-page .nav {
  /* 顶栏 */
}
.home-page .hero {
  /* Hero */
}
.home-page .article {
  /* 文章列表 */
}
/* ...等等 */
```

### 7.2 变量体系

```css
.home-page {
  /* 字体 */
  --font-display: "Inter", -apple-system, "PingFang SC", system-ui, sans-serif;
  --font-body:
    -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
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

/* 暗色：复用 Firefly 主题钩子（双钩子保险） */
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
```

### 7.3 基础层

```css
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
  font-feature-settings: "ss01", "cv11";
}
```

### 7.4 组件样式

完整搬运 `new-design.html` 的 `<style>` 块（700+ 行），所有选择器加 `.home-page` 前缀。包含：

- `.nav` / `.nav-inner` / `.brand` / `.nav-link` / `.search-trigger` / `.icon-btn`
- `.hero` / `.hero-eyebrow` / `.hero-headline` / `.hero-sub` / `.hero-meta` / `.hero-author` / `.hero-avatar`
- `.section` / `.section-head` / `.section-title` / `.section-action`
- `.featured` / `.featured-card` / `.featured-eyebrow` / `.featured-title` / `.featured-excerpt` / `.featured-foot`
- `.article-list` / `.article` / `.article-date` / `.article-body` / `.article-title` / `.article-excerpt` / `.article-meta` / `.tag-pill` / `.article-arrow`
- `.category-grid` / `.cat-card` / `.cat-name` / `.cat-icon` / `.cat-count`
- `.foot` / `.foot-links` / `.foot-mono`
- `@media (max-width: 720px)` 响应式块

### 7.5 Pagination 微调

复用现有 `Pagination.astro` 组件，在 `home.css` 加适配样式：

```css
.home-page .pagination {
  /* 调整与 Firefly 默认样式不一致的部分 */
}
```

---

## 8. 实施步骤与验证

### 8.1 步骤（每步可独立提交）

| 步  | 操作                                                              | 验证                       |
| --- | ----------------------------------------------------------------- | -------------------------- |
| 1   | `footerConfig.ts` 加 `startYear: 2021`                            | `pnpm type-check`          |
| 2   | 写 `home-utils.ts`：`getFeaturedPost()` + `getFeaturedPostMeta()` | `pnpm type-check`          |
| 3   | 写 `home.css`（全部样式）                                         | 静态检查（无引用方不报错） |
| 4   | 写 `HomeNavbar.astro` + `HomeFooter.astro`                        | `pnpm type-check`          |
| 5   | 写 `HomeHero.astro`                                               | `pnpm type-check`          |
| 6   | 写 `HomeFeatured`、`HomeArticleList`、`HomeCategoryGrid`          | `pnpm type-check`          |
| 7   | 写 `HomeLayout.astro`（组合 + Swup 占位）                         | `pnpm type-check`          |
| 8   | 改 `[...page].astro` 用 HomeLayout                                | `pnpm dev` 启动渲染        |
| 9   | `pnpm type-check` + `pnpm lint` + `pnpm build`                    | 三项全过                   |
| 10  | 手动验证 5 个场景（见下）                                         | 浏览器测试                 |

### 8.2 必须验证的 5 个场景

1. **浅色 / 深色切换**：点击主题切换，首页色彩立即更新；切到其他页再切回，主题状态保持
2. **桌面 / 移动响应式**：缩放到 720px 以下，导航折叠、文章列表变单列、Footer 竖排
3. **分页跳转**：点击下一页，URL 变为 `/page/2`，内容刷新
4. **Swup 软切换**：首页 → 关于页 → 首页，无整页闪烁；浏览器 Network 显示 fetch 而非 document 请求
5. **`/search` 跳转**：点击搜索按钮、按 ⌘K，跳转到现有 search 页面

### 8.3 必须保证不破坏的项

- `/about`、`/archive`、`/posts/*` 等其他页面视觉与功能与改动前完全一致
- 暗色模式在所有页面正常工作
- pagefind 搜索功能可用
- RSS、Sitemap、SEO meta 标签正常输出
- `pnpm build` 通过

---

## 9. 风险与缓解

| 风险                                | 影响                   | 缓解                                                     |
| ----------------------------------- | ---------------------- | -------------------------------------------------------- |
| Swup 6 个 container 漏掉            | 首页↔其他页变整页刷新  | 步骤 7 完成后单独测试此场景                              |
| `home.css` 作用域不严               | 其他页面被污染         | 步骤 3 后访问 `/about` 验证                              |
| `LightDarkSwitch` 样式冲突          | 主题按钮视觉错乱       | 步骤 4 验证；不行则在 `home.css` 微调                    |
| 暗色钩子未触发                      | 切暗后首页不变         | 已确认 `Layout.astro:285` 写 `html.dark`，CSS 双钩子兜底 |
| `profileConfig.links` 找不到 GitHub | Footer GitHub 链接为空 | 用 optional chaining，找不到时不渲染该图标               |
| Firefly 全局样式漏到首页            | 首页字体/间距异常      | 步骤 3 后用浏览器 DevTools 检查 inherited styles         |
| 改坏 `[...page].astro` 影响构建     | 整站构建失败           | `git checkout` 单文件即可回滚                            |

---

## 10. 范围边界（明确不做的事）

- ❌ 不改其他页面（about、archive、posts、guestbook 等）
- ❌ 不改 `MainGridLayout.astro` / `Layout.astro`
- ❌ 不改主题切换逻辑，复用现有 `LightDarkSwitch`
- ❌ 不改 pagefind 搜索实现，搜索按钮只是跳转到现有 `/search` 页
- ❌ 不改 Firefly 全局配置文件（除 `footerConfig.ts` 加一个 `startYear` 字段）
- ❌ 不实现命令面板（⌘K 仅做 `/search` 跳转）
- ❌ 不引入新依赖（不装新字体包，Inter 用 system fallback）

---

## 11. 验收标准

实施完成后，必须满足：

- [ ] `pnpm type-check` 通过，无新增错误
- [ ] `pnpm lint` 通过（Biome 检查）
- [ ] `pnpm build` 通过
- [ ] 首页视觉与 `new-design.html` 设计意图一致（布局、配色、层级、间距）
- [ ] 首页支持浅色 / 深色切换，与 Firefly 主题状态同步
- [ ] 首页支持桌面 / 移动响应式
- [ ] 首页分页可点，文章数据真实来自 content collection
- [ ] 首页 → 其他页 → 首页 走 Swup 软切换（不整页刷新）
- [ ] 其他页面（about / archive / posts 等）视觉与功能与改动前完全一致
- [ ] 不引入新依赖，不动其他页面代码

---

## 12. 后续可能的迭代（不在本次范围内）

- 把 Hero 文案从硬编码迁到独立配置文件 `homePageConfig.ts`
- 加回 Hero 统计数字（动态计算文章数、字数、年限）
- 实现 ⌘K 命令面板（接入 pagefind）
- 加入标签云区块
- 全站统一为新设计风格（需另起项目重设计其他页面）
