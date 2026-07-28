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
    "@timeless/inner-reactive",
    "@timeless/inner-base",
    "@timeless/inner-vm",
    "@timeless/inner-utils",
  ],
  globals: {
    "@timeless/inner-reactive": "Timeless",
    "@timeless/inner-base": "Timeless",
    "@timeless/inner-vm": "Timeless.ui",
    "@timeless/inner-utils": "Timeless.utils",
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
