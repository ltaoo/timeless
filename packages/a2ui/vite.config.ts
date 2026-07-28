import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";

import pkg from "./package.json";
import { isProd } from "../../vite.config.base";

const name = "timeless.a2ui";
const externals = ["@timeless/timeless"] as const;

function rewriteDtsImports() {
  const distDir = resolve(__dirname, "dist");
  const replacements: Array<[string, string]> = [
    ['"@timeless/inner-reactive"', '"@timeless/timeless"'],
    ["'@timeless/inner-reactive'", "'@timeless/timeless'"],
    ['"@timeless/inner-base"', '"@timeless/timeless"'],
    ["'@timeless/inner-base'", "'@timeless/timeless'"],
    ['"@timeless/inner-kit"', '"@timeless/timeless"'],
    ["'@timeless/inner-kit'", "'@timeless/timeless'"],
    ['"@timeless/inner-vm"', '"@timeless/timeless"'],
    ["'@timeless/inner-vm'", "'@timeless/timeless'"],
    ['"@timeless/inner-utils"', '"@timeless/timeless"'],
    ["'@timeless/inner-utils'", "'@timeless/timeless'"],
  ];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !fullPath.endsWith(".d.ts")) continue;
      const before = fs.readFileSync(fullPath, "utf-8");
      let after = before;
      for (const [from, to] of replacements) {
        after = after.split(from).join(to);
      }
      if (after !== before) {
        fs.writeFileSync(fullPath, after, "utf-8");
      }
    }
  }

  return {
    name: "a2ui-rewrite-dts-imports",
    apply: "build",
    enforce: "post",
    closeBundle() {
      walk(distDir);
    },
  };
}

export default defineConfig({
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
      name: "Timeless.a2ui",
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
      external: ["@timeless/timeless"],
      output: {
        extend: true,
        globals: {
          "@timeless/timeless": "Timeless",
        },
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
    rewriteDtsImports(),
  ],
});
