import { resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import pkg from "./package.json";

import { buildLibName, isProd } from "../../vite.config.base";

const name = "timeless";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return `index.esm.js`;
        if (format === "cjs") return "index.js";
        if (format === "umd") return `${name}.umd.min.js`;
        return `index.${format}.js`;
      },
      name: buildLibName(name),
    },
    minify: isProd ? "terser" : true,
    ...(isProd && {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    sourcemap: false,
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      output: {
        globals: {
          "@timeless/base": "Timeless.base",
          "@timeless/icons": "Timeless.icons",
          "@timeless/reactive": "Timeless.reactive",
          "@timeless/utils": "Timeless.utils",
          "@timeless/ui": "Timeless.ui",
          "@timeless/kit": "Timeless.kit",
          "@timeless/primitive": "Timeless.primitive",
        },
      },
    },
  },
  plugins: [
    dtsPlugin({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
});
