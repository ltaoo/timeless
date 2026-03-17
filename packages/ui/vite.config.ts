import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import { buildLibName, isProd } from "../../vite.config.base";

const isWhole = process.argv.includes("--whole");
const name = "timeless.ui";

// 获取所有组件目录
const components = fs.readdirSync(resolve(__dirname, "src")).filter((name) => {
  const componentPath = resolve(__dirname, "src", name);
  return (
    fs.statSync(componentPath).isDirectory() &&
    fs.existsSync(resolve(componentPath, "index.ts"))
  );
});

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: isWhole
        ? components.reduce(
            (entries, name) => {
              // @ts-ignore
              entries[name] = resolve(__dirname, `src/${name}/index.ts`);
              return entries;
            },
            { index: resolve(__dirname, "src/index.ts") },
          )
        : resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          if (format === "es") {
            return `index.esm.js`;
          }
          if (format === "cjs") {
            return "index.js";
          }
          if (format === "umd") {
            return `${name}.umd.min.js`;
          }
        }
        if (format === "es") {
          return `${entryName}/index.esm.js`;
        }
        if (format === "cjs") {
          return `${entryName}/index.js`;
        }
        return `${entryName}/index.${format}.js`;
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
      external: ["@timeless/reactive", "@timeless/utils"],
      output: {
        globals: {
          "@timeless/reactive": "Timeless.reactive",
          "@timeless/utils": "Timeless.utils",
        },
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
