import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.kit",
  formats: ["es", "cjs", "umd"],
  external: ["@timeless/reactive", "@timeless/headless", "@timeless/ui"],
  globals: {
    "@timeless/reactive": "Timeless.reactive",
    "@timeless/headless": "Timeless.headless",
    "@timeless/ui": "Timeless.ui",
  },
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
  rollupConfig: {
    footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless) {
          Object.assign(window.Timeless, window.Timeless.kit);
          Object.assign(window.Timeless, window.Timeless.kit.base);
        }
      }`,
  },
});
