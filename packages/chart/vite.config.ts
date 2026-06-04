import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.chart",
  globalName: "Timeless.Chart",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "timeless.chart.esm.js";
    if (format === "cjs") return "index.js";
    if (format === "umd") return "timeless.chart.umd.min.js";
    return `index.${format}.js`;
  },
  external: [],
  minify: false,
  sourcemap: false,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
