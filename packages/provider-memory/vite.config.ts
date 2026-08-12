import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.memory",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: ["@timeless/inner-kit"],
  globals: {
    "@timeless/inner-kit": "Timeless.kit",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
