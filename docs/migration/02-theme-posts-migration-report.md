# Claude Code 文章迁移报告

## 汇总

- 待迁移：52
- 已迁移：0
- 标记 draft：20
- 跳过：0
- 路径冲突：51
- 敏感信息命中：87

## 已迁移文件

| 源文件 | 目标文件 | 标题 | published | tags |
| --- | --- | --- | --- | --- |

## 敏感信息处理

| 源文件 | 类型 | 处理方式 | 说明 |
| --- | --- | --- | --- |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/Auto-Review项目搭建实录.md | keyword | review | line 283: - **Secret token**: 留空 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | env-secret | redacted | token=${process.env.TRIGGER_TOKEN} |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | env-secret | redacted | api_key=GEMINI_API_KEY) |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 68: | **GitLab Personal Access Token** | 需要 `api` 权限，用于 API 调用 | |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 98: ### 3.2 获取 Runner 认证 Token |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 106: > **注意**：GitLab 15.10+ 使用 Runner Authentication Token（`glrt-` 前缀），旧的 Registration Token（`gr1348...` 前缀）已弃用。 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 129: --token "$RUNNER_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 157: | **Secret token** | 自定义密钥，用于验证请求来源 | |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 228: if (req.headers['x-gitlab-token'] !== SECRET_TOKEN) { |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 296: 1. 访问 https://aistudio.google.com/apikey |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 323: headers = {"PRIVATE-TOKEN": GITLAB_TOKEN} |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 385: headers = {"PRIVATE-TOKEN": GITLAB_TOKEN} |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 448: curl --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 459: headers = {"PRIVATE-TOKEN": GITLAB_TOKEN} |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 473: --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 482: --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 523: AI_REVIEWS=$(curl -s --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 551: --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \ |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 639: headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN } |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 727: - Webhook 的 Secret Token 要足够长且随机 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | keyword | review | line 759: - [ ] 1. 获取 GitLab Personal Access Token（`api` 权限） |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review实操-NodeJS版.md | keyword | review | line 188: async function reviewDiff(diffText, apiKey, model = 'gemini-2.5-flash-lite') { |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review实操-NodeJS版.md | keyword | review | line 189: const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`; |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review实操-NodeJS版.md | keyword | review | line 437: | Secret token | 留空（V1 暂未使用） | |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/OpenAI-Codex-Use-Cases-案例库深度调研.md | keyword | review | line 136: | 用 variables / design tokens，特别是颜色、字体、间距 | Codex 直接映射到 repo 的 token | |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/OpenAI-Harness-Engineering-智能体优先方法论调研.md | keyword | review | line 191: - 重要技术决策（Token 缓存机制、wechat-skill 选型）必须落到 markdown |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/Subagent学习与实践.md | keyword | review | line 209: - 那些 JSON 进度报告是噪音，占用 token |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md | keyword | review | line 638: 有了尺子还不够，你还得看到 Agent 每一次的**真实足迹**，也就是它每一步做了什么决策、调了哪个工具、拿到什么返回、花了多少 token。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md | keyword | review | line 648: 你的 PR Review Agent 真跑起来之后，一定会遇到各种奇形怪状的失败：GitHub API 限流、某个 PR 的 diff 太大把上下文冲爆、Slack webhook 过期、Agent 误判了一个无关 PR 然后疯狂读代码把  |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md | keyword | review | line 656: 对 PR Review Agent 来说，约束可以包括：「一次最多分析 20 个 PR」「不能对已 closed 的 PR 再评论」「不能直接修改 PR 本身」「token 用量超过 10 万就立刻停下」。这些约束最好**硬编码到代码或 l |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md | keyword | review | line 664: GitHub 限流 → 等一段时间后重试；Slack 发送失败 → 先落到本地队列，下次重试；token 快耗光 → 立即停下并保存进度，下一轮继续。**每一种典型失败都应该有一条明确的恢复路径**，而不是一股脑全挂掉。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/高德OPC+Harness自主增长系统方法论.md | keyword | review | line 75: - 上下文污染是 #1 杀手，所有"为了省 token 复用 Agent"的优化最后都得回退。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 95: 代价是灵活度不如 ReAct，遇到计划外的情况容易卡住；实现也更复杂，需要分别维护规划模块和执行模块，token 消耗也会增加。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 117: 代价是至少多一次 LLM 调用，token 消耗和延迟都会线性增加，如果没有轮次限制，还很容易陷入「为了改而改」的死循环。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 131: 这样既保留了 Plan-and-Execute「先规划再执行」的结构优势，又不会因为计划太僵硬而在意外情况下翻车。代价是每步都多了一次「重新评估计划」的 LLM 调用，token 消耗会增加。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 153: ### **token 消耗对比** |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 155: 三种范式在 token 消耗上的差异是选型时必须考虑的现实因素，咱们用一个具体的例子来直观感受一下。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 157: 假设有一个需要 5 步工具调用的任务，每步产生的推理和工具结果平均占 2000 token。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 159: 用 ReAct 来跑，因为每次调 LLM 都要把完整历史带上，第一步输入 2000 token，第二步 4000，第三步 6000，依次递增，光输入就是 2000 + 4000 + 6000 + 8000 + 10000 = 30000 t |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 163: 规划阶段调一次 LLM，输入是任务描述加工具列表，大约 3000 token。执行阶段每步只需要带当前步骤的指令和前面步骤的结果摘要（不是完整的推理历史），每步大约 1500 token，5 步总共 7500 token。汇总阶段再调一次  |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 165: 加了 Reflection 之后，每个需要反思的节点至少多一次 LLM 调用（评估一次，不达标还要重做），token 消耗会在基础范式上再增加 30% 到 100%，取决于反思的轮次和严格程度。如果一个步骤反思了两轮才通过，那这一步的消耗就 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 169: 实际项目中的建议是：先用 ReAct 快速验证效果，确认任务能跑通之后，再根据 token 消耗和延迟的实际数据，决定要不要切换到 Plan-and-Execute 或者叠加 Reflection。不要一上来就选最复杂的方案，先跑起来再优化 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 191: 说完定位，再按维度对比三者的核心区别：ReAct 边想边干、灵活度最高但长任务容易跑偏；Plan-and-Execute 先规划再执行、结构清晰但灵活度不足；Reflection 专门解决输出质量问题，代价是增加 token 消耗和延迟。 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | keyword | review | line 193: 如果面试官追问进阶内容，可以展开讲动态 Replan 是怎么解决「计划太僵硬」的问题，Reflexion 是怎么通过「错题本」机制实现跨任务经验积累的，再补充一下三种范式的 token 消耗差异。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/web-access-技能安装与Claude周报实践记录.md | keyword | review | line 78: - **独立博客/文档**：Jina（r.jina.ai/URL，省 token） |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/web-access-技能安装与Claude周报实践记录.md | keyword | review | line 102: ### Token 消耗 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/web-access-技能安装与Claude周报实践记录.md | keyword | review | line 153: - 英文静态页面 → WebSearch/Jina，快且省 token |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/技能清单-2026-04-21.md | keyword | review | line 407: **描述**: 使用 tree-sitter AST 解析进行 token 优化的代码搜索 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/技能清单-2026-04-21.md | keyword | review | line 516: 1. **技能委托**: 许多技能会委托给专门的 agent 执行，以节省主会话 token 并提供更专业的处理 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我的Skill装备库.md | keyword | review | line 102: | smart-explore   | Claude-Mem | 基于 tree-sitter AST 的 token 优化代码结构搜索 | |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我的Skill装备库.md | keyword | review | line 136: | session-report  | Session Report | 会话使用报告（token/cache/子代理统计） | |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 15: 它们单独看都不新鲜，但真正接起来之后，整个工作流的效率、稳定性和 token 使用方式都会不一样。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 61: 根据 Google 在 2026 年 4 月 2 日公开发布 Gemma 4 时给出的信息，这一代强调的是多模态、长上下文和开发者可集成性。官方资料提到，Gemma 4 的大模型支持最高 `256K` 上下文，覆盖 `140+` 种语言；而 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 95: - 第一层是本地模型，也就是 Gemma 4。它解决的是“不是所有任务都值得联网、都值得烧昂贵 token”这个问题。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 103: ## 这段时间我越来越在意：高效使用 token |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 105: 这段时间我最大的体会是，模型不一定非得只靠一个，关键是能不能把它们配合起来，把一件事情用更少的 token 做完。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 111: 这样用下来，我越来越确认一件事：高效使用 token，本身就是一项非常重要的技能。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 113: 最少的 token，实现最佳的效果。我知道token会越来越便宜，但我要表达的是一种精准制导，而非狂轰乱炸一顿乱问。 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 184: - MoE 结构，总参数约 25.2B，每个 token 推理时激活约 3.8B 参数 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 205: | 本地模型 Gemma 4 | 高频执行 | 不是所有任务都值得联网、都值得烧昂贵 token | |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 217: 3. **成本意识**：明确意识到 token 也是成本，高效使用 token 本身就是一项重要技能 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 237: ### 关于"高效使用 token"的深层思考 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | keyword | review | line 239: 作者提到"高效使用 token，本身就是一项非常重要的技能"，这个观点非常有启发性。这里的"高效"其实有几层含义： |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/baoyu-skillsREADME.zh.md at main.md | keyword | review | line 754: | `OPENAI_API_KEY` | OpenAI API 密钥 | \- | |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/baoyu-skillsREADME.zh.md at main.md | keyword | review | line 761: | `REPLICATE_API_TOKEN` | Replicate API Token | \- | |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/baoyu-skillsREADME.zh.md at main.md | keyword | review | line 763: | `JIMENG_SECRET_ACCESS_KEY` | 即梦火山引擎 Secret Key | \- | |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/MiniCPM5-1B-本地部署实录.md | keyword | review | line 53: -e OPENAI_API_KEY=sk-fake \ |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/MiniCPM5-1B-本地部署实录.md | keyword | review | line 200: **待配置**（需要 GitHub Token）： |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/Open-Design-开源版-Claude-Design-完整调研.md | keyword | review | line 193: 只有 `od_generate_design` 需要 BYOK：`BYOK_BASE_URL` + `BYOK_API_KEY` + `BYOK_MODEL`，其他 9 个工具只需 `OD_DAEMON_URL`。 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/repomix-工具使用探索.md | keyword | review | line 21: - 代码压缩：通过 Tree-sitter 提取关键结构，去除注释、空行减少 Token 消耗 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/repomix-工具使用探索.md | keyword | review | line 32: | 什么场景用 repomix？ | 远程 GitHub repo（不想 clone）、需要安全扫描、需要 Token 优化 | |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/repomix-工具使用探索.md | keyword | review | line 38: - repomix 需要 Node.js 20+，低版本会报错 `SyntaxError: Unexpected token 'with'` |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/repomix-工具使用探索.md | keyword | review | line 48: 3. **Token 敏感**：通过 Tree-sitter 压缩代码结构，自动去除空行、注释 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | keyword | review | line 38: | 命令                         | 功能                         | Token 消耗   | |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | keyword | review | line 104: ## Token 消耗评估 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | keyword | review | line 106: - **全量分析**（`/understand`）: 一次性高消耗，大型项目数万到数十万 Token |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | keyword | review | line 123: - 全量分析 Token 消耗高 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | keyword | review | line 137: Understand-Anything 是目前最强的代码库理解工具，核心价值在于将"盲读代码"转变为"图谱导航"。一次性全量分析的 Token 投入，换来后续所有问题的低成本精准回答。接手陌生项目时，按 `understand → dash |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/video-use-视频编辑agent.md | keyword | review | line 14: **优势**：相比逐帧读取（30000帧 × 1500 tokens = 45M tokens），video-use 只需 12KB 文本 + 少量 PNG，token 消耗降低几个数量级。 |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 55: → gRPC 调用 SsoService.Verify(token) |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 58: → 入参: VerifyParam { token } |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 59: → 出参: VerifyResponse { status, data: Token { user_uuid, team_uuid } } |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 72: string token = 1; |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 78: Token data = 3; |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 81: message Token { |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 92: - token 格式、过期策略、登出逻辑全部由 SSO 统一管理 |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | keyword | review | line 130: | `ddm_login_token` | 登录 token（降级鉴权用） | |

## Draft 文件

| 目标文件 | 原因 |
| --- | --- |
| src/content/posts/工具/Auto-Review/02-auto-review/auto-review项目搭建实录/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/工具/Auto-Review/02-auto-review/gitlab自动review流程接入指南/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/工具/Auto-Review/02-auto-review/gitlab自动review实操-nodejs版/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/openai-codex-use-cases-案例库深度调研/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/openai-harness-engineering-智能体优先方法论调研/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/subagent学习与实践/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/鹅厂面试官:“你怎么看-harness-engineering?”-我:“就是给大模型套缰绳”-他拍桌:终于有人说明白了/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/高德opc+harness自主增长系统方法论/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/AI工作流/03-ai-workflow/字节面试官:“plan-and-execute-比-react-强在哪?”/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/Skill开发/04-skill-dev/web-access-技能安装与claude周报实践记录/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/Skill开发/04-skill-dev/技能清单-2026-04-21/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/Skill开发/04-skill-dev/我的skill装备库/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/AI工具/Skill开发/04-skill-dev/我做了一个-skill,让本地gemma4模型也能用上大厂-ui设计技巧/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/baoyu-skillsreadme.zh.md-at-main/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/minicpm5-1b-本地部署实录/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/open-design-开源版-claude-design-完整调研/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/repomix-工具使用探索/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/understand-anything插件使用指南/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/项目调研/07-项目调研/video-use-视频编辑agent/index.md | 存在需要人工复核的敏感关键词命中 |
| src/content/posts/其他/杂项/99-misc/管理后台api迁移nestjs方案/index.md | 存在需要人工复核的敏感关键词命中 |

## 路径冲突

| 源文件 | 目标文件 | 原因 |
| --- | --- | --- |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/Auto-Review项目搭建实录.md | src/content/posts/工具/Auto-Review/02-auto-review/auto-review项目搭建实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review流程接入指南.md | src/content/posts/工具/Auto-Review/02-auto-review/gitlab自动review流程接入指南/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/GitLab自动Review实操-NodeJS版.md | src/content/posts/工具/Auto-Review/02-auto-review/gitlab自动review实操-nodejs版/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/02-auto-review/自动Review流程详解.md | src/content/posts/工具/Auto-Review/02-auto-review/自动review流程详解/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/AI-负责筛选与结构化而不是最终创作.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/ai-负责筛选与结构化而不是最终创作/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/AI编程组合实战指南.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/ai编程组合实战指南/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/Claude-Code-plan-mode-与-Superpowers-brainstorming-配合使用.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/claude-code-plan-mode-与-superpowers-brainstorming-配合使用/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/OpenAI-Codex-Use-Cases-案例库深度调研.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/openai-codex-use-cases-案例库深度调研/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/OpenAI-Harness-Engineering-智能体优先方法论调研.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/openai-harness-engineering-智能体优先方法论调研/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/Subagent学习与实践.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/subagent学习与实践/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/Superpowers-给-Agent-加上跳不过去的工作流.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/superpowers-给-agent-加上跳不过去的工作流/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/鹅厂面试官：“你怎么看 Harness Engineering？” 我：“就是给大模型套缰绳” 他拍桌：终于有人说明白了.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/鹅厂面试官:“你怎么看-harness-engineering?”-我:“就是给大模型套缰绳”-他拍桌:终于有人说明白了/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/放弃Vibe Coding：我用Superpowers+gstack沉淀出一套大幅减少返工的skill组合工作流（附案例）.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/放弃vibe-coding:我用superpowers+gstack沉淀出一套大幅减少返工的skill组合工作流附案例/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/高德OPC+Harness自主增长系统方法论.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/高德opc+harness自主增长系统方法论/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/开发流程skill化.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/开发流程skill化/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/用好-Coding-Agent-的重点是两头抓.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/用好-coding-agent-的重点是两头抓/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/03-ai-workflow/字节面试官：“Plan-and-Execute 比 ReAct 强在哪？”.md | src/content/posts/AI工具/AI工作流/03-ai-workflow/字节面试官:“plan-and-execute-比-react-强在哪?”/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/Claude-Code-重复工作流审计与项目级Skill沉淀.md | src/content/posts/AI工具/Skill开发/04-skill-dev/claude-code-重复工作流审计与项目级skill沉淀/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/claude-mem故障排查与修复实录.md | src/content/posts/AI工具/Skill开发/04-skill-dev/claude-mem故障排查与修复实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/daily-recap-skill改造与Claude-Memory系统.md | src/content/posts/AI工具/Skill开发/04-skill-dev/daily-recap-skill改造与claude-memory系统/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/Prompt-Optimizer技能封装全过程.md | src/content/posts/AI工具/Skill开发/04-skill-dev/prompt-optimizer技能封装全过程/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/skill-cleaner-开发与首轮审计.md | src/content/posts/AI工具/Skill开发/04-skill-dev/skill-cleaner-开发与首轮审计/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/TechDebt-Skill-封装实录.md | src/content/posts/AI工具/Skill开发/04-skill-dev/techdebt-skill-封装实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/TTS-Skill-百聆-CosyVoice-封装全记录.md | src/content/posts/AI工具/Skill开发/04-skill-dev/tts-skill-百聆-cosyvoice-封装全记录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/web-access-技能安装与Claude周报实践记录.md | src/content/posts/AI工具/Skill开发/04-skill-dev/web-access-技能安装与claude周报实践记录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/爆火Skill合集总结.md | src/content/posts/AI工具/Skill开发/04-skill-dev/爆火skill合集总结/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/技能清单-2026-04-21.md | src/content/posts/AI工具/Skill开发/04-skill-dev/技能清单-2026-04-21/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我的Skill装备库.md | src/content/posts/AI工具/Skill开发/04-skill-dev/我的skill装备库/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/04-skill-dev/我做了一个 Skill，让本地Gemma4模型也能用上大厂 UI设计技巧.md | src/content/posts/AI工具/Skill开发/04-skill-dev/我做了一个-skill,让本地gemma4模型也能用上大厂-ui设计技巧/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/git-reflog-找回丢失代码教程.md | src/content/posts/工具/终端配置/05-terminal-tooling/git-reflog-找回丢失代码教程/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/LazyVim-从入门到配置体系学习记录.md | src/content/posts/工具/终端配置/05-terminal-tooling/lazyvim-从入门到配置体系学习记录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/macOS终端工具链搭建实录.md | src/content/posts/工具/终端配置/05-terminal-tooling/macos终端工具链搭建实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/Neovim-终端开发配置指南.md | src/content/posts/工具/终端配置/05-terminal-tooling/neovim-终端开发配置指南/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/Tmux-Agent-配置实录.md | src/content/posts/工具/终端配置/05-terminal-tooling/tmux-agent-配置实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/tmux配置总结.md | src/content/posts/工具/终端配置/05-terminal-tooling/tmux配置总结/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/05-terminal-tooling/从iTerm2到cmux终端工作流升级与自动化实录.md | src/content/posts/工具/终端配置/05-terminal-tooling/从iterm2到cmux终端工作流升级与自动化实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/06-ai-articles/AI寓言故事教学法.md | src/content/posts/AI工具/AI文章/06-ai-articles/ai寓言故事教学法/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/baoyu-skillsREADME.zh.md at main.md | src/content/posts/其他/项目调研/07-项目调研/baoyu-skillsreadme.zh.md-at-main/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/Claude-Code-插件-security-guidance-与-Webwright-框架调研.md | src/content/posts/其他/项目调研/07-项目调研/claude-code-插件-security-guidance-与-webwright-框架调研/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/earendil-works-pi-Agent-Harness-Mono-Repo.md | src/content/posts/其他/项目调研/07-项目调研/earendil-works-pi-agent-harness-mono-repo/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/kimi-code打包与配置记录.md | src/content/posts/其他/项目调研/07-项目调研/kimi-code打包与配置记录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/MiniCPM5-1B-本地部署实录.md | src/content/posts/其他/项目调研/07-项目调研/minicpm5-1b-本地部署实录/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/Open-Design-DESIGN.md-提炼指南.md | src/content/posts/其他/项目调研/07-项目调研/open-design-design.md-提炼指南/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/Open-Design-开源版-Claude-Design-完整调研.md | src/content/posts/其他/项目调研/07-项目调研/open-design-开源版-claude-design-完整调研/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/pi-agent-harness-研究笔记.md | src/content/posts/其他/项目调研/07-项目调研/pi-agent-harness-研究笔记/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/repomix-工具使用探索.md | src/content/posts/其他/项目调研/07-项目调研/repomix-工具使用探索/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/understand-anything插件使用指南.md | src/content/posts/其他/项目调研/07-项目调研/understand-anything插件使用指南/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/video-use-视频编辑agent.md | src/content/posts/其他/项目调研/07-项目调研/video-use-视频编辑agent/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/07-项目调研/wshobson-commands仓库调研.md | src/content/posts/其他/项目调研/07-项目调研/wshobson-commands仓库调研/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/GPT-Image-2-提示词案例合集.md | src/content/posts/其他/杂项/99-misc/gpt-image-2-提示词案例合集/index.md | 目标文件已存在，未覆盖 |
| /Users/xiangwang/claudecode/markdown/02-主题/99-misc/管理后台API迁移NestJS方案.md | src/content/posts/其他/杂项/99-misc/管理后台api迁移nestjs方案/index.md | 目标文件已存在，未覆盖 |

## 跳过文件

本次脚本采用白名单文件清单，未在白名单中的文件不会进入待迁移列表。
