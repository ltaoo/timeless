import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { timelessHMR } from "@timeless/inner-vite-plugin";

export default defineConfig({
  plugins: [timelessHMR(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: [
      "@timeless/shadcn",
      "@timeless/timeless",
      "@timeless/timeless-dom",
    ],
  },
});
