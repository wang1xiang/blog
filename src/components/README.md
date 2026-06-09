# 📦 Components 组件目录

当前项目已经从 Firefly 默认三栏首页，迁移为一套独立的极简 `HomeLayout` 视觉体系。

组件目录现在分成两类：

1. **新版页面体系**：`src/components/pages/home/` + `src/layouts/HomeLayout.astro`
2. **Firefly 旧布局体系**：`MainGridLayout`、侧边栏、widget、旧 Navbar/Footer 等，仍被部分未迁移页面使用

不要因为某个旧组件不再被首页 / archive / posts / about / search 使用，就直接删除整个旧布局系统；`friends`、`bangumi`、`gallery`、`guestbook`、`sponsor`、`rss`、`404` 等页面仍然依赖它。

---

## ✅ 新版页面体系

### `pages/home/` - 新版极简页面组件

这些组件服务于当前新版主视觉，全部依赖 `.home-page` 作用域样式。

- `HomeNavbar.astro` - 新版顶部导航；使用 `data-no-swup` 避免 Swup 局部切换导致样式丢失
- `HomeFooter.astro` - 新版页脚；可见链接只保留 RSS / GitHub / 关于
- `HomeHero.astro` - 首页 Hero + 站点统计
- `HomeFeatured.astro` - 首页 Featured 文章卡片；优先 pinned，无 pinned 时取最新文章
- `HomeArticleList.astro` - 首页文章时间线列表，含标签与阅读时间
- `HomeCategoryGrid.astro` - 首页分类网格，跳转到 `/archive/?category=...`
- `HomeArchive.astro` - 新版归档页；按年份分组，支持 `?category=` / `?tag=` 客户端过滤
- `HomePost.astro` - 新版文章详情页；保留正文、加密文章、上一篇/下一篇、评论
- `HomeAbout.astro` - 新版关于页；内容目前硬编码在组件内
- `HomeSearch.svelte` - 新版搜索页；生产环境接 Pagefind，开发环境使用模拟结果
- `home.css` - 新版页面样式总入口；由 `Layout.astro` 全局引入，但所有规则都以 `.home-page` 作用域隔离

### `layouts/HomeLayout.astro`

新版页面统一使用的布局壳。

已使用该布局的页面：

- `/`
- `/archive/`
- `/posts/[slug]/`
- `/about/`
- `/search/`

注意：`HomeLayout` 仍包裹全局 `Layout.astro`，以复用 SEO、主题初始化、分析脚本、字体管理等基础能力。

---

## 🏗️ layout/ - Firefly 旧布局组件

这些组件属于旧 Firefly 三栏体系。

仍然保留，因为部分页面还没有迁移到新版布局。

- `CategoryBar.astro` - 旧布局分类栏
- `ConfigCarrier.astro` - 全局配置载体
- `DropdownMenu.astro` - 旧 Navbar 下拉菜单
- `Footer.astro` - 旧布局页脚
- `Navbar.astro` - 旧布局导航栏
- `NavMenuPanel.astro` - 旧导航菜单面板
- `SideBar.astro` - 旧布局侧边栏

### 旧文章列表组件（待清理候选）

以下组件已经不再被新版首页 / 文章详情使用，但删除前仍需全局引用检查和 build 验证：

- `PostPage.astro` - 旧首页文章列表布局
- `PostCard.astro` - 旧文章卡片
- `PostMeta.astro` - 旧文章元信息

---

## 🎮 controls/ - 导航和交互控件

### 仍在旧布局中使用

- `BackToHome.astro` - 返回主页按钮
- `BackToTop.astro` - 返回顶部按钮
- `FloatingControls.astro` - 旧布局右下角悬浮控件容器
- `FloatingTOC.astro` - 旧布局浮动目录组件
- `DisplaySettings.svelte` - 显示设置
- `DisplaySettingsIntegrated.svelte` - 集成显示设置
- `LightDarkSwitch.svelte` - 旧布局主题切换
- `Search.svelte` - 旧布局搜索入口
- `WallpaperSwitch.svelte` - 壁纸模式切换

### 待清理候选

- `ArchivePanel.svelte` - 旧归档面板；新版 `/archive/` 已改用 `HomeArchive.astro`
- `LayoutSwitchButton.svelte` - 旧文章页布局切换按钮；新版文章页不再使用

---

## 🔧 common/ - 公共可复用组件

通用组件，仍被新版或旧版页面使用。

- `ButtonLink.astro` - 链接按钮
- `ButtonTag.astro` - 标签按钮
- `DropdownItem.astro` / `DropdownItem.svelte` - 下拉选项
- `DropdownPanel.astro` / `DropdownPanel.svelte` - 下拉面板容器
- `FloatingButton.astro` - 悬浮按钮基础组件
- `Icon.svelte` - 图标组件
- `ImageWrapper.astro` - 图片包装器
- `Markdown.astro` - Markdown 内容样式包装器；新版文章页仍使用
- `Pagination.astro` - 静态路由分页；新版首页仍使用
- `ClientPagination.astro` - 客户端分页
- `PioMessageBox.astro` - Live2D / Spine 消息框
- `WidgetLayout.astro` - 旧 widget 容器；仍被旧侧边栏 widget 使用
- `CoverImage.astro` - 旧文章卡片/旧封面逻辑使用；删除前需确认旧 PostCard 是否删除

---

## 🧩 widget/ - 旧侧边栏小部件

这些组件仍服务于 `MainGridLayout`，不要单独删除。

- `Advertisement.astro`
- `Announcement.astro`
- `Calendar.astro`
- `Categories.astro`
- `Music.astro`
- `Profile.astro`
- `SidebarTOC.astro`
- `SiteStats.astro`
- `SpineModel.astro`
- `Tags.astro`

如果未来所有页面都迁移到 `HomeLayout`，再统一评估删除整个 widget 系统。

---

## ✨ features/ - 全局功能特效组件

这些组件多由 `Layout.astro` 或旧布局使用。

- `EncryptedContent.astro` - 加密内容基础能力
- `EncryptedPost.astro` - 加密文章；新版 `HomePost.astro` 仍使用
- `FancyboxManager.astro` - 图片查看器管理
- `FontManager.astro` - 字体加载和管理
- `KatexManager.astro` - 数学公式渲染；新版文章页仍使用
- `Live2DWidget.astro` - 旧看板娘能力
- `MusicManager.astro` - 全局音乐播放管理器
- `MusicPlayer.astro` - 音乐播放器 UI
- `SakuraEffect.astro` - 樱花特效
- `SpineModel.astro` - Spine 看板娘
- `TypewriterText.astro` - 旧 Banner 打字机文本

---

## 📃 pages/ - 其它页面特定组件

### `pages/bangumi/`

仍被 `/bangumi/` 使用。

- `BangumiSection.astro`
- `Card.astro`
- `FilterControls.astro`
- `TabNav.astro`

### `pages/gallery/`

仍被 `/gallery/` 使用。

- `AlbumCard.astro`
- `PhotoCard.astro`

### 待清理候选

- `AdvancedSearch.svelte` - 旧搜索组件；新版 `/search/` 已改用 `HomeSearch.svelte`

---

## 💬 comment/ - 评论系统组件

新版文章页仍通过 `HomePost.astro` 使用评论系统。

- `index.astro` - 评论主组件
- `Artalk.astro`
- `Disqus.astro`
- `Giscus.astro`
- `Twikoo.astro`
- `Waline.astro`

---

## 📊 analytics/ - 数据统计组件

由全局布局使用。

- `GoogleAnalytics.astro`
- `La51Analytics.astro`
- `MicrosoftClarity.astro`
- `UmamiAnalytics.astro`

---

## 🔧 misc/ - 杂项工具组件

### 待清理候选

新版文章页暂时不使用以下旧功能：

- `License.astro` - 旧文章版权区
- `RecommendedPost.astro` - 旧相关文章推荐
- `SharePoster.svelte` - 旧分享海报

删除前必须确认：

1. `rg "License|RecommendedPost|SharePoster" src` 无有效引用
2. `pnpm build` 通过

---

## 🧹 清理原则

删除旧代码前必须同时满足：

1. `rg` 确认没有实际代码引用（README 命中不算）
2. 不属于仍被 `MainGridLayout` 使用的旧布局系统
3. 不影响尚未迁移的页面：`friends`、`bangumi`、`gallery`、`guestbook`、`sponsor`、`rss`、`404`
4. 删除后使用 Node 24 跑 `pnpm build` 通过
5. 删除操作单独提交，便于回滚

推荐的第一批删除候选：

```txt
src/components/controls/ArchivePanel.svelte
src/components/pages/AdvancedSearch.svelte
src/components/layout/PostPage.astro
src/components/layout/PostCard.astro
src/components/layout/PostMeta.astro
src/components/misc/RecommendedPost.astro
src/components/misc/SharePoster.svelte
src/components/misc/License.astro
```

---

## 🗂️ 分类原则

| 分类          | 用途                | 特点                                 |
| ------------- | ------------------- | ------------------------------------ |
| `pages/home/` | 新版页面体系        | 首页 / 归档 / 文章 / 关于 / 搜索共用 |
| `layout/`     | 旧 Firefly 页面框架 | 仍服务未迁移页面                     |
| `controls/`   | 导航和交互          | 部分仍属于旧布局系统                 |
| `common/`     | 通用可复用组件      | 新旧页面都可能使用                   |
| `widget/`     | 旧侧边栏小部件      | 依赖 `MainGridLayout`                |
| `features/`   | 全局功能增强        | 由 Layout 或文章页使用               |
| `pages/`      | 其它页面特定组件    | bangumi / gallery 等                 |
| `comment/`    | 评论系统            | 新版文章页仍使用                     |
| `analytics/`  | 统计服务            | 全局使用                             |
| `misc/`       | 杂项辅助            | 多数旧文章功能待评估                 |
