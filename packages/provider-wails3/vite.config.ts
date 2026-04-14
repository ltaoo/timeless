import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.wails3",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  globals: {
    "@timeless/reactive": "Timeless.reactive",
    "@timeless/timeless": "Timeless",
    "@timeless/kit": "Timeless",
    "@timeless/ui-vm": "Timeless.ui",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
