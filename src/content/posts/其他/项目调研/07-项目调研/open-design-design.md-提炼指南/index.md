---
title: "Open-Design-DESIGN.md-提炼指南"
published: 2026-06-08
description: "OD 用得好不好的核心变量就是 DESIGN.md。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---
# Open Design DESIGN.md 9 节 schema 提炼指南

## 1. 为什么需要 DESIGN.md

OD 用得好不好的**核心变量**就是 DESIGN.md。

**没有 DESIGN.md 的 OD**：

- 输出风格随机，第 1 次和第 10 次完全不一样
- 颜色、间距、字体全靠模型脑补
- 跟"直接让 Claude Code 写 React"没本质区别

**有 DESIGN.md 的 OD**：

- 所有输出强制对齐同一份契约
- 100 个页面 1 种风格
- 品牌规范从"文档里大家尽量遵守"变成"代码里机械强制执行"

→ DESIGN.md 是 OD 的**灵魂**，不是可选项。

## 2. 两种提炼路径

### 路径 A：让 Claude 自动提炼（推荐）

只回答 3 个问题，Claude 直接出 DESIGN.md：

1. **品牌名/产品名**
2. **参考素材**（任选一种或多种）：
   - 现有项目代码仓库路径
   - 截图（已做的 UI、想模仿的网站截图）
   - 参考网站 URL（如 https://linear.app）
   - 已有 Figma 设计稿
   - 一段品牌调性描述（"赛博朋克 + 简洁混合"）
3. **使用场景**（B 端工具 / C 端营销 / 个人作品集 / ...）

**优势**：30 秒搞定，逆向工程出风格契约
**适用**：你有明确参考对象（已有项目、想模仿的产品）

### 路径 B：手动按 9 节填写

按下面的完整模板填，**全部填完约 30-60 分钟**。

**优势**：每个细节自己掌控，理解最深
**适用**：从零定义新品牌、要求精细化打磨

## 3. 完整 9 节 DESIGN.md 模板

整段可直接复制，按你的实际值替换占位符即可：

```markdown
# {品牌名} Design System

> 一句话品牌描述：例如 "一个让前端工程师 30 秒做出小红书爆款笔记的 AI 工具"
```

### Section 1: Visual Thesis（视觉论断）

**用 3-5 句话回答这个产品看起来应该是什么"感觉"。**
不是描述"有什么"，而是描述"为什么这么设计"。

```markdown
## 1. Visual Thesis

- **气质**：克制、专业、不喧哗。我们相信"少即是多"。
- **隐喻**：像一本设计精良的杂志，不是一个炫技的网页。
- **反对**：拒绝渐变滥用、拒绝玻璃拟态、拒绝过度动画。
- **致敬**：Linear、Stripe、Notion 的克制美学。
- **情绪关键词**：sharp、quiet、confident、generous
```

### Section 2: Color System（颜色系统）

```markdown
## 2. Color System

### 主色（Primary）

- Brand Primary: `#5E6AD2` — Linear 风格靛紫色，用于主 CTA、品牌强调
- Brand Primary Hover: `#4A55C2`
- Brand Primary Active: `#3C46B4`

### 中性色（Neutrals）— 9 阶

- gray-50: `#FAFAFA` — 最浅背景
- gray-100: `#F4F4F5` — 卡片背景
- gray-200: `#E4E4E7` — 分隔线
- gray-300: `#D4D4D8`
- gray-400: `#A1A1AA`
- gray-500: `#71717A` — 次要文字
- gray-600: `#52525B`
- gray-700: `#3F3F46`
- gray-800: `#27272A` — 主要文字
- gray-900: `#18181B` — 最深背景
- gray-950: `#09090B`

### 语义色（Semantic）

- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

### 主题模式

- 支持: 深色模式（默认）+ 浅色模式
- 背景色: 深色 `#09090B` / 浅色 `#FFFFFF`
- 主文字: 深色 `#FAFAFA` / 浅色 `#18181B`
```

### Section 3: Typography（字体系统）

```markdown
## 3. Typography

### 字体栈

- Sans: `"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`
- Mono: `"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace`

### 字重

- Regular: 400 / Medium: 500 / Semibold: 600 / Bold: 700

### 字号（type scale）

- xs: 12px / 1.5
- sm: 14px / 1.5
- base: 16px / 1.6
- lg: 18px / 1.6
- xl: 20px / 1.4
- 2xl: 24px / 1.3
- 3xl: 30px / 1.2
- 4xl: 36px / 1.15
- 5xl: 48px / 1.1
- 6xl: 60px / 1.05

### 标题层级

- H1: 4xl-5xl，bold，行高 1.1（hero 标题）
- H2: 3xl，semibold，行高 1.2（章节标题）
- H3: 2xl，semibold，行高 1.3（卡片标题）
- Body: base，regular（正文）
- Caption: sm，regular，gray-500（辅助信息）

### 中文优化

- 中文字符使用 `letter-spacing: 0.02em` 增加可读性
- 中英文混排时英文用 Inter，中文用系统默认
```

### Section 4: Spacing System（间距系统）

```markdown
## 4. Spacing System

### 基础单位

4px 为最小步进，所有间距必须是 4 的倍数（不允许 5px、7px）。

### 间距阶

0/1/2/3/4/5/6/8/10/12/16/20/24
对应 0/4/8/12/16/20/24/32/40/48/64/80/96 px

### 常用语义

- 组件内部 padding: 16-24px
- 组件之间间距: 24-32px
- 章节之间间距: 64-96px
- 页面边距（移动）: 16-20px
- 页面边距（桌面）: 32-48px
```

### Section 5: Layout & Geometry（布局与几何）

```markdown
## 5. Layout & Geometry

### 容器宽度

- 默认最大宽度: 1200px
- 阅读型内容: 720px
- 表单/对话框: 480px

### 栅格

- 桌面: 12 列，gutter 24px
- 平板: 8 列，gutter 16px
- 移动: 4 列，gutter 16px

### 断点

- mobile: < 768px
- tablet: 768-1024px
- desktop: 1024-1440px
- wide: > 1440px

### 圆角

- sm: 4px / md: 8px / lg: 12px / xl: 16px / full: 9999px

### 阴影

- sm: `0 1px 2px rgba(0,0,0,0.05)`
- md: `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)`
- lg: `0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05)`
- xl: `0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)`
```

### Section 6: Motion（动效规范）

```markdown
## 6. Motion

### 缓动函数

- standard: `cubic-bezier(0.4, 0, 0.2, 1)` — 大部分场景
- decelerate: `cubic-bezier(0, 0, 0.2, 1)` — 入场
- accelerate: `cubic-bezier(0.4, 0, 1, 1)` — 出场

### 时长

- instant: 100ms（hover、focus）
- fast: 200ms（按钮反馈、Tooltip）
- normal: 300ms（卡片悬浮、抽屉）
- slow: 500ms（页面过渡、Modal）

### 原则

- 所有 hover 状态必须有过渡，严禁瞬切
- 减少视差和大幅位移，优先用透明度和细微缩放
- `prefers-reduced-motion: reduce` 时关闭所有非必要动画
```

### Section 7: Voice & Tone（语言风格）

```markdown
## 7. Voice & Tone

### 整体气质

- 专业 + 克制，不卖萌、不口号化
- 结论先行，把核心结论放第一句
- 不用感叹号，不用 emoji 装饰（功能性 emoji 除外）

### 标题写法

- ✅ "30 秒生成爆款笔记"
- ❌ "🚀 超快超强的笔记神器！！！"

### 按钮文案

- ✅ "开始使用"、"创建项目"、"下载"
- ❌ "立即抢购！"、"点我点我"

### 错误提示

- ✅ "邮箱格式不正确"、"密码至少 8 位"
- ❌ "出错啦~"、"哎呀！"

### 中英文混排规则

- 中英文之间空格："使用 OD 生成首页"
- 数字两侧空格："3 个核心功能"
- 标点符号用全角中文标点
```

### Section 8: Components & Patterns（组件与模式）

```markdown
## 8. Components & Patterns

### 按钮（Button）

| 类型        | 用法           | 示例       |
| :---------- | :------------- | :--------- |
| Primary     | 页面唯一主操作 | "开始使用" |
| Secondary   | 次要操作       | "了解更多" |
| Ghost       | 第三级操作     | "取消"     |
| Destructive | 删除/危险操作  | "删除项目" |

### 卡片（Card）

- 默认背景: gray-100 / gray-900（暗色）
- 内边距: 24px
- 圆角: md (8px)
- 悬浮态: 增加 shadow-md + 微缩放 1.01

### 表单（Form）

- 输入框高度: 40px
- 标签上方对齐
- 错误信息在输入框下方，红色，sm 字号
- 必填项用 `*` 标记

### 导航（Navigation）

- 顶部导航高度: 56px（固定）
- 侧边栏宽度: 240px
- 当前页面用 brand-primary 标识
```

### Section 9: Anti-Patterns（反模式 / 禁止清单）

**这一节最重要——它告诉 OD「不要做什么」**，能直接干掉 70% 的 AI 滥用模式。

```markdown
## 9. Anti-Patterns

### 颜色

- ❌ 不允许使用规范外的颜色（hex 必须在 2 节定义的列表中）
- ❌ 不允许超过 3 个品牌色同时出现在一个屏幕
- ❌ 不允许在白底页面用纯黑 #000000（用 gray-800/900 代替）

### 字体

- ❌ 不允许使用规范外的字体
- ❌ 不允许同一页面超过 2 种字号差异极大的标题
- ❌ 不允许中文用 italic 斜体

### 布局

- ❌ 不允许间距不是 4 的倍数
- ❌ 不允许卡片堆叠超过 3 层
- ❌ 不允许整页都是渐变背景

### 动效

- ❌ 不允许 hover 状态没有过渡
- ❌ 不允许 1 秒以上的页面切换动画
- ❌ 不允许自动播放的视频/动画

### 文案

- ❌ 不允许使用感叹号（除错误提示外）
- ❌ 不允许营销话术（"震撼"、"颠覆"、"史上最强"）
- ❌ 不允许中英文之间不加空格

### 视觉装饰

- ❌ 不允许玻璃拟态（backdrop-filter blur）
- ❌ 不允许神经拟态（Neumorphism）
- ❌ 不允许过度光晕和发光效果
- ❌ 不允许装饰性 emoji（功能性除外）
```

## 4. DESIGN.md 放哪里

```bash
# 全局通用（所有项目都用）
~/.od/design-systems/<品牌名>/DESIGN.md

# 仅当前项目用
{你的项目目录}/.od/design-systems/<品牌名>/DESIGN.md
```

放好后在 OD 桌面应用 → Design System 页应该能看到新加的设计系统，选中即可。

或者在 Claude Code 里说：

```
用 Open Design 的 {你的品牌名} 设计系统生成首页
```

## 5. 实操建议

**最快路径**：

```
Step 1: 找一个你最欣赏的产品作为参考（推荐 Linear / Stripe / Vercel）
Step 2: 给 Claude 发一句："参考 https://linear.app 的设计，给我一个叫 XXX 的工具
        生成一份 OD 的 9 节 DESIGN.md，使用场景是 B 端 SaaS"
Step 3: Claude 30 秒出文件
Step 4: 自己微调主色和字体，其他保持默认
Step 5: 跑一遍 OD 输出，对比效果
```

**精雕细琢的路径**：

```
Step 1: 用 Web Inspector 扒参考网站的实际 CSS 变量（颜色、字号、间距）
Step 2: 手动按 9 节模板填，每个字段用真实数值
Step 3: 第 9 节（Anti-Patterns）一定要写满——这是品牌一致性的护城河
Step 4: 找 3 个不同场景（landing、dashboard、form）测试输出
Step 5: 哪里走样就回头补充 Anti-Patterns 规则
```

## 6. 关键洞察

- **第 1 节（Visual Thesis）和第 9 节（Anti-Patterns）是灵魂**——它们告诉 OD「这个品牌是什么 / 不是什么」
- **中间 7 节是骨肉**——具体的可执行参数
- **Anti-Patterns 越具体越好**——AI 喜欢"安全的平庸"，禁令越明确越能逼出品牌特色
- **复用价值高**——这套 9 节 schema 不仅给 OD 用，也可以喂给 Claude Code / Cursor 让它们写代码时自动遵守

## 7. 关联资料

- 同目录：Open-Design-开源版-Claude-Design-完整调研（OD 整体调研）
- 参考品牌资源：
  - [Linear Design](https://linear.app)
  - [Stripe Press](https://press.stripe.com)
  - [Vercel Design](https://vercel.com/design)
  - [Refactoring UI](https://www.refactoringui.com)（设计系统理论基础）
