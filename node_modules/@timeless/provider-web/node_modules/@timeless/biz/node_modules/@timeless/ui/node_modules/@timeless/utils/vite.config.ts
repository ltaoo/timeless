import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.utils",
  formats: ["es", "cjs", "umd"],
  external: ["@timeless/base", "@timeless/types"],
  globals: {
    "@timeless/base": "Timeless.base",
  },
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
