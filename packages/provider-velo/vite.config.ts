import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.velo",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  globals: {
    "@timeless/inner-base": "Timeless",
    "@timeless/inner-kit": "Timeless",
  },
  formats: ["es", "cjs", "umd"],
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
});
