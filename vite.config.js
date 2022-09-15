import { defineConfig } from "vite";
const env = process.env.APP_ENVKEY === "server" || process.env.NODE_ENV === "development" ? "" : "/blog"

export default defineConfig({
  base: env,
});
