import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.canvas",
  globalName: "Timeless.Canvas",
  external: ["@timeless/timeless"],
  globals: {
    "@timeless/timeless": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "timeless.canvas.esm.js";
    if (format === "cjs") return "index.js";
    if (format === "umd") return "timeless.canvas.umd.min.js";
    return `index.${format}.js`;
  },
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
