import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { buildLibName, isProd } from "../../vite.config.base";

const name = "timeless.shadcn";

export default defineConfig({
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
      name: buildLibName(name),
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
      external: [
        "@timeless/reactive",
        "@timeless/headless",
        "@timeless/kit",
        "@timeless/ui",
        "@timeless/icons",
      ],
      output: {
        globals: {
          "@timeless/reactive": "Timeless.reactive",
          "@timeless/headless": "Timeless.headless",
          "@timeless/kit": "Timeless.kit",
          "@timeless/ui": "Timeless.ui",
          "@timeless/icons": "Timeless.icons",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "timeless.shadcn.css";
          }
          return assetInfo.name || "assets/[name]-[hash][extname]";
        },
        footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless.shadcn) {
          Object.assign(window.Timeless, window.Timeless.shadcn);
          Object.keys(window.Timeless).forEach((k) => {
            window[k] = window.Timeless[k];
          });
        }
      }`,
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
