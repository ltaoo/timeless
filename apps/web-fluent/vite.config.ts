import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    postcss: { plugins: [] },
  },
});
