import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./components"),
      "@": path.resolve(__dirname, "./"),
      "@timeless/provider-web": path.resolve(__dirname, "../../packages/provider-web/src/index.ts"),
      "~": path.resolve(__dirname, "./"),
    },
  },
});
