import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const POSTS_DIR = "src/content/posts";
let fixedCount = 0;

function fixFile(filePath) {
  let content = readFileSync(filePath, "utf-8");
  const dir = dirname(filePath);
  const regex = /(!\[([^\]]*)\]\(\.\/([^)]+)\))/g;
  const matches = [...content.matchAll(regex)];
  let newContent = content;

  for (const [fullMatch, , alt, imgPath] of matches) {
    const fullPath = join(dir, imgPath);
    if (!existsSync(fullPath)) {
      const replacement = `<!-- ${imgPath} 原图已丢失 -->`;
      newContent = newContent.replace(fullMatch, replacement);
      fixedCount++;
    }
  }

  if (newContent !== content) {
    writeFileSync(filePath, newContent, "utf-8");
  }
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".md")) {
      fixFile(fullPath);
    }
  }
}

walk(POSTS_DIR);
console.log(`Fixed ${fixedCount} missing image references`);
