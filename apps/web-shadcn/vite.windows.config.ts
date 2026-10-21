import { resolve } from "node:path";
import { defineConfig } from "vite";
import { nativeConfig } from "./vite.macos.config";

export default defineConfig((environment) => {
  const base = nativeConfig(environment);
  return {
    ...base,
    define: { __TIMELESS_PLATFORM__: JSON.stringify("Windows · Win32 / Yoga") },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@timeless/timeless-macos": resolve(
          __dirname,
          "../../packages/timeless-windows/src/index.ts",
        ),
      },
    },
    build: { ...base.build, outDir: "dist/windows" },
  };
});
