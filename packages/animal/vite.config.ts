import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json";
import { isProd } from "../../vite.config.base";
import { bundle_analysis_plugin } from "../../scripts/vite-plugin-bundle-analysis";

const name = "timeless.animal";
const externals = ["@timeless/timeless"] as const;

export default defineConfig({
  // 字体与 CSS 会一起被拷到 dist/timeless/<version>/（以及画廊的
  // public/timeless/<version>/），两者同层平铺，所以 CSS 里必须留
  // `./animal-*.woff2` 这种**相对**引用。
  //
  // 不设 base（默认 "/"）+ 不设这个钩子的话，rolldown 会把 url() 重写成
  // `/animal-*.woff2`（绝对路径），从子路径加载画廊时取不到字体；而 base: "./"
  // 又会算出 `../animal-*.woff2`（它按 `assetsDir` 假设 CSS 在一层子目录里）。
  // 直接给出确定性的相对串最稳，也不用赌它的相对路径推导规则。
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === "css" && filename.endsWith(".woff2")) {
        return `./${filename}`;
      }
      return undefined;
    },
  },
  define: {
    __Version: JSON.stringify(pkg.version),
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
      name: "Timeless.animal",
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    cssMinify: true,
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
            return "timeless.animal.css";
          }
          // Fonts ship next to the CSS at the dist root: the stylesheet refers to
          // them with url("./animal-*.woff2"), so the relative relationship must
          // survive the copy into dist/timeless/<version>/.
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
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
});
