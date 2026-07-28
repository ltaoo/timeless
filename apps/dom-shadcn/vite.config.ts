import { defineConfig } from "vite";
import { timelessHMR } from "@timeless/inner-vite-plugin";
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
      "@timeless/inner-kit",
      "@timeless/provider-web",
      "@timeless/shadcn",
      "@timeless/timeless",
      "@timeless/timeless-dom",
      "@timeless/inner-vm",
      "@timeless/ui-primitive",
      "@timeless/inner-reactive",
      "@timeless/inner-base",
      "@timeless/inner-types",
      "@timeless/inner-utils",
      "@timeless/inner-primitive",
      "@timeless/inner-icons",
    ],
  },
});
