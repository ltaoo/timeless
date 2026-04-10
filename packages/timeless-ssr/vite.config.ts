import { resolve } from "path";

import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless-ssr",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: ["@timeless/timeless"],
  globals: {
    "@timeless/timeless": "Timeless",
  },
  formats: ["es", "cjs"],
  fileName: (format) => {
    if (format === "es") return "timeless.ssr.esm.js";
    return "index.cjs";
  },
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
