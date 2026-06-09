<script lang="ts">
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

type Filter = "all" | "frontend" | "ai" | "backend" | "essay";

let keyword = "";
let results: SearchResult[] = [];
let isSearching = false;
let initialized = false;
let activeFilter: Filter = "all";

const chips: Array<{ key: Filter; label: string; terms: string[] }> = [
	{ key: "all", label: "全部", terms: [] },
	{ key: "frontend", label: "前端", terms: ["前端", "Vue", "React", "CSS", "Vite", "TypeScript"] },
	{ key: "ai", label: "AI 工作流", terms: ["AI", "Claude", "Cursor", "自动化", "工作流"] },
	{ key: "backend", label: "Node.js", terms: ["Node", "后端", "Express", "Koa"] },
	{ key: "essay", label: "随笔", terms: ["随笔", "生活", "博客", "思考"] },
];

const fakeResult: SearchResult[] = [
	{
		url: "/",
		meta: { title: "开发模式搜索结果" },
		excerpt: "Pagefind 只在 build 后工作。dev 模式下这里显示一条模拟结果。",
	},
];

function getInitialKeyword(): string {
	if (typeof window === "undefined") return "";
	const params = new URLSearchParams(window.location.search);
	return params.get("q") || "";
}

function stripHtml(value: string): string {
	return value.replace(/<[^>]*>/g, "");
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function sanitizePagefindHtml(value: string): string {
	return escapeHtml(value)
		.replace(/&lt;mark&gt;/g, "<mark>")
		.replace(/&lt;\/mark&gt;/g, "</mark>");
}

function resultText(result: SearchResult): string {
	return `${stripHtml(result.meta.title || "")} ${stripHtml(result.excerpt || "")}`.toLowerCase();
}

function passesFilter(result: SearchResult): boolean {
	if (activeFilter === "all") return true;
	const chip = chips.find((c) => c.key === activeFilter);
	if (!chip) return true;
	const text = resultText(result);
	return chip.terms.some((term) => text.includes(term.toLowerCase()));
}

$: visibleResults = results.filter(passesFilter);
$: searchMeta = keyword.trim()
	? `${visibleResults.length} 个结果 · 关键词 “${keyword.trim()}”`
	: `${visibleResults.length} 个结果`;

async function search() {
	if (!initialized || !keyword.trim()) {
		results = [];
		return;
	}
	isSearching = true;
	try {
		if (import.meta.env.PROD && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			results = await Promise.all(response.results.map((item) => item.data()));
		} else if (import.meta.env.DEV) {
			// dev 模式没有 Pagefind 索引，任意关键词都返回模拟结果，避免误判搜索坏了
			results = fakeResult;
		} else {
			// 生产构建中 Pagefind 可能还没加载完成；等待 pagefindready 后会自动重搜
			results = [];
		}
	} catch (error) {
		console.error("Search error:", error);
		results = [];
	} finally {
		isSearching = false;
	}
}

let debounceTimer: ReturnType<typeof setTimeout>;
function handleInput() {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(search, 250);
}

function focusSearch() {
	const input = document.getElementById("home-search-input") as HTMLInputElement | null;
	input?.focus({ preventScroll: true });
	input?.select();
}

onMount(() => {
	const initialize = async () => {
		initialized = true;
		keyword = getInitialKeyword();
		if (keyword.trim()) await search();
	};

	if (import.meta.env.DEV) {
		initialize();
	} else if (window.pagefind) {
		initialize();
	} else {
		document.addEventListener("pagefindready", initialize, { once: true });
		document.addEventListener("pagefindready", () => {
			if (keyword.trim()) search();
		});
	}

	const onKeyDown = (event: KeyboardEvent) => {
		const target = event.target as HTMLElement | null;
		const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
			event.preventDefault();
			focusSearch();
		}
		if (!typing && event.key === "/") {
			event.preventDefault();
			focusSearch();
		}
		if (event.key === "Escape" && document.activeElement?.id === "home-search-input") {
			keyword = "";
			results = [];
			(document.activeElement as HTMLInputElement).blur();
		}
	};
	document.addEventListener("keydown", onKeyDown);
	return () => document.removeEventListener("keydown", onKeyDown);
});
</script>

<header class="search-header">
	<div class="search-breadcrumb"><a href="/">首页</a> / 搜索</div>
	<h1 class="search-title">更快找到<span class="accent">那篇文章</span>。</h1>
</header>

<main class="search-shell">
	<section class="search-panel" aria-label="博客搜索">
		<div class="search-box">
			<div class="search-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
			</div>
			<input
				class="search-input"
				id="home-search-input"
				type="search"
				placeholder="搜 React、AI 工作流、Vite…"
				autocomplete="off"
				bind:value={keyword}
				on:input={handleInput}
			/>
			<span class="kbd">⌘K / Ctrl K</span>
		</div>
		<div class="search-control-row">
			<div class="search-chips" role="list" aria-label="筛选分类">
				{#each chips as chip}
					<button class:active={activeFilter === chip.key} class="search-chip" type="button" on:click={() => (activeFilter = chip.key)}>{chip.label}</button>
				{/each}
			</div>
			<div class="search-meta">{searchMeta}</div>
		</div>
	</section>

	<div class="search-content-grid">
		<section aria-label="搜索结果">
			<div class="result-toolbar">
				<div class="result-heading">{keyword || activeFilter !== "all" ? "搜索结果" : "输入关键词开始搜索"}</div>
			</div>

			<div class="result-list">
				{#if isSearching}
					<div class="search-empty-state show">
						<div class="empty-title">搜索中…</div>
						<p class="empty-copy">正在从本地索引里查找。</p>
					</div>
				{:else if visibleResults.length > 0}
					{#each visibleResults as result}
						<article class="result-card">
							<div class="result-date"><span class="result-type">文章</span></div>
							<div>
								<a class="result-title" href={result.url} data-no-swup>{@html sanitizePagefindHtml(result.meta.title || "")}</a>
								<p class="result-desc">{@html sanitizePagefindHtml(result.excerpt || "")}</p>
							</div>
						</article>
					{/each}
				{:else if keyword}
					<div class="search-empty-state show">
						<div class="empty-title">没有匹配结果</div>
						<p class="empty-copy">换一个关键词，或从右侧热门标签进入。</p>
					</div>
				{:else}
					<div class="search-empty-state show">
						<div class="empty-title">输入关键词开始搜索</div>
						<p class="empty-copy">支持标题、摘要和正文内容检索。</p>
					</div>
				{/if}
			</div>
		</section>

		<aside class="search-side-panel" aria-label="搜索辅助信息">
			<section class="search-side-card search-tip-card">
				<h2 class="search-side-title">搜索提示</h2>
				<p class="search-tip-copy">支持标题、摘要、正文混合检索。按 <kbd>/</kbd> 或 <kbd>⌘K</kbd> 可快速聚焦输入框。</p>
			</section>
			<section class="search-side-card">
				<h2 class="search-side-title">快捷搜索</h2>
				<div class="search-hot-list">
					{#each ["Vue", "React", "AI 工作流", "Node.js", "Vite"] as q}
						<button class="search-hot-item" type="button" on:click={() => { keyword = q; search(); }}><span>{q}</span></button>
					{/each}
				</div>
			</section>
		</aside>
	</div>
</main>
