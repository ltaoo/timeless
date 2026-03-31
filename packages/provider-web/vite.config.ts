import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.web",
  external: [
    "@timeless/utils",
    "@timeless/base",
    "@timeless/kit",
    "@timeless/ui",
  ],
  globals: {
    "@timeless/utils": "Timeless.utils",
    "@timeless/base": "Timeless.base",
    "@timeless/kit": "Timeless.kit",
    "@timeless/ui": "Timeless.ui",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
