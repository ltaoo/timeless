import { resolve } from "path";
import { defineConfig } from "vite";
import { createLibConfig } from "../../vite.config.base";
import { timelessNativeHMR } from "@timeless/inner-vite-plugin";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const base = createLibConfig({
    entry: resolve(__dirname, "src/index.js"),
    name: "app",
    globalName: "App",
    formats: ["umd"],
    fileName: () => "app.js",
    minify: !isDev,
    dts: false,
  });

  return {
    ...base,
    plugins: [...(Array.isArray(base.plugins) ? base.plugins : []), ...(isDev ? [timelessNativeHMR()] : [])],
  };
});
