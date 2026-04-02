import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.tui",
  globalName: "Timeless.TUI",
  external: ["@timeless/timeless"],
  globals: {
    "@timeless/timeless": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "timeless.tui.esm.js";
    if (format === "cjs") return "index.js";
    if (format === "umd") return "timeless.tui.umd.min.js";
    return `index.${format}.js`;
  },
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
