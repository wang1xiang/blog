---
title: "MiniCPM5-1B-本地部署实录"
published: 2026-05-27
description: "2026-05-26 面壁智能发布 MiniCPM5-1B，1B 参数在 AA-Index 超越所有 2B 以下模型，INT4 量化仅 0.5GB，目标端侧部署。想在本机 Mac（Apple Silicon）搭建完全离线的 AI 聊天环境。"
tags: ["项目调研", "07-项目调研"]
category: "其他"
image: api
draft: false
---

# MiniCPM5-1B 本地部署实录

## 背景

2026-05-26 面壁智能发布 MiniCPM5-1B，1B 参数在 AA-Index 超越所有 2B 以下模型，INT4 量化仅 0.5GB，目标端侧部署。想在本机 Mac（Apple Silicon）搭建完全离线的 AI 聊天环境。

## 模型概况

| 维度     | 详情                                                  |
| -------- | ----------------------------------------------------- |
| 参数规模 | 1B dense Transformer                                  |
| 权重体积 | INT4 量化后 0.5GB                                     |
| License  | Apache-2.0                                            |
| 架构     | 标准 LlamaForCausalLM，无需自定义 kernel              |
| 推理模式 | 同一 checkpoint 支持 `<think>` 推理与快速应答         |
| 部署后端 | vLLM、SGLang、Transformers、llama.cpp、Ollama、MLX 等 |

## 部署路径

### Step 1: 安装 mlx-lm（Apple Silicon 原生加速）

Homebrew Python 3.14 有 PEP 668 限制，不能直接 pip install。创建 venv 隔离：

```bash
python3 -m venv ~/.venvs/minicpm
source ~/.venvs/minicpm/bin/activate
pip install mlx-lm
```

### Step 2: 启动本地模型服务器

```bash
python -m mlx_lm server --model openbmb/MiniCPM5-1B
```

- 首次启动自动从 HuggingFace 下载 0.5GB 权重
- 默认监听 `127.0.0.1:8080`
- 提供 OpenAI-compatible API（`/v1/chat/completions`）

### Step 3: 安装 Docker Desktop

```bash
brew install --cask docker
```

### Step 4: 启动 OpenWebUI

```bash
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  -e OPENAI_API_BASE_URL=http://host.docker.internal:8080/v1 \
  -e OPENAI_API_KEY=sk-fake \
  ghcr.io/open-webui/open-webui:main
```

浏览器访问 `http://localhost:3000` 即可聊天。

## 踩坑记录

### 1. 端口 8080 被占用

`mlx_lm server` 启动时报 `socketserver` 绑定错误。

**原因**：之前已启动了一个 mlx_lm server 进程未关闭。

**解决**：

```bash
kill $(cat /tmp/minicpm-server.pid)
python -m mlx_lm server --model openbmb/MiniCPM5-1B
```

### 2. pip 系统包限制（PEP 668）

Homebrew 管理的 Python 3.14 禁止直接 pip install，报错：

> "To install Python packages system-wide, try brew install... use a virtual environment"

**解决**：`python3 -m venv ~/.venvs/minicpm`，在 venv 内安装。

### 3. Docker Desktop brew 安装冲突

之前装过 Docker，残留 `/usr/local/bin/hub-tool` 软链，导致 brew 回滚。

**解决**：直接去 docker.com 下载 Apple Silicon 安装包手动安装。

### 4. curl 返回 JSON 转义中文和 reasoning 字段

API 返回 `你好` 这种 Unicode 转义，且包含 `reasoning` 思考链字段。

**解决**：用 `python3 -c "import json,sys; d=json.load(sys.stdin); print(d['choices'][0]['message']['content'])"` 解析。

## 最终状态

- ✅ 本地服务器：`http://localhost:8080/v1/chat/completions`
- ✅ OpenWebUI：`http://localhost:3000`
- ✅ 完全离线可用，数据不出本机
- ✅ 支持多轮对话、思考链展开、新会话管理

> OpenWebUI 运行界面截图（原图已丢失）

## 关闭与重启

**关闭**：

```bash
docker stop open-webui
kill $(cat /tmp/minicpm-server.pid)
```

**重启**：

```bash
# 1. Docker Desktop 先打开
# 2. 启动模型服务器
source ~/.venvs/minicpm/bin/activate
python -m mlx_lm server --model openbmb/MiniCPM5-1B

# 3. 启动 OpenWebUI
docker start open-webui
```

## 模型实际表现

| 维度         | 表现                                  |
| ------------ | ------------------------------------- |
| 理解中文指令 | 能听懂，知道 Vue3/useFetch 等概念     |
| 推理过程     | 有 `<think>` 模式思考链               |
| 代码质量     | 能写，但别指望一次写对（1B 参数限制） |
| 响应速度     | Apple Silicon 本地推理，约 3-5 秒     |

**定位**：Claude Code 断网时的应急备胎、隐私代码的本地审阅员、简单函数的离线生成器。不是 Claude 的替代品。

## OpenWebUI 进阶配置

### Web Search（联网搜索）

OpenWebUI 自带网页搜索，不需要模型支持工具调用。在提问前点击输入框旁的 🔍 图标即可触发。

**配置**：设置 → Admin Settings → Web Search → 引擎选 `DDGS`（DuckDuckGo，免费无需 API Key）→ 开启 Enable Web Search → 保存 → 重启容器生效。

**注意**：完全断网时搜索会失败，只有纯文本对话可用。

### 系统提示词

在设置 → 通用 → 系统提示词中填写角色设定，可控制模型回答风格。建议：

```
你是翔子的技术助手。翔子是前端开发工程师（兼后端 NodeJS），工作哲学是"重复 3 遍的事就自动化"。

回答规则：
1. 默认中文，代码用英文
2. 结论先行，再给理由，不铺垫背景
3. 技术决策要讲"为什么"和"对用户的影响"
4. 不要谄媚，不要夸想法好，方案有问题直接指出来
5. 遇到模糊需求，先给最合理的方案再问要不要调整
6. 写代码给完整可运行示例，不要只给片段
```

### 工具服务器（Tool Servers）

OpenWebUI 支持连接外部 OpenAPI 工具服务器，让模型自动调用外部功能。

**原生 OpenAPI 工具**（来自 openapi-servers 仓库）：

| 工具       | 端口 | 用途              | 是否需要联网                 |
| ---------- | ---- | ----------------- | ---------------------------- |
| Weather    | 8001 | 查询实时天气      | ✅ 需要（调 Open-Meteo API） |
| Time       | 8002 | 获取当前时间      | ❌ 不需要                    |
| Filesystem | 8003 | 读写本地文件      | ❌ 不需要                    |
| Git        | 8004 | 查 git 历史、diff | ❌ 不需要                    |
| Memory     | 8005 | 跨对话持久记忆    | ❌ 不需要                    |

**启动方式**（以 weather 为例）：

```bash
cd openapi-servers/servers/weather
source ~/.venvs/minicpm/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001
```

**踩坑**：

- **端口冲突**：如果启动时报 socketserver 绑定错误，先 `kill` 掉旧进程
- **Docker 容器访问宿主机**：Mac 上 `host.docker.internal` 偶尔失灵，改用本机局域网 IP（如 `172.16.1.205`）
- **Filesystem 权限**：默认只允许 `~/tmp`，需修改 `config.py` 中的 `ALLOWED_DIRECTORIES` 扩大范围

### MCP 工具桥接（mcpo）

通过 [mcpo](https://github.com/open-webui/mcpo) 把 MCP 服务器转成 OpenAPI，OpenWebUI 就能用了。

**已配置**：

| 工具                           | 端口 | 用途         | 启动命令                                                                          |
| ------------------------------ | ---- | ------------ | --------------------------------------------------------------------------------- |
| mcp-server-fetch               | 8007 | 精确抓取网页 | `uvx mcpo --port 8007 -- uvx mcp-server-fetch`                                    |
| mcp-server-sequential-thinking | 8009 | 分步骤思维链 | `uvx mcpo --port 8009 -- npx -y @modelcontextprotocol/server-sequential-thinking` |

**待配置**（需要 GitHub Token）：

| 工具              | 端口 | 用途                    | 启动命令                                                             |
| ----------------- | ---- | ----------------------- | -------------------------------------------------------------------- |
| mcp-server-github | 8008 | 查 GitHub 仓库/issue/PR | `GITHUB_TOKEN=ghp_xxx uvx mcpo --port 8008 -- uvx mcp-server-github` |

**mcp-server-sequential-thinking 踩坑**：直接用 `uvx mcp-server-sequential-thinking` 启动失败（Connection closed），改用 `npx -y @modelcontextprotocol/server-sequential-thinking` 成功。

### 完整端口分配表

| 服务                           | 端口 | 说明                |
| ------------------------------ | ---- | ------------------- |
| MiniCPM5-1B 模型               | 8080 | mlx-lm 本地推理     |
| OpenWebUI                      | 3000 | Docker 容器         |
| Weather                        | 8001 | 天气查询            |
| Time                           | 8002 | 时间获取            |
| Filesystem                     | 8003 | 文件操作            |
| Git                            | 8004 | Git 历史            |
| Memory                         | 8005 | 持久记忆            |
| mcp-server-fetch               | 8007 | 网页抓取            |
| mcp-server-github              | 8008 | GitHub 查询（待配） |
| mcp-server-sequential-thinking | 8009 | 思维链辅助          |

### 各工具实际能力

- **Weather**：问"北京今天天气" → 模型自动调 API → 返回实时温度/湿度
- **Time**：问"现在几点" → 模型不再说不知道
- **Filesystem**："帮我把这段代码写到 ~/test.js" → 模型直接写文件
- **Git**："这个项目最近改了什么" → 模型查 git log 给你总结
- **Memory**："我喜欢 2 空格缩进" → 下次对话还记得
- **Fetch**："fetch https://example.com 的内容给我" → 精准抓取指定页面
- **Sequential Thinking**：复杂问题自动分步骤思考，1B 参数模型推理质量提升明显

### 使用策略

- **完全断网**：只用 MiniCPM 本身（写代码、逻辑推理）
- **有网但不想用 Claude API**：开 weather/fetch/time 等工具，本地模型 + 工具 = 够用的助手
- **复杂任务**：切到 Claude/Gemini（如果在 OpenWebUI 里配了多模型）

## 一键启停脚本

工具服务器有 9 个，每次手动启动太繁琐。写了两个脚本放在 `~/.local/bin/`：

### start-minicpm.sh

启动所有服务（模型服务器 + 5 个原生工具 + 2 个 MCP 桥接 + OpenWebUI Docker）：

```bash
start-minicpm.sh
```

脚本会自动检测端口是否已被占用，跳过已运行的服务。启动顺序：

1. MiniCPM 模型服务器（8080）
2. Weather/Time/Filesystem/Git/Memory（8001-8005）
3. Fetch/Sequential Thinking（8007/8009）
4. OpenWebUI Docker（3000）

### stop-minicpm.sh

停止所有服务：

```bash
stop-minicpm.sh
```

### 自动启动（可选）

加到 `~/.zshrc` 末尾，每次开终端自动检测并启动：

```bash
if ! lsof -ti :8080 >/dev/null 2>&1; then
  start-minicpm.sh >/dev/null 2>&1 &
fi
```

或者配 macOS LaunchAgent 实现真正的开机自启。
