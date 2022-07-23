import { defineConfig } from "vite";
const env = process.env.NODE_ENV === "development" ? "" : "/blog"

export default defineConfig({
  base: env,
});
