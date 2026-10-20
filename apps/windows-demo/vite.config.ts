import { resolve } from "node:path";
import { defineConfig } from "vite";
import { createLibConfig } from "../../vite.config.base";
import {
  timelessNativeHMR,
  timelessNativeStyles,
} from "@timeless/inner-vite-plugin";

export default defineConfig(({ mode }) => {
  const development = mode === "development";
  const base = createLibConfig({
    entry: resolve(__dirname, "src/index.js"),
    name: "app",
    globalName: "App",
    formats: ["umd"],
    fileName: () => "app.js",
    minify: !development,
    dts: false,
  });
  return {
    ...base,
    plugins: [
      ...(Array.isArray(base.plugins) ? base.plugins : []),
      timelessNativeStyles(),
      ...(development ? [timelessNativeHMR()] : []),
    ],
  };
});
