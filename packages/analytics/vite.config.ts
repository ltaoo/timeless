import { resolve } from "path";

import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "analytics",
  globalName: "Analytics",
  formats: ["es", "cjs", "umd"],
  fileName: (format) => {
    if (format === "es") return "analytics.esm.js";
    if (format === "cjs") return "index.cjs";
    return "analytics.umd.min.js";
  },
  minify: true,
  sourcemap: false,
});
