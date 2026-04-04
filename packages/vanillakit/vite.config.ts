import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.vanillakit",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  formats: ["es", "cjs", "umd"],
  external: [],
  minify: true,
  dts: true,
  footer: `if (typeof window !== "undefined") {
    window.Timeless = window.Timeless || {};
    Object.assign(window.Timeless, window.Timeless.vanillakit);
  }`,
});
