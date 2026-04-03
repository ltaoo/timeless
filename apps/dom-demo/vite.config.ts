import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@timeless/timeless": path.resolve(
        __dirname,
        "../../packages/timeless/dist/index.esm.js",
      ),
      "@timeless/timeless-dom": path.resolve(
        __dirname,
        "../../packages/timeless-dom/dist/timeless.dom.esm.js",
      ),
    },
  },
});
