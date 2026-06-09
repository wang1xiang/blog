import { type CollectionEntry, render } from "astro:content";
import { getSortedPosts } from "@/utils/content-utils";

/**
 * 取最新一篇 pinned=true 的文章。
 * getSortedPosts() 已经把 pinned 文章排在前面，所以遍历到第一个 pinned 就是目标。
 * @returns 最新的置顶文章，或 undefined（无任何置顶文章时）
 */
export async function getFeaturedPost(): Promise<
	CollectionEntry<"posts"> | undefined
> {
	const sorted = await getSortedPosts();
	return sorted.find((p) => p.data.pinned === true);
}

/**
 * 获取一篇文章的阅读时长 / 字数 meta，来自 remark-reading-time plugin。
 * 仅用于 HomeFeatured（只调用一次，性能可接受）。
 */
export async function getFeaturedPostMeta(
	post: CollectionEntry<"posts">,
): Promise<{ minutes: number; words: number }> {
	const { remarkPluginFrontmatter } = await render(post);
	return {
		minutes: remarkPluginFrontmatter.minutes ?? 0,
		words: remarkPluginFrontmatter.words ?? 0,
	};
}
