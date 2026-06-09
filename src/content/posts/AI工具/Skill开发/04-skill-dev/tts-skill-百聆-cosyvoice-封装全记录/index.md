---
title: "TTS-Skill-百聆-CosyVoice-封装全记录"
published: 2026-05-20
description: "想把 Markdown 文章转成语音，需求是："
tags: ["Skill开发", "04-skill-dev"]
category: "AI工具"
image: api
draft: false
---
# TTS Skill 百聆 CosyVoice 封装全记录

## 背景

想把 Markdown 文章转成语音，需求是：

- 文章先经过 Claude 理解，生成口语化中文讲解稿
- 讲解稿通过 TTS 转成 MP3 音频
- 音色要自然，像中国人说话，不要外国人说中文的感觉
- 封装成 Claude Code skill，一条命令搞定全流程

## 演进过程

### 阶段一：macOS say 命令（废弃）

最初用 macOS 自带的 `say` 命令，免费但声音机械，体验不好。

### 阶段二：ElevenLabs（废弃）

接入 ElevenLabs API，音质不错但中文发音像外国人说中文，且 API Key 配额紧张。

### 阶段三：[阿里百聆](https://bailian.console.aliyun.com/cn-beijing?tab=model#/efm/model_experience_center/voice?currentTab=voiceTts) Sambert（失败）

迁移到阿里云百聆，使用旧版 `sambert-zhichu-v1` 模型，API 直接返回 403 `AccessDenied`，账号没有权限。

### 阶段四：CosyVoice 适配（成功）

切换到百聆的 CosyVoice 系列模型，经历大量调试后成功接入。

## 技术实现

### 核心文件

- `~/.claude/skills/tts/SKILL.md` — Skill 定义文件，描述工作流程
- `~/.claude/skills/tts/tts.py` — TTS 脚本，负责语音生成
- `~/.zshrc` — 环境变量配置（`DASHSCOPE_API_KEY`）

### tts.py 架构

```
read_markdown() → 去除 YAML frontmatter
       ↓
生成口语化讲解稿（由 Claude Code 会话完成）
       ↓
save to /tmp/tts-explanation-*.txt
       ↓
speak_text() → engine 选择
       ↓
_speak_bailian() → HttpSpeechSynthesizer 调用百聆 API
       ↓
下载音频 URL → 保存 MP3 或 afplay 播放
       ↓
清理临时文件
```

### 多模型降级策略

```python
BAILIAN_MODELS = [
    "cosyvoice-v3.5-flash",    # 最新，音质最好
    "cosyvoice-v3.5-plus",
    "cosyvoice-v3-flash",
    "cosyvoice-v3-plus",
    "cosyvoice-v2",
    "cosyvoice-v1",
    "qwen3-tts-instruct-flash",
    "qwen3-tts-flash",
    "qwen-tts",
]
```

按顺序尝试，前一个失败自动切下一个。全部失败后 macOS `say` 兜底。

### 音色配置

默认音色 `longanhuan`（龙安欢 - 双脱元气女），是测试后发现唯一可用的音色。

## 踩坑记录

### 坑 1：Sambert 模型无权限

旧版 `sambert-zhichu-v1` 模型返回 403 `AccessDenied`，账号未开通该模型权限。

**解决**：切换到 CosyVoice 系列，控制台可见可用模型列表。

### 坑 2：CosyVoice 所有 voice 名称都返回 418 错误

试了 `longxiaochun`、`longwan`、`longcheng` 等十几个音色，全部返回 `Engine return error code: 418`。

**解决**：发现 `longanhuan`（龙安欢）是唯一可用的音色。

### 坑 3：WebSocket API 不稳定

`tts_v2.SpeechSynthesizer` 使用 WebSocket 协议，一直报错 `Invalid payload data`。

**解决**：改用 `http_tts.HttpSpeechSynthesizer`，基于 HTTP REST API，稳定可靠。

### 坑 4：API 端点混乱

百聆有多个 API 端点，CosyVoice 不走旧的 `/services/audio/tts/generation`，也不走 OpenAI 兼容的 `/compatible-mode/v1/audio/speech`。

**解决**：`HttpSpeechSynthesizer` 内部使用 `/services/audio/tts/SpeechSynthesizer` 端点。

### 坑 5：非流式模式返回 URL 而非音频数据

HttpSpeechSynthesizer 非流式调用返回的是 OSS 音频 URL，需要额外下载。

**解决**：代码中增加从 `result.audio_url` 下载音频的逻辑。

### 坑 6：环境变量在子进程中丢失

在 zshrc 中设置了 `DASHSCOPE_API_KEY`，但 Bash 子进程没有继承。

**解决**：当前通过显式传参解决，实际使用中 skill 在主会话运行不受影响。

## 关键决策

1. **用 SDK 而非裸 HTTP**：DashScope SDK 的 `HttpSpeechSynthesizer` 封装了请求构建和响应解析，比自己拼 JSON 可靠。
2. **多模型降级而非单一模型**：百聆有 9 个免费 TTS 模型，独立额度，自动降级保证服务不中断。
3. **HTTP 而非 WebSocket**：WebSocket API 不稳定且调试困难，HTTP 非流式模式更可靠。
4. **讲解稿由 Claude 生成**：不依赖脚本自动生成，由会话中 Claude 理解文章后生成口语化讲解，质量更高。

## 最终方案

```bash
/tts article.md                           # 直接生成并播放
/tts --preview article.md                  # 先预览讲解稿
/tts --output audio/out.mp3 article.md    # 保存为 MP3 文件
/tts --voice longwan article.md           # 指定音色
```

全流程：读取 Markdown → Claude 生成口语讲解 → 保存临时文件 → 调用百聆 CosyVoice → 下载/播放 MP3 → 清理临时文件。

## 依赖

- Python 3.13
- `dashscope` SDK（`pip3 install dashscope`）
- 环境变量 `DASHSCOPE_API_KEY`
- macOS `afplay` 命令（播放音频）
- `ffmpeg`（say 引擎转 MP3 时需要）
