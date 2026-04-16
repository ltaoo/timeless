import { defineConfig } from "vite";
import { timelessHMR } from "@timeless/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [timelessHMR(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: [
      "@timeless/kit",
      "@timeless/provider-web",
      "@timeless/shadcn",
      "@timeless/timeless",
      "@timeless/timeless-dom",
      "@timeless/ui-vm",
      "@timeless/ui-primitive",
      "@timeless/reactive",
      "@timeless/base",
      "@timeless/types",
      "@timeless/utils",
      "@timeless/primitive",
      "@timeless/icons",
    ],
  },
});
