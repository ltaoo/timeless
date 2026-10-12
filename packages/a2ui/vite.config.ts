import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLibConfig } from "../../vite.config.base";
const root = fileURLToPath(new URL(".", import.meta.url));
export default createLibConfig({
  entry: resolve(root, "src/index.ts"),
  name: "timeless.a2ui",
  globalName: "Timeless.a2ui",
  external: ["@timeless/timeless"],
  globals: { "@timeless/timeless": "Timeless" },
  formats: ["es", "umd"],
  fileName: (format) =>
    format === "es" ? "index.esm.js" : "timeless.a2ui.umd.min.js",
  bundle_analysis: {
    package_root: root,
    workspace_root: resolve(root, "../.."),
    package_name: "@timeless/a2ui",
  },
});
