---
title: "video-edit-pipeline-skill开发"
published: 2026-06-02
description: "2026-06-02 完成\"妙妙吃西瓜\"短视频项目，经历了 4 轮 build.py 迭代，跑通了完整链路：逐段提取 → 音频 fade → 无损 concat → ASS 字幕 → 贴纸 → 音效 → 验证输出。整个过程可复用，封装..."
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# video-edit-pipeline Skill 开发记录

## 背景

2026-06-02 完成"妙妙吃西瓜"短视频项目，经历了 4 轮 `build.py` 迭代，跑通了完整链路：逐段提取 → 音频 fade → 无损 concat → ASS 字幕 → 贴纸 → 音效 → 验证输出。整个过程可复用，封装为 skill。

## 技能结构

```
.claude/skills/video-edit-pipeline/
├── SKILL.md                          # 120行，核心工作流+铁律+反模式
└── references/
    └── ffmpeg-recipes.md             # 200行，11个技术配方
```

**SKILL.md 核心内容：**

- 3 条铁律（ASS BGR 格式、字幕最后叠加、逐段提取→concat）
- 5 步工作流（盘点素材 → 收集文案 → 生成 build.py → 执行迭代 → 收尾）
- 核心参数速查表（分辨率/编码/字体/字号）
- 6 条反模式

**ffmpeg-recipes.md 配方清单：**

| #   | 配方              | 说明                       |
| --- | ----------------- | -------------------------- |
| 1   | Ken Burns zoompan | 缓推效果，分慢/中/快速三档 |
| 2   | slow motion       | setpts + atempo 对应       |
| 3   | vignette          | 暗角效果                   |
| 4   | eq 微调           | 亮度+饱和度                |
| 5   | 音频 fade         | 30ms in/out 消除爆音       |
| 6   | 无损 concat       | concat demuxer + 绝对路径  |
| 7   | ASS 字幕          | 完整模板+字段说明          |
| 8   | 黄色高亮          | `&H0000FFFF&` BGR 格式     |
| 9   | lavfi 音效        | 正弦波生成 + adelay 混音   |
| 10  | emoji 贴纸        | filter_complex overlay     |
| 11  | PIL 贴纸          | NotoEmoji 彩色字体         |

## 关键决策

### 1. 项目级 vs 全局级

Skill 放在 `video/.claude/skills/` 下，只在 `video/` 目录及其子目录内生效。这样不同项目的 video skill 可以独立演进。

### 2. 与 video-use 的关系

两者互补，不互斥：

|      | video-use           | video-edit-pipeline    |
| ---- | ------------------- | ---------------------- |
| 品类 | 口播、访谈、教程    | 亲子、生活、旅行蒙太奇 |
| 驱动 | 音频（Scribe 转录） | 视觉（手动选段）       |
| 时长 | 1-5 分钟+           | 10-60 秒               |
| 字幕 | ASR 自动生成        | 手动输入文案           |

video-use 也已从全局移到项目级 `.claude/skills/video-use` → `projects/video-use`。

### 3. 铁律优先级

SKILL.md 中把"ASS 颜色格式是 BGR 字节序"放在第一条铁律——这是最容易被坑的地方，`&H0000FFFF&` 写成 `&H00FFFF00&` 会出蓝色字。

## 测试验证

用"妙妙吃西瓜"原素材一次跑通：

- 5 段逐段提取，全部成功
- 音频 30ms fade，5 段全部成功
- concat 拼接 → ASS 字幕叠加 → final.mp4
- 输出：720×1280 h264+aac，15.0s，6.5MB

## 踩坑记录（来自妙妙吃西瓜原始迭代）

- **ASS `\f` 被 Python 转义**：不要在 shell `-c` 内联写 ASS，用独立 Python 脚本生成
- **concat 路径问题**：concat 列表文件必须用绝对路径，否则 ffmpeg 从 CWD 解析会失败
- **白字变棕**：浅色视频背景上，Snell Roundhand 笔画太细导致抗锯齿发棕 → 改用 Bradley Hand Bold
- **ASS 颜色 BGR**：黄色是 `&H0000FFFF&`，不是 `&H00FFFF00&`
