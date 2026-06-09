---
title: "video-use-视频编辑-skill-安装记录"
published: 2026-05-29
description: "问题：Failed to connect to github.com port 447 after 75013 ms"
tags: ["Claude Code", "Skills技能"]
category: "AI工具"
image: api
draft: false
---
# video-use 视频编辑 Skill 安装记录

## 安装步骤

```bash
# 1. 克隆仓库（通过代理）
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
git clone https://github.com/browser-use/video-use.git ~/Developer/video-use

# 2. 移动项目位置（按用户偏好）
mv ~/Developer/video-use ~/claudecode/projects/video-use

# 3. 安装 Python 依赖
cd ~/claudecode/projects/video-use
uv sync

# 4. 写入 ElevenLabs API Key
printf 'ELEVENLABS_API_KEY=<your-key>\n' > .env
chmod 600 .env

# 5. 注册 skill（项目级，无需全局软链接）
# video-use 目录本身已包含 SKILL.md + helpers/，Claude Code 自动发现
```

## 踩坑记录

### 1. GitHub 直连超时

**问题**：`Failed to connect to github.com port 447 after 75013 ms`

**排查**：

- `git config --global --get http.proxy` → 无代理配置
- 测试常见端口（7890, 1080, 7891, 8080, 20170）→ 均未监听

**解决**：

- 检测发现端口 7897 开放（用户启动了代理软件）
- 配置代理：`git config --global http.proxy http://127.0.0.1:7897`

### 2. API Key 验证 401

**问题**：`curl` 返回 401，Key 看似无效

**排查**：

- 第一个 Key 确实过期/复制不完整
- 换了新 Key 后返回 401，但详细响应显示：
  ```json
  {
    "detail": {
      "status": "missing_permissions",
      "message": "missing permission user_read"
    }
  }
  ```

**原因**：

- ElevenLabs API Key 的 **Speech to Text** 端点设成了 "No Access"
- `/v1/user` 端点需要 `user_read` 权限，但 video-use 实际只需要 Scribe 转录

**解决**：

- 在 ElevenLabs 后台将 **Speech to Text** 端点改为 "Access"
- 直接测试 Scribe API 返回 200 → 功能正常
- `user_read` 权限缺失不影响 video-use 核心功能

### 3. 安装位置调整

**原始路径**：`~/Developer/video-use`（install.md 推荐）

**调整后**：`~/claudecode/projects/video-use`（统一工作区管理）

**原因**：用户要求所有项目集中在 `~/claudecode/` 下

## 最终配置

| 项目            | 配置                                   |
| --------------- | -------------------------------------- |
| **安装位置**    | `~/claudecode/projects/video-use`      |
| **软链接**      | 无需（项目级 skill 目录自带 SKILL.md） |
| **Python 依赖** | uv sync（39 packages）                 |
| **ffmpeg**      | v8.1.1 已安装                          |
| **API Key**     | 存储在 `.env`，权限 600                |
| **Scribe API**  | 测试通过（POST 200）                   |

## 使用方式

```bash
# 1. 准备视频素材到任意文件夹
mkdir ~/videos/my-project && cd ~/videos/my-project

# 2. 启动 Claude Code（确保 video-use skill 可发现）
claude

# 3. 对话式编辑
> 用 video-use skill 编辑这些视频
> 剪掉废话和停顿，加字幕和暖色电影风调色
```

**输出目录**：`<videos_dir>/edit/`（不会污染 video-use 项目目录）
