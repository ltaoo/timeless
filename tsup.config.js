import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["domains/index.ts"],
  format: ["iife"],
  target: ["es2015"],
  outDir: "dist",
  name: "Timeless",
  globalName: "Timeless",
  sourcemap: true,
  clean: true,
  platform: "browser",
  dts: false,
  external: ["mitt", "qs", "dayjs", "dayjs/locale/zh-cn", "dayjs/plugin/relativeTime", "tailwind-merge", "url-parse"],
  injectStyle: false,
});
