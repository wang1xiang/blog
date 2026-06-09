import { type CollectionEntry, render } from "astro:content";
import { getSortedPosts } from "@/utils/content-utils";

/**
 * 取首页 Featured 卡片要展示的文章。
 * 优先级：最新的 pinned 文章 > 最新一篇文章。
 * getSortedPosts() 已把 pinned 排在最前、其余按发布时间倒序，
 * 所以直接取第一篇即可同时满足两种情况。
 * @returns 文章对象；当站点没有任何文章时返回 undefined。
 */
export async function getFeaturedPost(): Promise<
  CollectionEntry<"posts"> | undefined
> {
  const sorted = await getSortedPosts();
  return sorted[0];
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
