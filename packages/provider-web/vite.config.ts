import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.web",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: ["@timeless/timeless", "@timeless/inner-vm", "@timeless/inner-kit"],
  globals: {
    "@timeless/timeless": "Timeless",
    "@timeless/inner-kit": "Timeless.kit",
    "@timeless/inner-vm": "Timeless.ui",
  },
  formats: ["es", "cjs", "umd"],
  minify: false,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
