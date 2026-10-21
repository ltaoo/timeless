import { resolve } from "node:path";
import { defineConfig, type UserConfig } from "vite";
import {
  timelessNativeHMR,
  timelessWebStyles,
} from "@timeless/inner-vite-plugin";

export function nativeConfig({ mode }: { mode: string }): UserConfig {
  return {
    base: "./",
    define: { __TIMELESS_PLATFORM__: JSON.stringify("macOS · AppKit / Yoga") },
    publicDir: false,
    resolve: { alias: { "@": resolve(__dirname, "src") } },
    plugins: [
      timelessWebStyles({ html: resolve(__dirname, "index.simple.html") }),
      ...(mode === "development" ? [timelessNativeHMR()] : []),
    ],
    build: {
      outDir: "dist/macos",
      // The native JS engine has no document or module loader.
      modulePreload: false,
      minify: mode !== "development",
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, "index.macos.html"),
        output: {
          format: "iife",
          entryFileNames: "app.js",
          inlineDynamicImports: true,
        },
      },
    },
  };
}
export default defineConfig(nativeConfig);
