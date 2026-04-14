import { defineConfig } from "vite";
import path from "node:path";

const shadcnSrc = path.resolve(__dirname, "../../packages/shadcn/src");

export default defineConfig({
  resolve: {
    alias: {
      // Use built packages for SSR
      "@timeless/reactive": path.resolve(
        __dirname,
        "../../packages/reactive/dist/timeless.reactive.esm.js",
      ),
      "@timeless/ui-vm": path.resolve(
        __dirname,
        "../../packages/ui-vm/dist/index.esm.js",
      ),
      "@timeless/icons": path.resolve(
        __dirname,
        "../../packages/icons/dist/index.esm.js",
      ),
      "@timeless/timeless": path.resolve(
        __dirname,
        "../../packages/timeless/dist/index.esm.js",
      ),
      "@timeless/timeless-dom": path.resolve(
        __dirname,
        "../../packages/timeless-dom/dist/timeless.dom.esm.js",
      ),
      // Map shadcn module paths
      "@timeless/shadcn/src/modules/button": path.join(
        shadcnSrc,
        "modules/button.ts",
      ),
      "@timeless/shadcn/src/modules/input": path.join(
        shadcnSrc,
        "modules/input.ts",
      ),
      "@timeless/shadcn/src/modules/checkbox": path.join(
        shadcnSrc,
        "modules/checkbox.ts",
      ),
      "@timeless/shadcn/src/modules/switch": path.join(
        shadcnSrc,
        "modules/switch.ts",
      ),
      "@timeless/shadcn/src/modules/badge": path.join(
        shadcnSrc,
        "modules/badge.ts",
      ),
      "@timeless/shadcn/src/modules/card": path.join(
        shadcnSrc,
        "modules/card.ts",
      ),
      "@timeless/shadcn/src/modules/progress": path.join(
        shadcnSrc,
        "modules/progress.ts",
      ),
      "@timeless/shadcn/src/modules/tabs": path.join(
        shadcnSrc,
        "modules/tabs.ts",
      ),
      "@timeless/shadcn/src/modules/select": path.join(
        shadcnSrc,
        "modules/select.ts",
      ),
      "@timeless/shadcn/src/modules/dialog": path.join(
        shadcnSrc,
        "modules/dialog.ts",
      ),
      "@timeless/shadcn/src/modules/alert": path.join(
        shadcnSrc,
        "modules/alert.ts",
      ),
      "@timeless/shadcn/src/modules/separator": path.join(
        shadcnSrc,
        "modules/separator.ts",
      ),
      "@timeless/shadcn/src/modules/label": path.join(
        shadcnSrc,
        "modules/label.ts",
      ),
      "@timeless/shadcn/src/modules/slider": path.join(
        shadcnSrc,
        "modules/slider.ts",
      ),
      "@timeless/shadcn/src/modules/toggle": path.join(
        shadcnSrc,
        "modules/toggle.ts",
      ),
      // Main shadcn entry (but we avoid importing it directly)
      "@timeless/shadcn": path.resolve(
        __dirname,
        "../../packages/shadcn/dist/index.esm.js",
      ),
    },
  },
  ssr: {
    noExternal: [
      "@timeless/shadcn",
      "@timeless/reactive",
      "@timeless/ui-vm",
      "@timeless/icons",
      "@timeless/timeless",
      "@timeless/timeless-dom",
    ],
  },
});
