import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.utils",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  formats: ["es", "cjs", "umd"],
  external: ["@timeless/inner-base", "@timeless/inner-types"],
  globals: {
    "@timeless/inner-base": "Timeless.base",
  },
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
