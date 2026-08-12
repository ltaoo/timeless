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
  external: ["@timeless/timeless", "@timeless/inner-vm"],
  globals: {
    "@timeless/timeless": "Timeless",
    "@timeless/inner-vm": "Timeless.vm",
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
  bundle_analysis: {
    package_name: pkg.name,
    package_root: __dirname,
    workspace_root: resolve(__dirname, "../.."),
  },
});
