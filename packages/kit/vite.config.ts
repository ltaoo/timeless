import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";
import pkg from "./package.json";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "timeless.kit",
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  formats: ["es", "cjs", "umd"],
  external: [
    "@timeless/reactive",
    "@timeless/base",
    "@timeless/ui",
    "@timeless/utils",
  ],
  globals: {
    "@timeless/reactive": "Timeless.reactive",
    "@timeless/base": "Timeless.base",
    "@timeless/ui": "Timeless.ui",
    "@timeless/utils": "Timeless.utils",
  },
  minify: true,
  alias: {
    "@": resolve(__dirname, "src"),
  },
  // footer: `if (typeof window !== "undefined") {
  //       window.Timeless = window.Timeless || {};
  //       if (window.Timeless) {
  //         if (window.Timeless.kit) {
  //           Object.assign(window.Timeless, window.Timeless.kit);
  //           if (window.Timeless.kit.base) {
  //             Object.assign(window.Timeless, window.Timeless.kit.base);
  //           }
  //         }
  //         if (window.Timeless.base) {
  //           Object.assign(window.Timeless, window.Timeless.base);
  //         }
  //       }
  //     }`,
});
