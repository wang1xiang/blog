const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../.vitepress/config.js");
const buildPath = path.join(__dirname, "../../.vitepress/build/index.js");
const configData = fs.readFileSync(configPath, "utf-8");
const buildData = fs.readFileSync(buildPath, "utf-8");

fs.writeFileSync(configPath, configData.replace('const env = ""', 'const env = "/blog"'));
fs.writeFileSync(buildPath, buildData.replace('export const base = ""', 'export const base =  "/blog"'));

