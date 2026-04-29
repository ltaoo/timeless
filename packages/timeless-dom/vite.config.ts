import { resolve } from "path";

import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.dom",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  globalName: "Timeless.DOM",
  external: ["@timeless/timeless"],
  globals: {
    "@timeless/timeless": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "timeless.dom.esm.js";
    if (format === "cjs") return "index.js";
    if (format === "umd") return "timeless.dom.umd.min.js";
    return `index.${format}.js`;
  },
  minify: false,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
