import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";
import dts from "vite-plugin-dts";

import { buildLibName } from "../../vite.config.base";

import pkg from "./package.json";

const isProd = false;
const name = "timeless.vm";
const isWhole = process.argv.includes("--whole");
const isUmdOnly = process.argv.includes("--umd");

// 获取所有组件目录
const components = fs.readdirSync(resolve(__dirname, "src")).filter((name) => {
  const componentPath = resolve(__dirname, "src", name);
  return (
    fs.statSync(componentPath).isDirectory() &&
    fs.existsSync(resolve(componentPath, "index.ts"))
  );
});

// function resolveAtAliasDirectoryIndex() {
//   return {
//     name: "timeless:resolve-at-alias-directory-index",
//     enforce: "pre",
//     resolveId(source: string) {
//       if (!source.startsWith("@/")) return null;
//       const rest = source.slice(2);
//       if (!rest || rest.includes("/")) return null;
//       const componentIndex = resolve(__dirname, "src", rest, "index.ts");
//       if (fs.existsSync(componentIndex)) {
//         return componentIndex;
//       }
//       return null;
//     },
//   };
// }

export default defineConfig({
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    emptyOutDir: !isUmdOnly,
    lib: {
      entry: isUmdOnly
        ? resolve(__dirname, "src/index.ts")
        : isWhole
          ? components.reduce(
              (entries, name) => {
                entries[name] = resolve(__dirname, `src/${name}/index.ts`);
                return entries;
              },
              {
                index: resolve(__dirname, "src/index.ts"),
              } as Record<string, string>,
            )
          : resolve(__dirname, "src/index.ts"),
      formats: isUmdOnly
        ? ["umd"]
        : isWhole
          ? ["es", "cjs"]
          : ["es", "cjs", "umd"],
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
    ...(isProd ? {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    } : {}),
    sourcemap: false,
    rollupOptions: {
      external: ["@timeless/inner-base", "@timeless/inner-reactive"],
      output: {
        globals: {
          "@timeless/inner-base": "Timeless",
          "@timeless/inner-reactive": "Timeless",
          // "@timeless/inner-utils": "Timeless.utils",
        },
      },
    },
  },
  plugins: [
    // resolveAtAliasDirectoryIndex(),
    ...(isUmdOnly
      ? []
      : [
          dts({
            insertTypesEntry: true,
            rollupTypes: true,
          }),
        ]),
  ],
});
