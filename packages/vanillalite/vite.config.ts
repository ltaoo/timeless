import { resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

import pkg from "./package.json";
import { buildLibName, isProd } from "../../vite.config.base";

const name = "timeless.vanillalite";

export default defineConfig({
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@timeless/timeless": resolve(__dirname, "../timeless"),
      "@timeless/timeless-dom": resolve(__dirname, "../timeless-dom"),
      "@timeless/inner-primitive": resolve(__dirname, "../primitive"),
      "@timeless/inner-reactive": resolve(__dirname, "../reactive"),
      "@timeless/inner-base": resolve(__dirname, "../base"),
      "@timeless/inner-kit": resolve(__dirname, "../kit"),
      "@timeless/inner-vm": resolve(__dirname, "../ui-vm"),
      "@timeless/inner-utils": resolve(__dirname, "../utils"),
      "@timeless/inner-icons": resolve(__dirname, "../icons"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return `${name}.esm.js`;
        if (format === "cjs") return "index.js";
        if (format === "umd") return `${name}.umd.min.js`;
        return `index.${format}.js`;
      },
      name: buildLibName(name),
    },
    minify: isProd ? "terser" : "terser",
    ...(isProd && {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    sourcemap: false,
    rollupOptions: {
      external: [],
      output: {
        footer: `if (typeof window !== "undefined") {
    window.Timeless = window.Timeless || {};
    Object.assign(window.Timeless, window.Timeless.vanillalite);
  }`,
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
