import { resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

import pkg from "./package.json";

import { buildLibName, isProd } from "../../vite.config.base";

const name = "timeless";

export default defineConfig({
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@timeless/primitive": resolve(__dirname, "../primitive"),
      "@timeless/reactive": resolve(__dirname, "../reactive"),
      "@timeless/ui-primitive": resolve(__dirname, "../ui-primitive"),
      "@timeless/ui-vm": resolve(__dirname, "../ui-vm"),
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
    minify: isProd ? "terser" : false,
    ...(isProd && {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    sourcemap: false,
    rollupOptions: {
      external: ["tailwindcss"],
      output: {
        globals: {
          tailwindcss: "tailwindcss",
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
