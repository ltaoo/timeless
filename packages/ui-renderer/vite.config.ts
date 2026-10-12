import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";
const directory = fileURLToPath(new URL(".", import.meta.url));

export default createLibConfig({
  entry: resolve(directory, "src/index.ts"),
  name: "timeless.ui-renderer",
  globalName: "Timeless.UiRenderer",
  external: ["@timeless/timeless"],
  globals: { "@timeless/timeless": "Timeless" },
  formats: ["es", "cjs", "umd"],
  bundle_analysis: {
    package_name: pkg.name,
    package_root: directory,
    workspace_root: resolve(directory, "../.."),
  },
});
