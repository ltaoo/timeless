import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";
import dts from "vite-plugin-dts";

import pkg from "./package.json";
import { buildLibName, isProd } from "../../vite.config.base";

const isWhole = process.argv.includes("--whole");

// Get all .ts files in src except index.ts and d.ts files
const icons = fs
  .readdirSync(resolve(__dirname, "src/icons"))
  .filter((name) => {
    return (
      name.endsWith(".ts") && name !== "index.ts" && !name.endsWith(".d.ts")
    );
  })
  .map((name) => name.replace(".ts", ""));

const name = "timeless.icons";

export default defineConfig({
  build: {
    lib: {
      entry: isWhole
        ? icons.reduce(
            (entries, name) => {
              // @ts-ignore
              entries[name] = resolve(__dirname, `src/icons/${name}.ts`);
              return entries;
            },
            { index: resolve(__dirname, "src/index.ts") },
          )
        : resolve(__dirname, "src/index.ts"),
      formats: isWhole ? ["es", "cjs"] : ["es", "cjs", "umd"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          if (format === "es") {
            return "index.esm.js";
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
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      output: {
        globals: {
          "@timeless/reactive": "Timeless.reactive",
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
