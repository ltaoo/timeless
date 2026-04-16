import { defineConfig } from "vite";
import { timelessHMR } from "@timeless/vite-plugin";

export default defineConfig({
  plugins: [timelessHMR()],
  resolve: {},
});
