---
title: "开发流程skill化"
published: 2026-05-20
description: "作者: TechPaper 发布时间: 2026年5月2日 01:31 原文链接: https://mp.weixin.qq.com/s/8X9xBBfjbAudzdUtA_koeA"
tags: ["AI工作流", "03-ai-workflow"]
category: "AI工具"
image: api
draft: false
---
# 开发流程 skill 化

**作者**: TechPaper  
**发布时间**: 2026年5月2日 01:31  
**原文链接**: https://mp.weixin.qq.com/s/8X9xBBfjbAudzdUtA_koeA

---

warp 最近开源了，项目规模不小，将近 100w 行 rust 代码，算是个巨型项目了。翻了一下它的 repo，里面有一个 `.claude/skills/` 目录，里面装了二十来个文件夹，每个文件夹里就一个 `SKILL.md`。

他们写的倒是挺简单的，虽然是个 rust 项目，不过简单改改，在自己的开发流程中就可以直接用，做一个自己的 dev workflow。

## 它长什么样

先说具体的。一个 skill 就是一个文件夹，一个 markdown，YAML frontmatter 里写两个字段，一个 `name`，一个 `description`，正文是给 agent 看的操作说明。

比如 `write-tech-spec` 这个 skill，frontmatter 是这样：

```markdown
---
name: write-tech-spec
description: Write a TECH.md spec for a significant Warp feature after researching the current codebase and implementation constraints. Use when the user asks for a technical spec, implementation plan, or architecture doct tied to a product spec.
---
```

正文写：什么时候用、写之前要读哪些代码、文件应该放在哪个路径下、必填的章节是哪几个、可选的章节是哪几个、行数大概控制在多少、写完之后下一步去哪个 skill。

整个 Warp 的 skills 目录里，绝大多数 skill 就是这种纯 markdown，没有脚本，没有 runtime，没有复杂的依赖。只有 `resolve-merge-conflicts` 这一个带了点 Python 脚本，因为它要从冲突文件里抽 ours/base/theirs 三段，让 agent 自己读会爆上下文。

这个简陋程度其实是它最值钱的地方。

## 团队的流程都丢哪儿了

写代码这么多年，我越来越确信一件事：一个团队真正值钱的东西大半不在代码里。

代码是结果。流程才是产生这些结果的路径。

但流程通常没人写。或者写过，但是写在某个 wiki 里，三个月没人更新，新来的人根本找不到。再或者写在某个老员工脑子里，他一离职，整套东西就跟着没了。

举几个我实际遇到过的：

- bug fix 要不要补 regression test？
- PR 合之前到底要跑哪几个 check？
- CI 挂了第一眼应该看哪个 job？
- 哪种改动必须先加 feature flag？
- 集成测试什么情况下可以跳？
- review 里的 comment 怎么分级，哪些必须改哪些可以 nit？

这些问题在很多公司都没标准答案。或者更准确地说：有，但只在某几个资深工程师脑子里。

新人不知道，新合作的同事不知道，agent 更不知道。每来一个新人就要从头讲一遍，每次 review 都要在 PR 里再纠正一遍，每次 CI 挂了都要重新摸索一遍哪个 job 最值得先看。

这种东西其实不能叫工程流程，更像部落习俗。规模一上来就撑不住。

Warp 这套 skills 的意义就是把这些习俗写下来。不是写成 wiki 文档，是写成可以被 agent 加载的、有触发条件的、能彼此引用的小文件。

## description 字段比正文还重要

skill 的 frontmatter 里有个 `description` 字段。一开始我以为这就是个标题，多看几个之后才意识到这是整个 skill 系统里最关键的设计。

agent 不会一次把所有 skill 全读进上下文，那样太贵了。agent 是先扫一遍 description，判断当前任务和哪些 skill 相关，再去加载具体内容。

所以 description 不能写成 "Helps with development"，那样写等于没写。development 是什么，写代码是 development，修 CI 也是 development，删 feature flag 也是 development。

Warp 的 description 普遍写得很长，长到看着像两句话。但仔细看会发现它在回答两件事：

1. 这个 skill 是干嘛的；
2. 什么情况下应该用它。

比如 `diagnose-ci-failures` 的 description：

> Diagnose CI failures for a PR using the GitHub CLI, extract error logs, and generate a plan to fix them. Use when the user asks to check CI status, pull CI issues, triage test failures, or investigate PR build failures.

前半句说做什么，后半句说什么时候用。后半句基本是把用户可能的提问方式列出来，等于直接告诉 agent："听到这种话就用我"。

这件事如果迁移到人身上，其实就是一份带触发条件的 SOP 目录。我们以前给团队写新人手册的时候，常常一上来就讲"做事的流程"，但很少讲"什么时候该走这套流程"。结果新人看完一脸懵，不知道现在该不该套用。

把"什么时候用"显式写出来，比把"怎么做"写得多详细都更重要。

## 拆 PRODUCT.md 和 TECH.md

Warp 的 spec-driven workflow 把设计文档拆成了两份：`PRODUCT.md` 和 `TECH.md`。

`PRODUCT.md` 只写从用户/调用方角度看到的东西。用户看到什么、输入什么、输出什么、有哪几种状态、错误的时候怎么表现、边界情况、必须保持的不变量。

它的 SKILL.md 里写得很死板：不要写实现细节、不要写内部数据结构、不要写模块边界、不要写算法。要写就写"用户按这个键以后会发生什么"。

`TECH.md` 才写实现：当前系统长什么样，要改哪些文件（带行号），数据怎么流，状态放在哪儿，风险在哪儿，怎么验证产品行为。

这个拆法看着没什么，但它解决了一个我们写设计文档的老毛病——产品行为和实现细节混在一起。

混在一起的设计文档很难看。产品同学看不懂，因为里面一半是 trait、Arc、async 这种东西。工程师又觉得那些行为描述太虚，看完不知道到底该怎么写。最后整份文档变成一个仪式：写的时候痛苦，写完没人看，代码改了之后也没人回去更新。

Warp 这边把它们分成两个文件之后，产品行为可以一个一个列成 numbered invariant，类似：

> 4. Column widths are chosen to fit the table's natural content when it fits inside the block. If a single cell's content is very long, that cell wraps its text within its column rather than forcing the column to an unreasonable width.

`TECH.md` 里的测试章节就直接引用这些编号："invariant 4 → 这个 unit test、那个 integration test"。两边一一对应。

我特别喜欢这个设计的一个细节：`PRODUCT.md` 里 SKILL.md 明确禁止写 Validation 章节，验证全部归到 `TECH.md`。这样就不会出现"产品文档里写了一堆测试用例，但和 TECH.md 重复"这种事。

另外 SKILL.md 里写了一句我觉得很关键的话：实现过程中如果偏离了 spec，要回去改 spec，让 spec 和最终 ship 的代码保持一致，spec 和实现放在同一个 PR 里 merge。

这相当于把设计文档变成 living documentation。文档不是审批材料，是实现过程的一部分。代码改了，文档跟着改，PR 一起合。这是大部分团队做不到、但其实没什么技术门槛的事。

## 总控 + 阶段

skill 多了之后，Warp 用了一个我觉得挺值得抄的结构：总控 skill 加阶段 skill。

总控 skill 是 `spec-driven-implementation`。它自己不写代码、不开 PR、不跑测试。它只做几件事：

- 判断这个任务到底需不需要写 spec；
- 如果需要，先写 PRODUCT 还是先写 TECH；
- 写完 spec 之后跳到 `implement-specs`；
- 实现过程中如果偏了，回头改 spec；
- 最后跳到 `create-pr`。

阶段 skill 各自负责自己那段。`write-product-spec` 只管写 PRODUCT.md，`write-tech-spec` 只管写 TECH.md，`create-pr` 只管开 PR 前的那一坨检查。

我自己之前看过一些团队尝试搞 prompt 工程，做法是写一个超大的 system prompt，把所有规则都塞进去，恨不得一个文件管完所有事。结果就是 prompt 越写越长，规则之间互相打架，agent 读完之后不知道当前到底该按哪条做。

把流程拆成总控 + 阶段，每个文件只回答一个范围的问题，是规模化的前提。这其实和我们写代码时的模块拆分是一回事，只不过现在这些模块的"调用方"是 agent。

把 `spec-driven-implementation` 里的判断画出来大概是这样：

```
[新任务]
  │
  ▼
要不要写 spec?
  ├─ 小 bug fix / 简单 refactor / 窄 UI tweak
  │     └─▶ 跳过 spec, 直接验证
  │
  └─ 1k+ LOC / 跨模块 / 行为有歧义 / 风险高
        │
        ▼
     已有 Linear ticket?
        ├─ 否 ─▶ 用 Linear MCP 创建 issue
        └─ 是
              │
              ▼
        [write-product-spec]
              │
              ▼
        有 UI / 交互?
           ├─ 是 ─▶ 已有 Figma mock?
           │          ├─ 有 ─▶ spec 里贴链接
           │          └─ 无 ─▶ 显式写 "Figma: none provided"
           └─ 否
              │
              ▼
        要写 TECH.md 吗?
           ├─ 纯 UI / 单模块 / 思路明确 ─▶ 直接 [implement-specs]
           └─ 跨模块 / 架构权衡 / 风险高 ─▶ [write-tech-spec] ─▶ [implement-specs]
              │
              ▼
        实现偏离 spec?
           ├─ 是 ─▶ 同 PR 内更新 PRODUCT.md / TECH.md
           └─ 否
              │
              ▼
        针对 spec 做验证 ─▶ [create-pr]
```

每个分支都对应一份很具体的判断标准——"1k+ LOC"、"跨模块"、"行为有歧义"，不是模糊的"重要的功能"。这种东西如果只是写在 wiki 里，谁也不会按它来判断；写在 SKILL.md 里被 agent 加载，反而每一次都得走一遍。

## 通用规则和本地规则

Warp 的 skills 里还有一对我觉得很值得借鉴的设计：

- `review-pr`
- `review-pr-local`

`review-pr` 写通用的 review 流程：怎么读 diff、输出格式是什么、severity 怎么分。

`review-pr-local` 只写当前这个 repo 自己的怪规矩：Warp 客户端是 Rust 加自研 UI 框架，有些写法在别处合理但在这个 repo 里禁用；某些目录有 owner，PR 改到那里要先 ping 谁；某些 panic 在 prod 是不能容忍的等等。

每个团队都有这种"祖传习俗"。有些是历史包袱留下的，有些是某个老员工某天下午随手定的偏好。无论合理不合理，只要它真实影响 review，就应该被写出来。

但不要塞进通用 skill 里。通用的部分要保持干净，本地差异另起一个文件。我看过太多团队最后写出来的"开发规范"是一个 5000 字的 markdown，前 1000 字是通用做法，后 4000 字是各种特例和"如果你在 X 服务里，请改成 Y"。这种文档没人看得动。

更合理的做法是分层，比如：

```
create-pr           （通用）
create-pr-local     （这个 repo）

review-pr
review-pr-local

release
release-service-a
release-service-b
```

通用的部分可以在多个仓库之间复用，本地差异各自维护，互不污染。

工程里很多抽象做坏了，是因为一开始假装大家都一样。最后通用流程被各种特例塞爆，没法看，团队又退回到口口相传。

## 什么时候上脚本

Warp 的 skills 大部分都是纯 markdown。`resolve-merge-conflicts` 是少数带脚本的 skill 之一。原因也很简单——靠 agent 手工读一个几千行的冲突文件去抽 ours/base/theirs，要么爆上下文，要么漏 hunk。脚本一跑就能稳定输出几个紧凑的 diff，agent 拿着这个 diff 去想怎么 merge 就行。

它的整体流程长这样：

```
[merge / rebase / cherry-pick 停在冲突]
  │
  ▼
python3 extract_conflict_context.py        (summary)
  │
  ▼
拿到 unresolved 文件清单 + 每文件 hunk 数
  │
  ▼
┌─▶ 选一个文件细看
│     │
│     ▼
│  python3 ... --file path
│  (只输出 ours / base / theirs + 紧凑 diff)
│     │
│     ▼
│  紧凑 diff 够看清吗?
│     ├─ 否 ─▶ Read 完整文件作为后备
│     └─ 是
│          │
│          ▼
│  怎么解?
│     ├─ 完全要 ours    ─▶ git checkout --ours   -- path
│     ├─ 完全要 theirs  ─▶ git checkout --theirs -- path
│     └─ 都要 / 手动     ─▶ Edit 文件, 删除 conflict marker
│          │
│          ▼
│  git diff --name-only --diff-filter=U
│          │
│          ▼
│  还有 unresolved?
└──── 是
      └─ 否
          │
          ▼
       grep '&lt;&lt;&lt;&lt;&lt;&lt;&lt;\\|=======\\|&gt;&gt;&gt;&gt;&gt;&gt;&gt;' 兜底确认
          │
          ▼
       跑相关 test / lint, git add
```

注意脚本只负责"稳定抽出冲突上下文"这一件事，merge 决策本身还是 agent 在做。这个边界划得很重要：脚本只补"agent 单跑搞不定的那部分"，剩下的判断仍然在 markdown 里描述。

我把这个判断总结一下，大概是这样：

- 只是流程约定，不需要精确解析什么东西，markdown 就够了；
- 需要重复跑命令，把命令直接写在 markdown 里，让 agent 自己复制去跑；
- 需要稳定地从大文件、大输出里抽结构化信息，写脚本，让 skill 调脚本；
- 需要长时间运行、调度、隔离环境、收集产物，再考虑 harness 那一套。

不要一上来就 harness。

我之前写过一篇专门聊 harness（harness-or-not-harness），观点也是类似的：harness 解决的是"agent 单跑搞不定的工程问题"，不是"我们的流程没写明白"。在流程本身都没沉淀的时候去搞 harness，本质上是在给混乱套个壳，跑起来反而更难调。

先把流程写明白，再看哪些环节真的需要工具支撑。顺序反了就很难补。

## 抄一个最小可用的版本

如果你想给自己的团队搭一套，可以从这套最小集合开始。

```
.claude/skills/
  feature-workflow/SKILL.md          # 总控
  write-product-plan/SKILL.md        # 写产品行为
  write-tech-plan/SKILL.md           # 写技术方案
  implement-plan/SKILL.md            # 按 spec 实现
  verify-change/SKILL.md             # 跑测试、自审 diff
  create-pr/SKILL.md                 # 开 PR
  diagnose-ci/SKILL.md               # CI 挂了怎么排
  review-pr-local/SKILL.md           # 本仓库的 review 规则
```

每个 SKILL.md 至少要回答下面几个问题，写不出来就说明这个 skill 还没想清楚：

- 什么情况下用？（写在 description 里）
- 输入是什么？（用户的请求 + 哪些已有文件 + 哪些代码要先读）
- 输出是什么？（生成或修改了哪些文件）
- 必须做哪些步骤？（按顺序写）
- 失败之后跳到哪个 skill？

最后一条尤其容易被忽略。一个 skill 写完之后大概率不是终点，要么进下一个阶段，要么遇到错误回到诊断流程。把这个跳转关系写清楚，整套 skill 才能串成 workflow，而不是一堆孤立的说明书。

## 附：几个 skill 的决策图

下面这几张是我把 Warp 现有 skill 里"判断分支比较多"的那些抽出来画的。看图比看 SKILL.md 全文更快，也能看出每个 skill 里"什么是必须做的、什么是有条件做的、失败之后跳到哪"。

如果你要给自己团队搭一套 workflow，这几张图基本上就是"开 PR 之前要检查什么"、"CI 挂了怎么排"、"feature flag 怎么往外推"这些事的最小骨架。换个团队，分支条件会不一样，但骨架结构差不多。

### create-pr：开 PR 前的所有事

```
[准备开 PR]
  │
  ▼
git fetch &amp;&amp; git merge origin/master
  │
  ▼
有代码改动?
  ├─ 否 (纯文档) ─▶ 跳过 fmt/clippy
  └─ 是
        │
        ▼
     ./script/presubmit
        │
        ▼
     通过?
        ├─ 否 ─▶ [fix-errors] ─▶ 重跑 presubmit
        └─ 是
  │
  ▼
git diff base...HEAD 自审
  │
  ▼
判断测试覆盖
  ├─ bug fix           ─▶ 必须有 regression test
  ├─ 算法 / 数据结构    ─▶ 必须有 unit test
  ├─ UI 组件 (View)     ─▶ 必须有 layout panic test
  └─ 改了 user-visible 流程 ─▶ ask_user: 要不要补 integration test?
  │
  ▼
是 P0 use case?
  ├─ 是 ─▶ 必须有 integration test
  └─ 否
  │
  ▼
title 加 [WARP-XXXX] 前缀
  │
  ▼
gh pr create --draft (--body-file PR template)
  │
  ▼
加 changelog 条目
  │
  ▼
Co-Authored-By: Warp
  │
  ▼
gh pr ready
  │
  ▼
监控 CI / 处理 review
  │
  ▼
CI 挂了?
  ├─ 是 ─▶ [diagnose-ci-failures]
  └─ 否 ─▶ 等 review
```

值得注意的是"测试要求"这段：bug fix → regression、算法 → unit、UI 组件 → layout panic、P0 → integration。这种 matrix 写在 SKILL.md 里之后，agent 就不会再问"要不要补测试"，而是直接照着判断。

### diagnose-ci-failures：CI 挂了之后

```
[CI 出问题]
  │
  ▼
git branch --show-current
  │
  ▼
当前分支有 PR?
  ├─ 否 ─▶ 告知用户, 提议 [create-pr]
  └─ 是
  │
  ▼
gh pr view --json statusCheckRollup
  │
  ▼
CI 还在跑?
  ├─ 是 ─▶ 报告进度, 建议等完成
  └─ 否
  │
  ▼
有 failed check?
  ├─ 否 ─▶ 全绿, 无需诊断
  └─ 是
  │
  ▼
对每个 failed run: gh run view --log-failed
  │
  ▼
按错误类型分组
  ├─ fmt
  ├─ clippy
  ├─ 编译错 (import / type / signature)
  ├─ test 失败
  └─ 平台特定 (WASM / Linux / macOS / Windows)
  │
  ▼
create_plan          (不直接改代码)
  │
  ▼
plan 引用 [fix-errors] skill
```

这个 skill 有一个非常关键的硬约束：只产出 plan，不直接改代码。理由很朴素——agent 看错日志时改错代码的代价远大于让用户多 review 一份 plan 的代价。

### promote-feature：feature flag 推到下一个 channel

```
[FeatureFlag::X 准备 promote]
  │
  ▼
推到哪个 channel?
  │
  ├─ → Dogfood
  │     └─ features.rs: 加到 DOGFOOD_FLAGS
  │           ─▶ Done
  │
  ├─ Dogfood → Preview
  │     ├─ features.rs: 加到 PREVIEW_FLAGS
  │     └─ features.rs: 从 DOGFOOD_FLAGS 移除
  │        (Preview 自动包含 Dogfood)
  │           ─▶ Done
  │
  └─ → Stable
        ├─ app/Cargo.toml: 加到 default 数组
        ├─ app/src/lib.rs: enabled_features 内加 cfg 桥
        ├─ features.rs: 从 PREVIEW / DOGFOOD_FLAGS 移除
        ├─ cargo fmt &amp;&amp; clippy
        ├─ Linear: 建 follow-up "Remove FeatureFlag::X"
        │              label = tech-debt, priority = Low
        └─ 1-2 release cycle 后
              ─▶ [remove-feature-flag]
```

我特别喜欢这里两个细节：一是 promote 到 Stable 时是把 flag 加到 `default = [...]`，不是把 flag 删掉，让回滚仍然只是一行 PR；二是必须主动建一个 Linear follow-up 提醒后续真正清掉，不让 tech debt 默默积累。

### review-pr：从 diff 到 verdict

````
[pr_diff.txt + pr_description.txt]
  │
  ▼
扫每条 finding, 判断严重度
  ├─ bug / security / crash / data loss     ─▶ 🚨 CRITICAL
  ├─ 逻辑错 / 边界 / missing error handling  ─▶ ⚠️  IMPORTANT
  ├─ 更好的 pattern / 改进                   ─▶ 💡 SUGGESTION
  ├─ nit + 有 ```suggestion``` 替换块        ─▶ 🧹 NIT
  └─ nit 无替换                              ─▶ 丢弃
  │
  ▼
涉及未改动代码?
  ├─ 是 ─▶ 写到 summary, 不写 inline
  └─ 否 ─▶ 写 inline comment
  │
  ▼
PR 是 V0 / 初版?
  ├─ 是 ─▶ robustness 类降为 optional future work
  └─ 否 ─▶ 保持原严重度
  │
  ▼
聚合 + 出 verdict
  │
  ▼
有 CRITICAL?
  ├─ 是 ─▶ Request changes
  └─ 否 ─▶ 只剩 NIT?
          ├─ 是 ─▶ Approve with nits
          └─ 否 ─▶ Approve
  │
  ▼
jq 校验 review.json
````

两个我觉得很值得抄的细节：一是 NIT 必须带 `suggestion` 替换块才允许，否则丢弃，避免 review 满屏"这里这样写更好"但又没说怎么写；二是 V0 实现的 robustness 建议默认降级为 optional future work，避免初版就被一堆 retry/timeout/lifecycle 卡住。

### triage-issue-local：公开仓库的 issue 分发

```
[新 issue]
  │
  ▼
billing / appeals?
  ├─ 是 ─▶ 加 area:billing 或 area:auth
  │        ─▶ 告知用户去 support 渠道, 终止 triage
  └─ 否
  │
  ▼
读 body / 评论 / 附件 / 截图 / 日志
  │
  ▼
已有功能可满足诉求?
  ├─ 是 ─▶ 告知现有功能, 不当 bug 处理
  └─ 否
  │
  ▼
现有证据是否充分?
  ├─ 是 ─▶ 直接定 label
  └─ 否
        │
        ▼
     列出未知项, 数量?
        ├─ &gt; 2 ─▶ 挑最关键的 2 个
        │        (能改变 label / 路由 / 复现确信度)
        └─ ≤ 2 ─▶ 全部问 (但仍不超过 2)
        │
        ▼
     等回答
  │
  ▼
按 surface 选 label
  ├─ 终端 / shell        ─▶ area:shell-terminal
  ├─ 命令行输入          ─▶ area:terminal-input
  ├─ 窗口 / tab / pane   ─▶ area:window-tabs-panes
  ├─ editor / notebook   ─▶ area:editor-notebooks
  ├─ agent / AI          ─▶ area:agent
  ├─ diff / review UI    ─▶ area:code-review
  ├─ MCP                 ─▶ area:mcp
  ├─ settings / 快捷键   ─▶ area:settings-keybindings
  ├─ Drive / 同步        ─▶ area:warp-drive
  └─ CPU/mem/GPU/启动    ─▶ area:performance:*
  │
  ▼
查 STAKEHOLDERS 找 owner
  │
  ▼
输出 triage 结果
```

billing / appeals 这一支特别值得注意——它是一种 hard refusal：直接拦下来 redirect 到官方 support 渠道，而不是当 bug 处理。这种"什么 issue 不该 triage"的规则，靠口头提醒迟早出错，写成 skill 才能一次到位。

follow-up 问题最多 2 个、且必须能"实质改变 label/路由/复现确信度"，这是一个很狠的约束。它防止 agent 像新人 PM 一样问一堆"能否复现/系统版本/截图"，把 issue 拖死。

### warp-integration-test：写一个新集成测试

```
[要写新 integration test]
  │
  ▼
找最接近的现有模块
  │
  ▼
现有模块匹配?
  ├─ 是 ─▶ 在该模块加 test 函数
  └─ 否 ─▶ 新建模块
  │
  ▼
test.rs: 加 mod + pub use
  │
  ▼
bin/integration.rs: register_test!
  │
  ▼
测什么?
  ├─ UI / app behavior ─▶ 加到 ui_tests.rs
  └─ 需跨 shell        ─▶ 加到 shell_integration_tests.rs
  │
  ▼
Builder::new()
  │
  ▼
第 1 步: wait_until_bootstrapped_single_pane_for_tab
  │
  ▼
关心 block 索引?
  ├─ 是 ─▶ clear_blocklist_to_remove_bootstrapped_blocks
  └─ 否
  │
  ▼
用 helper 写 with_step 序列
  │
  ▼
需要真实 display?
  ├─ 是 ─▶ with_real_display + 标记 manual / ignored
  └─ 否 ─▶ 默认 CI
  │
  ▼
┌─▶ cargo run -p integration --bin integration -- name
│   (直接跑, 跳过 nextest)
│     │
│     ▼
│   通过?
│     ├─ 失败, 是环境问题 ─▶ 改成 PreconditionFailed ──┐
│     ├─ 失败, 是 bug    ─▶ 修测试, 不要用 set_retries 掩盖 ──┐
│     └─ 是                                           │     │
└─────────────────────────────────────────────────────┴─────┘
      │
      ▼
cargo nextest run -- name
      │
      ▼
完成
```

这个图最值得看的是"环境问题 vs 真 bug"那个分支：环境抖动用 `PreconditionFailed`，让外层 harness 重试最多 10 次；真 bug 必须修测试本身，不许用 `set_retries` 把它压下去。这种区分往往在团队里要靠老员工 review 的时候纠正，写进 SKILL.md 之后新人和 agent 都能直接上手。

## 一点感想

把流程写下来这件事，听起来没什么含金量。它没有"AI agent"这种词性感，也没有什么 demo 时候能拿出来吹的东西。

但是简单的东西容易落地，warp 这套东西应该要在自己的开发过程中落地也非常容易~

---

## AI 总结

# 开发流程 skill 化

**原文作者**: TechPaper  
**发布时间**: 2026年5月2日 01:31  
**原文链接**: https://mp.weixin.qq.com/s/8X9xBBfjbAudzdUtA_koeA

---

## 核心思想

本文通过分析 Warp 开源项目的 `.claude/skills/` 目录结构，提出了一套将团队开发流程"skill 化"的方法论。核心观点是：团队真正值钱的东西不在代码里，而在产生代码的流程中；这些流程不应只停留在老员工的脑子里或过时的 wiki 里，而应该写成可被 AI agent 加载的、有触发条件的、能彼此引用的结构化文件——即 skill。

---

## 我的理解

这篇文章的价值不在于介绍了一套新工具，而在于重新思考了"流程"的载体和形式。传统流程文档是给人看的，往往模糊、易过期、难以执行；而 skill 化的流程是给 agent 看的（同时人也能看懂），它精确、可执行、有明确的触发条件。这种转变本质上是把隐性知识显性化的过程，也是把"部落习俗"变成工程规范的过程。

Warp 这套做法的精妙之处在于它的"简陋"——大部分 skill 只是纯 markdown，没有复杂的 runtime 依赖。这种简单性恰恰是它最容易落地的原因。先有流程沉淀，再有工具支撑，而不是反过来。

---

## 主要内容

### Warp 的 skill 结构

一个 skill 就是一个文件夹，包含一个 `SKILL.md` 文件，格式如下：

- **YAML frontmatter**: `name` + `description`
- **正文**: 给 agent 看的操作说明

其中 `description` 是最关键的设计——它同时回答两个问题：

1. 这个 skill 是干嘛的
2. 什么情况下应该用它

大多数 skill 是纯 markdown，只有少数带脚本（如 `resolve-merge-conflicts`）。

### PRODUCT.md + TECH.md 分离

Warp 把设计文档拆成两份：

- **PRODUCT.md**: 只写从用户角度看到的东西，不写实现细节
- **TECH.md**: 写实现细节、数据结构、模块边界

关键设计：

- PRODUCT.md 明确禁止写 Validation 章节
- 实现偏离 spec 时，要同 PR 内更新文档
- 文档是 living documentation，不是审批材料

### 总控 + 阶段架构

skill 多了之后采用分层结构：

- **总控 skill**（如 `spec-driven-implementation`）：判断流程走向
- **阶段 skill**：各自负责一段（写 PRODUCT、写 TECH、开 PR 等）

判断标准非常具体："1k+ LOC"、"跨模块"、"行为有歧义"，而不是模糊的"重要功能"。

### 通用规则与本地规则分离

- `review-pr`: 通用流程
- `review-pr-local`: 本仓库特有的规矩

这种分层避免了通用流程被各种特例塞爆，通用部分可在多仓库复用，本地差异各自维护。

### 何时上脚本的判断标准

1. 只是流程约定 → markdown 就够了
2. 需要重复跑命令 → 把命令写在 markdown 里
3. 需要从大输出里抽结构化信息 → 写脚本
4. 需要长时间运行、调度 → 考虑 harness

不要一上来就搞 harness。先把流程写明白。

---

## 我的理解

这里体现了一个重要原则：简单的东西容易落地。很多团队在试图用复杂工具解决流程问题，但往往工具本身又成了新问题。Warp 的做法是先把流程用最简单的形式（markdown）固化下来，让 agent 和新人都能照着执行，然后再看哪些环节真的需要工具支撑。

description 字段的设计非常巧妙——它不是给人读的"标题"，而是给 agent 读的"触发条件"。这种设计让 agent 能在大量 skills 中快速找到当前需要的那一个，同时也强迫写 skill 的人思考"什么时候用"这个问题，而不是只写"怎么做"。

PRODUCT.md 和 TECH.md 的分离，本质上是关注点分离的体现。产品文档只关心"用户看到什么"，技术文档只关心"怎么实现"。这种分离让两类读者（产品经理和工程师）都能看懂自己需要的部分，避免了文档变成"只有写的人痛苦，读的人不懂"的仪式。

---

## 总结

Warp 的 skill 化流程体系提供了一个可复制的模板：

1. **简单性优先**: 纯 markdown 为主，脚本为辅
2. **明确的触发条件**: description 字段同时说明"做什么"和"什么时候用"
3. **文档分离**: PRODUCT.md 与 TECH.md 各司其职
4. **分层架构**: 总控 + 阶段 skill
5. **通用与本地分离**: 避免特例污染通用流程
6. **living documentation**: 文档与代码同 PR 合并

这套体系的核心价值在于：把团队的隐性知识（老员工脑子里的习俗）变成显性知识（可执行的 skill），让新人、新同事、AI agent 都能快速上手。

---

## 我的扩展总结

### 设计思路的深度解读

Warp 这套 skill 体系的设计思路可以从几个层面体现了工程智慧：

1. **从"给人写的文档"到"给 agent 的可执行文件"的转变
   - 传统文档：描述性的、模糊的、需要人判断
   - Skill：指令性的、精确的、有明确输入输出
   - 但 skill 仍然是人能看懂的 markdown，不是黑盒

2. **渐进式工具化**
   - 先有流程沉淀（markdown）
   - 再看哪些环节真的需要脚本
   - 最后才考虑 harness
   - 这个顺序不能反过来

3. **关注点分离**
   - 总控与阶段分离
   - 通用与本地分离
   - 产品与技术分离
   - 这种分离让每个部分都简单到可维护

### 与其他概念的联系

这套 skill 体系让我想到几个相关概念：

1. **与"基础设施即代码"的联系**
   - Skill 可以看作是"流程即代码"
   - 都是把以前人工操作的东西变成可版本控制、可重复执行的文件

2. **与 prompt engineering 的区别**
   - 很多团队搞 prompt engineering 是写一个超大的 system prompt
   - Warp 是拆成小的、有明确触发条件的 skill
   - 这和代码的模块化是一个道理

3. **与 SOP（标准作业程序）的联系**
   - Skill 是带触发条件的 SOP
   - 不仅写"怎么做"，还写"什么时候做"
   - 而且可以被 agent 自动加载执行

### 局限性的思考

这套体系也有它的适用边界：

1. **适合已经有相对稳定流程的团队**
   - 如果团队还在探索阶段，流程本身就在变，skill 化可能反而束缚手脚
   - 先有流程沉淀，再 skill 化

2. **适合有一定规模的团队**
   - 小团队可能不需要这么重的体系
   - 但可以先从最小集合开始，随着团队成长逐步增加

3. **需要团队有写 skill 的能力和习惯**
   - 不是所有工程师都能把流程写得清晰、可执行
   - 需要有人专门维护这套体系

### 未来方向的展望

Skill 化流程可能的发展方向：

1. **Skill 市场**
   - 团队可以共享通用的 skill
   - 类似 npm，但更侧重流程

2. \*\*Skill 验证工具链
   - 自动验证 skill 的完整性
   - 自动生成 skill 的决策图
   - Skill 的版本管理

3. \*\*多 Agent 协作
   - 不同的 skill 可以由不同的 specialized agent 执行
   - 形成一个 agent 团队

### 我们可以怎么做

对于想在自己团队落地，可以从这个最小集合开始：

```
.claude/skills/
  feature-workflow/SKILL.md          # 总控
  write-product-plan/SKILL.md        # 写产品行为
  write-tech-plan/SKILL.md         # 写技术方案
  implement-plan/SKILL.md          # 按 spec 实现
  verify-change/SKILL.md         # 跑测试、自审 diff
  create-pr/SKILL.md               # 开 PR
  diagnose-ci/SKILL.md           # CI 挂了怎么排
  review-pr-local/SKILL.md         # 本仓库的 review 规则
```

每个 SKILL.md 至少要回答：

- 什么情况下用？（写在 description 里）
- 输入是什么？
- 输出是什么？
- 必须做哪些步骤？
- 失败之后跳到哪个 skill？

关键是：\*\*先从一两个最痛的环节开始，不要试图一次性把所有流程都 skill 化。比如先从 `create-pr` 和 `diagnose-ci` 这两个高频场景开始，让团队看到价值，再逐步扩展。

---

\*本文档基于 Warp 开源项目的 skill 体系分析整理，并加入了扩展理解。
