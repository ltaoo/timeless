import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.reactive",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  formats: ["es", "cjs", "umd"],
  external: ["@timeless/inner-base"],
  globals: {
    "@timeless/inner-base": "Timeless.base",
  },
  minify: false,
  sourcemap: false,
  dts: true,
  rollupConfig: {
    output: {
    },
  },
});
