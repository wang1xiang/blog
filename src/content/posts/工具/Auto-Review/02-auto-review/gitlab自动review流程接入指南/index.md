---
title: "GitLab自动Review流程接入指南"
published: 2026-05-20
description: "一、整体架构 - 二、前置准备 - 三、步骤 1：注册 Self-hosted GitLab Runner - 四、步骤 2：配置 Webhook 监听 MR 评论 - 五、步骤 3：搭建 Webhook 服务 - 六、步骤 4：接入..."
tags: ["Auto-Review", "02-auto-review"]
category: "工具"
image: api
draft: false
---
# GitLab 自动 Review 流程接入指南

> 目标：在 GitLab 上实现「AI Review → 自动修复 → 循环」的完整流程。
> 核心思路：GitLab Webhook 监听 MR 评论 → 触发 Gemini API 做 Review → 本地 Runner 调用 Codex 自动修复 → 提交新 commit。

---

## 目录

- [一、整体架构](#一整体架构)
- [二、前置准备](#二前置准备)
- [三、步骤 1：注册 Self-hosted GitLab Runner](#三步骤-1注册-self-hosted-gitlab-runner)
- [四、步骤 2：配置 Webhook 监听 MR 评论](#四步骤-2配置-webhook-监听-mr-评论)
- [五、步骤 3：搭建 Webhook 服务](#五步骤-3搭建-webhook-服务)
- [六、步骤 4：接入 Gemini API 做 Review](#六步骤-4接入-gemini-api-做-review)
- [七、步骤 5：通过 GitLab API 读写 MR 评论](#七步骤-5通过-gitlab-api-读写-mr-评论)
- [八、步骤 6：Codex 自动修复流程](#八步骤-6codex-自动修复流程)
- [九、步骤 7：循环控制与终止](#九步骤-7循环控制与终止)
- [十、完整项目结构](#十完整项目结构)
- [十一、常见问题](#十一常见问题)

---

## 一、整体架构

```
┌──────────────────┐     提交 MR      ┌──────────────────┐
│  本地开发环境     │ ──────────────> │  GitLab MR       │
│  Codex + SP      │                 │                  │
└──────────────────┘                 └────────┬─────────┘
                                              │
                                    MR 评论(Webhook)
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │  Webhook Server     │
                                   │  (Node.js / Python) │
                                   │  监听 note 事件     │
                                   └────────┬───────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                              ▼             ▼              ▼
                       ┌──────────┐  ┌───────────┐  ┌──────────┐
                       │获取MR Diff│─>│Gemini API │─>│写MR评论   │
                       │GitLab API│  │Review     │  │GitLab API│
                       └──────────┘  └───────────┘  └──────────┘
                                            │
                                     触发修复信号
                                            │
                                            ▼
                                   ┌────────────────────┐
                                   │  GitLab Runner      │
                                   │  shell executor     │
                                   │  调用 Codex 修复     │
                                   │  提交 commit 到 MR   │
                                   └────────────────────┘
```

---

## 二、前置准备

| 项目 | 说明 |
|------|------|
| **GitLab 项目** | 需要 Owner 或 Maintainer 权限 |
| **GitLab Runner** | 本地或服务器，用于执行修复任务 |
| **GitLab Personal Access Token** | 需要 `api` 权限，用于 API 调用 |
| **Gemini API Key** | 从 https://aistudio.google.com 获取 |
| **Codex CLI** | 已安装并配置好 |
| **Node.js 20+ 或 Python 3.11+** | 用于运行 Webhook 服务 |
| **ngrok / Cloudflare Tunnel** | 本地开发时暴露 webhook 端点给 GitLab |

---

## 三、步骤 1：注册 Self-hosted GitLab Runner

### 3.1 安装 GitLab Runner

**macOS**：
```bash
# 下载二进制文件
sudo curl --output /usr/local/bin/gitlab-runner \
  "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-arm64"
sudo chmod +x /usr/local/bin/gitlab-runner

# 注册为用户模式服务
gitlab-runner install
gitlab-runner start
```

**Linux (Ubuntu/Debian)**：
```bash
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt install gitlab-runner
```

### 3.2 获取 Runner 认证 Token

1. 打开 GitLab 项目页面
2. 进入 **Settings → CI/CD → Runners**
3. 点击 **New project runner**
4. 选择 Runner 类型（推荐 `Custom`）
5. 复制生成的 Token（格式：`glrt-xxxxxxxxxxxx`）

> **注意**：GitLab 15.10+ 使用 Runner Authentication Token（`glrt-` 前缀），旧的 Registration Token（`gr1348...` 前缀）已弃用。

### 3.3 注册 Runner

**交互式注册（推荐初次使用）**：
```bash
gitlab-runner register
```

按提示输入：
```
GitLab instance URL: https://gitlab.com
Runner authentication token: glrt-xxxxxxxxxxxx
Description: auto-review-runner
Tags: auto-review,codex
Executor: shell
```

**非交互式注册（自动化部署）**：
```bash
gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com" \
  --token "$RUNNER_TOKEN" \
  --executor "shell" \
  --description "auto-review-runner" \
  --tag-list "auto-review,codex"
```

### 3.4 验证 Runner

```bash
gitlab-runner list
gitlab-runner verify
```

注册信息保存在 `~/.gitlab-runner/config.toml`（macOS）或 `/etc/gitlab-runner/config.toml`（Linux）。

---

## 四、步骤 2：配置 Webhook 监听 MR 评论

### 4.1 创建 Webhook

1. 打开 GitLab 项目页面
2. 进入 **Settings → Webhooks**
3. 填写以下信息：

| 字段 | 值 |
|------|-----|
| **URL** | `https://your-domain.com/webhook`（或 ngrok 地址） |
| **Secret token** | 自定义密钥，用于验证请求来源 |
| **Trigger** | 勾选 **Comments** |

4. 点击 **Add webhook**

### 4.2 测试 Webhook

在 Webhook 页面底部点击 **Test → Note events**，确认能收到 200 响应。

### 4.3 Webhook 事件说明

当有人在 MR 下发表评论时，GitLab 会发送 `POST` 请求，事件类型为 `note`，HTTP Header 包含 `X-Gitlab-Event: Note Hook`。

**关键 payload 字段**：
```json
{
  "object_kind": "note",
  "event_type": "note",
  "object_attributes": {
    "note": "This MR needs work.",
    "noteable_type": "MergeRequest",
    "action": "create"
  },
  "merge_request": {
    "id": 7,
    "iid": 1,
    "title": "feature: add user auth",
    "source_branch": "feature/auth",
    "target_branch": "main",
    "state": "opened",
    "url": "https://gitlab.com/.../merge_requests/1"
  },
  "project": {
    "id": 5,
    "path_with_namespace": "group/project",
    "web_url": "https://gitlab.com/group/project"
  }
}
```

关键字段：
- `object_attributes.noteable_type`：值为 `"MergeRequest"` 表示是 MR 评论
- `object_attributes.note`：评论内容
- `object_attributes.action`：`"create"` 表示新评论
- `merge_request.iid`：MR 的 IID
- `project.path_with_namespace`：项目路径

---

## 五、步骤 3：搭建 Webhook 服务

Webhook 服务是整个流程的中枢，负责接收事件、触发 Review、调用修复。

### 5.1 Node.js 实现

```javascript
// webhook-server.js
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.GITLAB_SECRET_TOKEN;
const GITLAB_TOKEN = process.env.GITLAB_PRIVATE_TOKEN;
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';

app.use(express.json());

// 验证 webhook 签名
function verifyWebhook(req, res, next) {
  if (req.headers['x-gitlab-token'] !== SECRET_TOKEN) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

app.post('/webhook', verifyWebhook, async (req, res) => {
  const { object_kind, event_type, object_attributes, merge_request, project } = req.body;

  // 只处理 MR 的新评论
  if (event_type !== 'note' || object_attributes?.noteable_type !== 'MergeRequest') {
    return res.status(200).send('Ignored');
  }

  const mrIID = merge_request.iid;
  const projectID = project.id;
  const projectPath = project.path_with_namespace;
  const comment = object_attributes.note;

  console.log(`收到 MR #${mrIID} 的评论: ${comment}`);

  // 只处理 Gemini 的 Review 评论（以 [AI Review] 开头）
  // 或者处理特定的触发词（如 /review、/fix）
  if (comment.startsWith('[AI Review]') || comment.startsWith('/')) {
    await triggerFix(projectID, mrIID, projectPath, comment);
  }

  res.status(200).send('OK');
});

async function triggerFix(projectID, mrIID, projectPath, comment) {
  console.log(`触发修复: MR #${mrIID}, 项目: ${projectPath}`);

  // 通过 GitLab API 触发 pipeline
  const pipelineUrl = `${GITLAB_URL}/api/v4/projects/${projectID}/trigger/pipeline`;

  exec(`curl -X POST "${pipelineUrl}" \
    -F "token=<REDACTED>" \
    -F "ref=main" \
    -F "variables[MR_IID]=${mrIID}" \
    -F "variables[ACTION]=fix"`, (error) => {
    if (error) {
      console.error('触发 pipeline 失败:', error);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Webhook 服务运行在 http://localhost:${PORT}`);
});
```

### 5.2 本地开发用 ngrok 暴露

```bash
npm install express
node webhook-server.js &
ngrok http 3000
```

把 ngrok 生成的 URL（如 `https://xxx.ngrok-free.app/webhook`）填入 GitLab Webhook 配置。

---

## 六、步骤 4：接入 Gemini API 做 Review

### 6.1 获取 API Key

1. 访问 https://aistudio.google.com/apikey
2. 创建 API Key
3. 设置环境变量：`export GEMINI_API_KEY="your-key"`

### 6.2 Review 脚本

**Python 实现**（推荐，Google 官方 SDK 支持更好）：

```python
# review.py
import os
import json
import subprocess
import requests
from google import genai

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GITLAB_URL = os.environ.get("GITLAB_URL", "https://gitlab.com")
GITLAB_TOKEN = os.environ["GITLAB_PRIVATE_TOKEN"]
PROJECT_ID = os.environ["PROJECT_ID"]
MR_IID = os.environ["MR_IID"]

client = genai.Client(api_key=<REDACTED>

def get_mr_diff():
    """通过 GitLab API 获取 MR 的 diff"""
    url = f"{GITLAB_URL}/api/v4/projects/{PROJECT_ID}/merge_requests/{MR_IID}/changes"
    headers = {"PRIVATE-TOKEN": GITLAB_TOKEN}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()

    # 组装 diff 文本
    diff_lines = []
    for change in data.get("changes", []):
        diff_lines.append(f"--- a/{change['old_path']}")
        diff_lines.append(f"+++ b/{change['new_path']}")
        diff_lines.append(change["diff"])

    return "\n".join(diff_lines), data.get("title", "")

def review_with_gemini(diff_text, mr_title):
    """调用 Gemini API 做代码审查"""
    prompt = f"""你是一个资深代码审查专家。请审查以下 Merge Request 的代码变更。

MR 标题: {mr_title}

Diff 内容:
{diff_text}

请按以下 JSON 格式返回审查结果:
{{
  "summary": "总体评价（一句话）",
  "issues": [
    {{
      "severity": "critical|major|minor|suggestion",
      "file": "文件名（如果有具体文件）",
      "line": "行号（如果有）",
      "description": "问题描述",
      "suggestion": "修复建议"
    }}
  ],
  "overall_rating": "approve|request_changes|comment"
}}

要求:
- critical: 安全漏洞、严重 bug、数据丢失风险
- major: 逻辑错误、性能问题、潜在崩溃
- minor: 代码风格、命名不规范、缺少注释
- suggestion: 优化建议、最佳实践
- 如果没有问题，issues 数组为空
- 只返回 JSON，不要其他内容
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    )

    result = json.loads(response.text)
    return result

def post_review_comment(review_result):
    """将审查结果发布到 MR 评论"""
    url = f"{GITLAB_URL}/api/v4/projects/{PROJECT_ID}/merge_requests/{MR_IID}/discussions"
    headers = {"PRIVATE-TOKEN": GITLAB_TOKEN}

    # 组装评论文本
    severity_emoji = {
        "critical": "🔴",
        "major": "🟠",
        "minor": "🟡",
        "suggestion": "💡",
    }

    lines = [f"**[AI Review] 代码审查报告**\n"]
    lines.append(f"**总结**: {review_result['summary']}\n")
    lines.append(f"**结论**: {review_result['overall_rating']}\n")

    if review_result["issues"]:
        lines.append("\n### 发现的问题\n")
        for issue in review_result["issues"]:
            emoji = severity_emoji.get(issue["severity"], "❓")
            file_info = f" (`{issue.get('file', '')}`"
            if issue.get("line"):
                file_info += f":L{issue['line']}"
            file_info += ")" if issue.get("file") else ""
            lines.append(
                f"- {emoji} **{issue['severity'].upper()}**{file_info}\n"
                f"  - {issue['description']}\n"
                f"  - 💡 {issue['suggestion']}\n"
            )
    else:
        lines.append("\n未发现明显问题，LGTM!")

    body = "\n".join(lines)
    data = {"body": body}

    resp = requests.post(url, headers=headers, json=data)
    resp.raise_for_status()
    print("审查结果已发布到 MR 评论")
    return resp.json()

if __name__ == "__main__":
    diff_text, mr_title = get_mr_diff()
    print(f"获取到 MR #{MR_IID} 的 diff ({len(diff_text)} 字符)")

    review_result = review_with_gemini(diff_text, mr_title)
    print(f"审查完成: {review_result['summary']}")

    post_review_comment(review_result)
    print("Done!")
```

### 6.3 安装依赖

```bash
pip install google-genai requests
```

---

## 七、步骤 5：通过 GitLab API 读写 MR 评论

### 7.1 读取 MR 评论

```bash
# 获取 MR 的所有评论
curl --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/notes" \
  | jq '.[] | {id, body, author: .author.username, created_at}'
```

**Python**：
```python
import requests

def get_mr_notes(project_id, mr_iid):
    url = f"{GITLAB_URL}/api/v4/projects/{project_id}/merge_requests/{mr_iid}/notes"
    headers = {"PRIVATE-TOKEN": GITLAB_TOKEN}
    resp = requests.get(url, headers=headers)
    return resp.json()

# 筛选 AI Review 的评论
notes = get_mr_notes(PROJECT_ID, MR_IID)
ai_reviews = [n for n in notes if "[AI Review]" in n["body"]]
```

### 7.2 发布 MR 评论

```bash
# 简单评论
curl --request POST \
  --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --url "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
  --data "body=Code review feedback: needs more tests"
```

### 7.3 发布 Diff 行内评论

```bash
curl --request POST \
  --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --url "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
  --data-urlencode "body=This line needs a null check" \
  --data-urlencode "position[base_sha]=$BASE_SHA" \
  --data-urlencode "position[head_sha]=$HEAD_SHA" \
  --data-urlencode "position[start_sha]=$START_SHA" \
  --data-urlencode "position[position_type]=text" \
  --data-urlencode "position[new_path]=src/main.py" \
  --data-urlencode "position[old_path]=src/main.py" \
  --data-urlencode "position[new_line]=42"
```

---

## 八、步骤 6：Codex 自动修复流程

### 8.1 修复脚本

```bash
#!/bin/bash
# fix.sh - 自动修复 MR 中的 Review 问题

set -e

PROJECT_ID=$1
MR_IID=$2
GITLAB_URL=${GITLAB_URL:-"https://gitlab.com"}
GITLAB_TOKEN=$GITLAB_PRIVATE_TOKEN

echo "=== 开始自动修复 MR #${MR_IID} ==="

# 1. 克隆项目到临时目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git clone "$GITLAB_URL/$PROJECT_PATH.git" .
git checkout "$MR_SOURCE_BRANCH"

echo "已切换到分支: $MR_SOURCE_BRANCH"

# 2. 获取 AI Review 评论
echo "获取 AI Review 评论..."
AI_REVIEWS=$(curl -s --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/notes" \
  | jq -r '.[] | select(.body | contains("[AI Review]")) | .body')

if [ -z "$AI_REVIEWS" ]; then
  echo "未发现 AI Review 评论，跳过修复"
  rm -rf "$TEMP_DIR"
  exit 0
fi

# 3. 将 Review 意见保存为文件
echo "$AI_REVIEWS" > /tmp/review_feedback.md
echo "Review 内容已保存到 /tmp/review_feedback.md"

# 4. 使用 Codex 自动修复
echo "调用 Codex 进行修复..."
codex exec -p "请根据以下 Code Review 意见修复代码：

$(cat /tmp/review_feedback.md)

修复后请运行测试确保代码正常工作。"

# 5. 提交并推送
git add -A
if git diff --cached --quiet; then
  echo "Codex 未做出修改"
  # 在 MR 下留评论说明原因
  curl --request POST \
    --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    --url "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
    --data-urlencode "body=[Auto Fix] Codex 分析后认为当前代码无需修改。原因：Review 中提到的问题已在上一次迭代中解决，或属于设计取舍。"
else
  git commit -m "chore: auto-fix based on AI review feedback

Co-Authored-By: Codex <noreply@example.com>"
  git push origin "$MR_SOURCE_BRANCH"
  echo "修复已提交并推送"
fi

# 6. 清理
rm -rf "$TEMP_DIR"
echo "=== 修复流程完成 ==="
```

### 8.2 给脚本添加执行权限

```bash
chmod +x fix.sh
```

---

## 九、步骤 7：循环控制与终止

### 9.1 通过 GitLab CI 编排完整流程

创建 `.gitlab-ci.yml`：

```yaml
# .gitlab-ci.yml
stages:
  - review
  - fix

variables:
  GITLAB_URL: "https://gitlab.com"

# 只在 MR 事件触发
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

# Stage 1: AI Review
ai-review:
  stage: review
  image: python:3.11-slim
  script:
    - pip install google-genai requests
    - python review.py
  variables:
    PROJECT_ID: $CI_PROJECT_ID
    MR_IID: $CI_MERGE_REQUEST_IID
  allow_failure: true
  tags:
    - auto-review

# Stage 2: Auto Fix (在 review 完成后触发)
auto-fix:
  stage: fix
  image: ubuntu:latest
  script:
    - apt update && apt install -y git curl jq
    - chmod +x fix.sh
    - ./fix.sh $CI_PROJECT_ID $CI_MERGE_REQUEST_IID
  variables:
    GITLAB_PRIVATE_TOKEN: $GITLAB_TOKEN
    MR_SOURCE_BRANCH: $CI_MERGE_REQUEST_SOURCE_BRANCH_NAME
    PROJECT_PATH: $CI_PROJECT_PATH
  allow_failure: true
  tags:
    - auto-review
  needs:
    - job: ai-review
  rules:
    - if: $CI_MERGE_REQUEST_IID
```

### 9.2 轮数控制

在 Webhook 服务中记录轮数：

```javascript
// 通过 GitLab API 获取该 MR 已经被自动修复的次数
async function getFixCount(projectID, mrIID) {
  const commitsUrl = `${GITLAB_URL}/api/v4/projects/${projectID}/merge_requests/${mrIID}/commits`;
  const resp = await fetch(commitsUrl, {
    headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN }
  });
  const commits = await resp.json();

  // 统计包含 "auto-fix" 的 commit 数量
  return commits.filter(c =>
    c.title.includes('auto-fix based on AI review')
  ).length;
}

// 在 webhook 中判断
const fixCount = await getFixCount(projectID, mrIID);
if (fixCount >= 2) {
  console.log(`已达到最大修复轮数 (2轮)，停止自动修复`);
  // 在 MR 下留言
  await postComment(projectID, mrIID,
    `[Auto Fix] 已完成 2 轮自动修复，请人工审查决定是否合并。`);
  return;
}
```

### 9.3 手动控制

也可以添加 MR 快速动作（Quick Actions）来控制流程：

- `/review` - 手动触发一次 AI Review
- `/fix` - 手动触发一次自动修复
- `/stop-review` - 停止自动循环

在 Webhook 中解析这些命令：

```javascript
if (comment.trim() === '/review') {
  await triggerReview(projectID, mrIID);
} else if (comment.trim() === '/fix') {
  await triggerFix(projectID, mrIID, projectPath, comment);
} else if (comment.trim() === '/stop-review') {
  await postComment(projectID, mrIID, '[Auto Fix] 自动修复已停止。');
  return;
}
```

---

## 十、完整项目结构

```
auto-review/
├── .gitlab-ci.yml          # CI/CD 配置
├── webhook-server.js       # Webhook 服务
├── review.py               # Gemini Review 脚本
├── fix.sh                  # Codex 自动修复脚本
├── .env.example            # 环境变量示例
└── README.md               # 说明文档
```

### 环境变量

```bash
# .env
GITLAB_URL=https://gitlab.com
GITLAB_PRIVATE_TOKEN=glpat-xxxxxxxxxxxx
GEMINI_API_KEY=your-gemini-api-key
GITLAB_SECRET_TOKEN=your-webhook-secret
TRIGGER_TOKEN=your-pipeline-trigger-token
```

---

## 十一、常见问题

### Q1: GitLab 不支持直接通过 CI 触发 MR 评论事件？

是的。GitLab 的 `workflow:rules` 不支持 `note` 事件源。解决方案：
- 用独立的 Webhook Server 监听 Note Webhook
- Webhook Server 通过 Pipeline Trigger API 或 Trigger API 启动 CI

### Q2: Gemini Code Assist 不支持 GitLab 怎么办？

Gemini Code Assist 是 GitHub 的集成，不直接支持 GitLab。但 Gemini **API** 是通用的——自己调 API，把 MR diff 喂给模型，通过 GitLab API 把结果写成评论即可（见步骤 4）。

### Q3: 如何确保 Runner 有完整的开发环境？

使用 `shell` executor 而非 `docker` executor，这样 Runner 直接运行在你的本地环境中，拥有所有依赖、工具链、测试框架和 Superpowers Skills。

### Q4: 安全注意事项

- `GITLAB_PRIVATE_TOKEN` 和 `GEMINI_API_KEY` 必须通过 GitLab CI Variables 设置（Settings → CI/CD → Variables，勾选 `Masked` 和 `Protected`）
- Webhook 的 Secret Token 要足够长且随机
- 限制 Runner 的执行权限，避免 `git push --force` 等危险操作
- 建议给 Runner 设置 `protected` 标签，只允许受保护分支使用

### Q5: 成本估算

| 组件 | 成本 |
|------|------|
| GitLab Runner (self-hosted) | 免费（用自己的机器） |
| Gemini API (Flash) | 免费额度内免费，超出后 ~$0.10/1M tokens |
| Gemini API (Pro) | ~$1.25/1M tokens |
| GitLab 免费额度 | 500 CI/CD 分钟/月（免费版） |
| ngrok | 免费（有带宽和连接数限制） |

### Q6: 如何调试 Webhook？

```bash
# 方法 1: 本地运行 webhook server，使用 ngrok 暴露
node webhook-server.js
ngrok http 3000

# 方法 2: 用 webhook.site 测试（临时方案）
# 访问 https://webhook.site 获取临时 URL，填入 GitLab Webhook 配置

# 方法 3: 查看 GitLab Webhook 日志
# Settings → Webhooks → 查看最近 20 次 delivery 记录（成功/失败/响应码）
```

---

## 附录：快速上手清单

- [ ] 1. 获取 GitLab Personal Access Token（`api` 权限）
- [ ] 2. 安装并注册 GitLab Runner（`shell` executor）
- [ ] 3. 获取 Gemini API Key
- [ ] 4. 部署 Webhook Server（`webhook-server.js`）
- [ ] 5. 配置 ngrok 暴露 Webhook 端点
- [ ] 6. 在 GitLab 项目中添加 Webhook（触发 Comments）
- [ ] 7. 配置 `.gitlab-ci.yml`
- [ ] 8. 设置 CI/CD Variables（`GITLAB_TOKEN`, `GEMINI_API_KEY` 等）
- [ ] 9. 提交 MR 测试完整流程
- [ ] 10. 调整轮数控制和修复策略
