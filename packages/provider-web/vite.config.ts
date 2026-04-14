import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.web",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: ["@timeless/timeless", "@timeless/ui-vm", "@timeless/kit"],
  globals: {
    "@timeless/timeless": "Timeless",
    "@timeless/kit": "Timeless.kit",
    "@timeless/ui-vm": "Timeless.ui",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
