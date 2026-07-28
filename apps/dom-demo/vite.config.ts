import { defineConfig } from "vite";
import { timelessHMR } from "@timeless/inner-vite-plugin";

export default defineConfig({
  plugins: [timelessHMR()],
  resolve: {},
});
