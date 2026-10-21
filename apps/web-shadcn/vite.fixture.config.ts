import { resolve } from "node:path";
import { defineConfig } from "vite";
import { timelessNativeStyles } from "@timeless/inner-vite-plugin";

export default defineConfig({
  publicDir: false,
  define: {
    __TIMELESS_PLATFORM__: JSON.stringify("macOS host regression fixture"),
  },
  plugins: [timelessNativeStyles()],
  build: {
    outDir: "build/fixtures/gallery",
    modulePreload: false,
    rollupOptions: {
      input: resolve(__dirname, "tests/fixtures/legacy-gallery/index.html"),
      output: {
        format: "iife",
        entryFileNames: "app.js",
        inlineDynamicImports: true,
      },
    },
  },
});
