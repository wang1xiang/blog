import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join, basename, dirname, relative } from "node:path";
import matter from "gray-matter";

const OLD_DOCS = "/Users/xiangwang/.claude/jobs/2f88b569/blog-backup/docs";
const NEW_POSTS = "src/content/posts";
const REPORT_PATH = "migration-report.csv";

const CATEGORY_MAP = {
  leetcode: "算法",
  work: "工作",
  vue: "前端框架",
  react: "前端框架",
  reactNative: "前端框架",
  taro: "前端框架",
  flutter: "前端框架",
  vite: "前端工程",
  pnpm: "前端工程",
  electron: "前端工程",
  nest: "前端工程",
  node: "前端工程",
  tiptap: "编辑器",
  prosemirror: "编辑器",
  vscode: "编辑器",
  javascript: "语言基础",
  css: "语言基础",
  http: "语言基础",
  docker: "DevOps",
  git: "DevOps",
  linux: "DevOps",
  tool: "工具",
  wechat: "工具",
  mobile: "工具",
  webrtc: "其他",
  photography: "其他",
};

function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return String(dateStr);
  return parts.map((p) => p.padStart(2, "0")).join("-");
}

function collectMdFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "images") continue;
      results.push(...collectMdFiles(fullPath));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

function migratePost(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const relativePath = relative(OLD_DOCS, filePath);
  const dirName = relativePath.split("/")[0];
  const category = CATEGORY_MAP[dirName] || "其他";

  const tags = Array.isArray(data.tags)
    ? data.tags
    : data.tags
      ? [data.tags]
      : [dirName];

  const newData = {
    title: data.title || basename(filePath, ".md"),
    published: normalizeDate(data.date),
    description: data.describe || data.description || "",
    tags,
    category,
    image: "api",
    draft: false,
  };

  const slug = basename(filePath, ".md").replace(/\.mdx$/, "");
  const targetDir = join(NEW_POSTS, category, slug);
  const targetPath = join(targetDir, "index.md");

  // Copy images from source dir/images/ to target dir
  const sourceImagesDir = join(dirname(filePath), "images");
  let imagesMigrated = false;
  if (existsSync(sourceImagesDir)) {
    mkdirSync(targetDir, { recursive: true });
    // Copy individual image files into the article's directory
    const imageFiles = readdirSync(sourceImagesDir);
    for (const img of imageFiles) {
      const srcImg = join(sourceImagesDir, img);
      const stat = (() => {
        try {
          return readdirSync(srcImg);
        } catch {
          return null;
        }
      })();
      // Skip subdirectories, only copy files
      if (!stat) {
        cpSync(srcImg, join(targetDir, img));
      }
    }
    imagesMigrated = true;
  }

  // Replace image paths: ./images/xxx.png → ./xxx.png
  let processedContent = content;
  if (imagesMigrated) {
    processedContent = processedContent.replace(/\.\/images\//g, "./");
    processedContent = processedContent.replace(
      /(?<!\.\/)images\//g,
      "./"
    );
  }

  // Build frontmatter manually to control format
  const fmLines = ["---"];
  fmLines.push(`title: ${JSON.stringify(newData.title)}`);
  fmLines.push(`published: ${newData.published}`);
  fmLines.push(`description: ${JSON.stringify(newData.description)}`);
  fmLines.push(`tags: [${newData.tags.map((t) => JSON.stringify(t)).join(", ")}]`);
  fmLines.push(`category: ${JSON.stringify(newData.category)}`);
  fmLines.push(`image: api`);
  fmLines.push(`draft: false`);
  fmLines.push("---");

  const finalContent = fmLines.join("\n") + "\n" + processedContent;

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(targetPath, finalContent, "utf-8");

  return {
    source: relativePath,
    target: relative(NEW_POSTS, targetPath),
    category,
    imagesMigrated,
    status: "success",
  };
}

function main() {
  const files = collectMdFiles(OLD_DOCS);
  console.log(`Found ${files.length} markdown files`);

  // Ensure category directories exist
  const categories = [...new Set(Object.values(CATEGORY_MAP))];
  for (const cat of categories) {
    mkdirSync(join(NEW_POSTS, cat), { recursive: true });
  }

  const results = [];
  for (const file of files) {
    try {
      const result = migratePost(file);
      results.push(result);
    } catch (err) {
      results.push({
        source: relative(OLD_DOCS, file),
        target: "FAILED",
        category: "",
        imagesMigrated: false,
        status: `error: ${err.message}`,
      });
    }
  }

  // Generate report
  const csvHeader = "source,target,category,imagesMigrated,status";
  const csvRows = results.map(
    (r) =>
      `${r.source},${r.target},${r.category},${r.imagesMigrated},${r.status}`
  );
  writeFileSync(REPORT_PATH, [csvHeader, ...csvRows].join("\n"), "utf-8");

  const success = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;
  console.log(`\nMigration complete: ${success} success, ${failed} failed`);
  console.log(`Report saved to ${REPORT_PATH}`);

  // Category stats
  const catStats = {};
  for (const r of results) {
    if (r.status === "success") {
      catStats[r.category] = (catStats[r.category] || 0) + 1;
    }
  }
  console.log("\nCategory stats:");
  for (const [cat, count] of Object.entries(catStats).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
