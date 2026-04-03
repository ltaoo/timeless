import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@timeless/timeless": path.resolve(
        __dirname,
        "../../packages/timeless/dist/index.esm.js",
      ),
      "@timeless/timeless-canvas": path.resolve(
        __dirname,
        "../../packages/timeless-canvas/dist/timeless.canvas.esm.js",
      ),
    },
  },
});
