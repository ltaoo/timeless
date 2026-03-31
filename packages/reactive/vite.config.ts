import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.reactive",
  formats: ["es", "cjs", "umd"],
  external: [],
  minify: false,
  sourcemap: false,
  dts: true,
  rollupConfig: {
    output: {
    },
  },
});
