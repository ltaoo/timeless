import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    // alias: {
    //   "@timeless/reactive": path.resolve(
    //     __dirname,
    //     "../../packages/reactive/dist/timeless.reactive.esm.js",
    //   ),
    //   "@timeless/ui-vm": path.resolve(
    //     __dirname,
    //     "../../packages/ui-vm/dist/index.esm.js",
    //   ),
    //   "@timeless/icons": path.resolve(
    //     __dirname,
    //     "../../packages/icons/dist/index.js",
    //   ),
    //   "@timeless/timeless": path.resolve(
    //     __dirname,
    //     "../../packages/timeless/dist/index.esm.js",
    //   ),
    //   "@timeless/timeless-dom": path.resolve(
    //     __dirname,
    //     "../../packages/timeless-dom/dist/timeless.dom.esm.js",
    //   ),
    //   "@timeless/kit": path.resolve(
    //     __dirname,
    //     "../../packages/kit/dist/timeless.kit.esm.js",
    //   ),
    // },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  ssr: {
    noExternal: [
      "@timeless/shadcn",
      "@timeless/reactive",
      "@timeless/ui-vm",
      "@timeless/icons",
      "@timeless/kit",
      "@timeless/timeless",
      "@timeless/timeless-dom",
    ],
  },
});
