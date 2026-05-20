import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const BACKUP_DIR = "/Users/xiangwang/.claude/jobs/2f88b569/blog-backup/docs";
const NEW_POSTS_DIR = path.resolve(__dirname, "../src/content/posts");

// 需要迁移的目录
const CATEGORIES = [
  "css",
  "docker",
  "electron",
  "flutter",
  "git",
  "http",
  "javascript",
  "leetcode",
  "linux",
  "mobile",
  "nest",
  "node",
  "photography",
  "pnpm",
  "prosemirror",
  "react",
  "reactNative",
  "taro",
  "tiptap",
  "tool",
  "vite",
  "vscode",
  "vue",
  "webrtc",
  "wechat",
  "work",
];

// 迁移单个文件
function migrateFile(filePath, category) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data: oldFrontmatter, content: markdownContent } = matter(content);

  // 转换 frontmatter
  const newFrontmatter = {
    title: oldFrontmatter.title || path.basename(filePath, ".md"),
    published: oldFrontmatter.date ? new Date(oldFrontmatter.date) : new Date(),
    description: oldFrontmatter.describe || "",
    tags: oldFrontmatter.tags || [],
    category: category,
    author: "翔子",
  };

  // 生成新的文件名
  const baseName = path.basename(filePath, ".md");
  let newFileName = baseName;

  // 如果文件名包含日期，提取出来作为发布日期
  const dateMatch = baseName.match(/^(\d{4}-\d{1,2}-\d{1,2})-(.*)$/);
  if (dateMatch && !oldFrontmatter.date) {
    newFrontmatter.published = new Date(dateMatch[1]);
    newFileName = dateMatch[2];
  }

  // 确保文件名以 .md 结尾
  if (!newFileName.endsWith(".md")) {
    newFileName = newFileName + ".md";
  }

  // 创建新的 frontmatter 和内容
  const newFileContent = matter.stringify(markdownContent, newFrontmatter);

  return {
    newFileName,
    newFileContent,
  };
}

// 迁移目录
async function migrateDirectory(dirName) {
  const dirPath = path.join(BACKUP_DIR, dirName);

  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirName}`);
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const migratedFiles = [];

  for (const file of files) {
    if (file === ".DS_Store" || file === "images") {
      continue;
    }

    const filePath = path.join(dirPath, file);

    // 跳过目录，只处理文件
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      continue;
    }

    try {
      const { newFileName, newFileContent } = migrateFile(filePath, dirName);
      migratedFiles.push({
        originalPath: filePath,
        newFileName,
        newFileContent,
      });
    } catch (error) {
      console.error(`Failed to migrate ${filePath}:`, error);
    }
  }

  return migratedFiles;
}

// 主函数
async function main() {
  console.log("Starting migration...");
  console.log(`Backup directory: ${BACKUP_DIR}`);
  console.log(`New posts directory: ${NEW_POSTS_DIR}`);

  let totalMigrated = 0;
  let totalSkipped = 0;

  for (const category of CATEGORIES) {
    console.log(`\nMigrating category: ${category}`);
    const migratedFiles = await migrateDirectory(category);

    for (const { newFileName, newFileContent } of migratedFiles) {
      const newFilePath = path.join(NEW_POSTS_DIR, newFileName);

      // 避免文件名冲突
      let finalPath = newFilePath;
      let counter = 1;
      while (fs.existsSync(finalPath)) {
        const ext = path.extname(newFileName);
        const base = path.basename(newFileName, ext);
        finalPath = path.join(NEW_POSTS_DIR, `${base}-${counter}${ext}`);
        counter++;
      }

      fs.writeFileSync(finalPath, newFileContent);
      console.log(`  - ${path.basename(finalPath)}`);
      totalMigrated++;
    }
  }

  console.log(`\nMigration completed!`);
  console.log(`  - Total migrated: ${totalMigrated}`);
  console.log(`  - Total skipped: ${totalSkipped}`);
}

main().catch(console.error);
