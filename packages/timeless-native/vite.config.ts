import { resolve } from "path";

import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.native",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  globalName: "Timeless.Native",
  external: ["@timeless/timeless"],
  globals: {
    "@timeless/timeless": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "timeless.native.esm.js";
    if (format === "cjs") return "index.js";
    if (format === "umd") return "timeless.native.umd.min.js";
    return `index.${format}.js`;
  },
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
