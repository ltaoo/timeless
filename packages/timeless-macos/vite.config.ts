import { resolve } from "node:path";
import { createLibConfig } from "../../vite.config.base";
export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.macos",
  external: ["@timeless/timeless-native"],
  formats: ["es", "cjs"],
});
