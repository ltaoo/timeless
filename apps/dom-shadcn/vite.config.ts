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
      "@timeless/provider-web",
      "@timeless/shadcn",
      "@timeless/timeless",
      "@timeless/timeless-dom",
    ],
  },
});
