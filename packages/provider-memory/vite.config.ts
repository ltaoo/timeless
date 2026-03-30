import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.memory",
  external: ["@timeless/kit"],
  globals: {
    "@timeless/kit": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
