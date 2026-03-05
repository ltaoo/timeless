import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.reactive",
  formats: ["es", "cjs", "umd"],
  external: [],
  minify: true,
  dts: true,
  footer: `if (typeof window !== "undefined") {
    window.Timeless = window.Timeless || {};
    Object.assign(window.Timeless, window.Timeless.reactive);
  }`,
});
