import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.vite-plugin",
  formats: ["es", "cjs"],
  external: ["vite"],
});
