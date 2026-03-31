import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { isProd } from "../../vite.config.base";

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
      name: "Timeless",
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
        "@timeless/base",
        "@timeless/reactive",
        "@timeless/headless",
        "@timeless/kit",
        "@timeless/ui",
        "@timeless/utils",
        "@timeless/icons",
      ],
      output: {
        extend: true,
        footer: `(function(){try{var g=typeof globalThis!=="undefined"?globalThis:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var t=g.Timeless;if(!t)return;if(t.kit)Object.assign(t,t.kit);Object.assign(g,t)}catch(e){}})();`,
        globals: {
          "@timeless/base": "Timeless.base",
          "@timeless/reactive": "Timeless.reactive",
          "@timeless/headless": "Timeless.headless",
          "@timeless/kit": "Timeless.kit",
          "@timeless/ui": "Timeless.ui",
          "@timeless/utils": "Timeless.utils",
          "@timeless/icons": "Timeless.icons",
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
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
});
