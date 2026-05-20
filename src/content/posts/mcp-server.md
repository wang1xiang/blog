---
title: mcp-server
published: 2025-06-03T16:00:00.000Z
description: mcp-server
tags:
  - tool
category: tool
author: 翔子
---

1. 安装 python 环境 `python3 --version` 验证
2. 安装[uv](https://github.com/astral-sh/uv)

   ```shell
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

   通过 `uvx --version` 验证

3. 安装完成以后，MCP 配置如下。这里的 uvx 就类似于 npx 可以从命令行执行一个 python 包

   ```json
   {
     "mcpServers": {
       "fetch": {
         "command": "uvx",
         "args": ["mcp-server-fetch"]
       }
     }
   }
   ```

4. 配置[Trae 智能体](https://docs.trae.ai/ide/agent)

## 使用工具

### [mcp-server-fetch](https://github.com/trae-ai/mcp-server-fetch)

### [browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp)

让 AI 能够监控浏览器行为，抓取日志、网络请求、截图，辅助调试和交互

功能：

- 捕获浏览器日志：抓取浏览器控制台日志，帮助调试和分析
- 抓取网络请求：抓取浏览器中的网络请求，帮助调试和优化性能
- 截图：抓取浏览器中的页面截图，帮助调试和分析

#### 安装

拉取 代码，安装浏览起插件

```shell
git clone https://github.com/AgentDeskAI/browser-tools-mcp.git
```

安装并运行浏览器工具服务器

```shell
npx @agentdeskai/browser-tools-server@1.2.0
```

打开浏览器 F12，找到 BrowserToolMCP

```text
对于我们现在的网站，你有什么分析吗
帮我看看这个账号的所有你能看到的信息，并进行总结。
帮我看看这个网页上都说了什么，截个图，并总结一下。
帮我翻译下这个网页，并进行总结。
帮我看看它这个图片生成请求是怎么发的？
帮我看看页面刷新时候，token会不会变？
这个网页加载好慢，帮我看看怎么回事？
帮我看看是不是有BUG，我的余额怎么不会涨（最后这个开玩笑，不用试 = = ）
```

### [Firecrawl](https://www.firecrawl.dev/)

网页抓取能力

- firecrawl_scrape：抓取指定网页的主要内容，支持提取文本、HTML、Markdown 等格式。
- firecrawl_map：生成指定网站的结构地图，可用于了解页面间链接关系，常用于网站结构分析。
- firecrawl_crawl：执行多层级网页爬取任务，可发现并递归抓取内部链接，实现深度爬取。
- firecrawl_check_crawl_status：查询当前爬取任务的状态，包括进度、成功/失败记录等。
- firecrawl_search：支持在搜索引擎上发起查询请求，并抓取结果页面内容。
- firecrawl_extract：使用大模型能力从页面中抽取结构化数据，如产品信息、联系人、文章摘要等。
- firecrawl_deep_research：针对某一主题执行深度搜索与多页面整合分析，适用于研究与情报收集。
- firecrawl_generate_llmstxt：将爬取内容自动转换为适合 LLM 使用的 prompt 格式文本（如：摘要、指令式文本等），便于 AI 模型消费。
