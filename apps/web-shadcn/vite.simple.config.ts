import { resolve } from "node:path";
import { defineConfig } from "vite";
import { timelessWebStyles } from "@timeless/inner-vite-plugin";

export default defineConfig({
  base: "./",
  publicDir: false,
  css: { postcss: { plugins: [] } },
  plugins: [
    timelessWebStyles({
      html: resolve(__dirname, "index.simple.html"),
      native: false,
    }),
  ],
  build: {
    outDir: "dist/simple",
    rollupOptions: { input: resolve(__dirname, "index.simple.html") },
  },
});
