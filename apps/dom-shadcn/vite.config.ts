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
});
