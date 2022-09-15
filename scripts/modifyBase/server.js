const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../.vitepress/config.js");
const buildPath = path.join(__dirname, "../../.vitepress/build/index.js");
const configData = fs.readFileSync(configPath, "utf-8");
const buildData = fs.readFileSync(buildPath, "utf-8");

fs.writeFileSync(configPath, configData.replace('const env = "/blog"', 'const env = ""'));
fs.writeFileSync(buildPath, buildData.replace('export const base =  "/blog"', 'export const base = ""'));

