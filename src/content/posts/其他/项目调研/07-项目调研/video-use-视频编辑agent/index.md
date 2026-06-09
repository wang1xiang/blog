---
title: "video-use-视频编辑agent"
published: 2026-06-01
description: "GitHub: browser-use/video-use | ⭐ 8.7k | MIT License"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: true
---
# video-use 项目调研

**GitHub**: [browser-use/video-use](https://github.com/browser-use/video-use) | ⭐ 8.7k | MIT License

一句话：**让 Claude Code（或其他 AI agent）通过对话来编辑视频**——丢入原始素材，用自然语言描述需求，自动完成剪辑、调色、字幕、动画叠加，输出最终视频。

## 核心原理

LLM **不直接看视频画面**，而是通过两层信息理解视频：

1. **音频转写（必须）**：用 ElevenLabs Scribe 做 ASR，生成词级时间戳 + 说话人分离 + 音频事件（笑声、掌声等），打包成 ~12KB 的 `takes_packed.md`——这是 LLM 的主要阅读视图
2. **视觉合成（按需）**：在关键决策点生成胶片条+波形图+文字标签的 PNG，用于辅助判断

**优势**：相比逐帧读取（30000帧 × 1500 tokens = 45M tokens），video-use 只需 12KB 文本 + 少量 PNG，token 消耗降低几个数量级。

## 安装状态

所有项目代码在 `~/claudecode/projects/video-use/`：

| 检查项              | 状态                                       |
| ------------------- | ------------------------------------------ |
| Python 依赖 (.venv) | ✅ 已安装（Python 3.13.6）                 |
| ffmpeg / ffprobe    | ✅ 8.1.1                                   |
| ElevenLabs API key  | ✅ 有效（Scribe 转写可用）                 |
| helpers 脚本        | ✅ transcribe.py / timeline_view.py 均正常 |

### Skill 注册

```
~/.claude/skills/video-use  →  ~/claudecode/.claude/skills/video-use  →  projects/video-use
```

最初注册到全局 `~/.claude/skills/`，后改为项目级注册到 `claudecode/.claude/skills/`，与 aihot、baoyu-wechat-summary 等 skill 放在同一位置。

### API key 验证

当前 `.env` 中的 key 能正常连接 Scribe API，但缺少 `user_read` 权限——调用 `/v1/user` 返回 401（实际是权限拒绝而非认证失败），调用转写接口返回 400（缺少参数），证明 key 本身有效。

## 正确使用方法

**关键：必须在存放原始视频素材的目录启动 Claude Code，而不是在项目目录。**

```bash
# ❌ 错误：在 video-use 项目目录启动（会被当成 Python 项目）
cd ~/claudecode/projects/video-use
claude   # agent 会困惑：这是代码目录还是素材目录？

# ✅ 正确：在素材目录启动
mkdir -p ~/Videos/骑行日常
cd ~/Videos/骑行日常
cp ~/Downloads/*.mp4 .     # 放入原始素材
claude                     # 自动加载 video-use skill
# 在会话中说："把这些剪成一个发布视频"
```

所有输出保存在 `<素材目录>/edit/` 下，原始素材不受影响。

## 工作流程

```
转写 → 打包 → LLM 推理 → EDL 决策 → 渲染 → 自检
```

1. **Inventory 盘点**：`ffprobe` 检查每个素材，批量转写，生成 `takes_packed.md`
2. **预扫描问题**：标记口误、错话等
3. **对话确认策略**：了解视频类型、目标时长、风格方向，**等用户点头**
4. **执行**：生成 EDL、并行子 agent 做动画、逐段调色、渲染
5. **自检**：在每个剪切点检查视觉跳变、音频爆音、字幕遮挡
6. **迭代**：根据反馈调整，最多 3 轮

## 支持的功能

- ✂️ 自动剪除填充词（嗯、啊、口误）和空白段
- 🎨 自动调色（warm_cinematic / neutral_punch / 自定义）
- 📝 字幕生成（2 词大写块，可自定义样式）
- 🎬 动画叠加（HyperFrames / Remotion / Manim / PIL）
- 渲染后自检（每段切点验证）
- 📝 会话记忆（`project.md` 记录决策，下次继续）

## 踩坑记录

### API key 误判 401

`/v1/user` 端点返回 401，但实际响应体是 `{"status":"missing_permissions"}`——key 是有效的，只是缺少读取用户信息的权限。转写功能不需要 `user_read` 权限，直接用即可。**验证方法**：调用转写 API 返回 400（缺少参数）而非 401，说明认证通过。
