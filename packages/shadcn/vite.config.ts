import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { prefixTailwindClassesPlugin } from "./build/vite-plugin-tailwind-prefix";
import pkg from "./package.json";
import { isProd } from "../../vite.config.base";
import { bundle_analysis_plugin } from "../../scripts/vite-plugin-bundle-analysis";

const name = "timeless.shadcn";
const externals = ["@timeless/timeless"] as const;

export default defineConfig({
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  css: {
    postcss: "./postcss.config.js",
    modules: false,
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") {
          return `index.esm.js`;
        }
        if (format === "umd") {
          return `${name}.umd.min.js`;
        }
        return "index.js";
      },
      name: "Timeless.shadcn",
    },
    minify: isProd ? "terser" : false,
    ...(isProd && {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    sourcemap: isProd ? false : true,
    rollupOptions: {
      external: externals,
      output: {
        extend: true,
        globals: {
          "@timeless/timeless": "Timeless",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "timeless.shadcn.css";
          }
          return assetInfo.name || "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    bundle_analysis_plugin({
      package_name: pkg.name,
      package_root: __dirname,
      workspace_root: resolve(__dirname, "../.."),
    }),
    ...prefixTailwindClassesPlugin(resolve(__dirname, "src")),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
});
