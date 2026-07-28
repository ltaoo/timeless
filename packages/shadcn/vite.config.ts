import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";

import { prefixTailwindClassesPlugin } from "./build/vite-plugin-tailwind-prefix";
import pkg from "./package.json";
import { isProd } from "../../vite.config.base";

const name = "timeless.shadcn";
const externals = [
  "@timeless/timeless",
  "@timeless/inner-vm",
  "@timeless/ui-primitive",
] as const;

function isExternal(id: string) {
  return externals.some(
    (pkgName) => id === pkgName || id.startsWith(`${pkgName}/`),
  );
}

function redirectToPrimitive() {
  const redirects = new Map<string, string>([
    ["@timeless/inner-reactive", "@timeless/inner-primitive"],
    ["@timeless/inner-kit", "@timeless/inner-primitive"],
  ]);

  return {
    name: "shadcn-redirect-to-primitive",
    enforce: "pre",
    resolveId(source: string) {
      const redirected = redirects.get(source);
      if (redirected) return redirected;
      return null;
    },
  };
}

function rewriteDtsImports() {
  const distDir = resolve(__dirname, "dist");
  const replacements: Array<[string, string]> = [
    ['"@timeless/inner-reactive"', '"@timeless/timeless"'],
    ["'@timeless/inner-reactive'", "'@timeless/timeless'"],
    ['"@timeless/inner-base"', '"@timeless/timeless"'],
    ["'@timeless/inner-base'", "'@timeless/timeless'"],
    ['"@timeless/inner-kit"', '"@timeless/timeless"'],
    ["'@timeless/inner-kit'", "'@timeless/timeless'"],
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
    name: "shadcn-rewrite-dts-imports",
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
      name: "Timeless.shadcn",
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
      external: externals,
      output: {
        extend: true,
        globals: {
          "@timeless/timeless": "Timeless",
          "@timeless/inner-vm": "Timeless.ui",
          "@timeless/ui-primitive": "Timeless",
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
    // redirectToPrimitive(),
    ...prefixTailwindClassesPlugin(resolve(__dirname, "src")),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
    rewriteDtsImports(),
  ],
});
