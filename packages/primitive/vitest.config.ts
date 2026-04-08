import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@timeless/reactive": resolve(__dirname, "../reactive/src/index.ts"),
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
  },
});
