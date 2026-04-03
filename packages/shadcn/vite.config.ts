import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from "fs";

import { isProd } from "../../vite.config.base";

const name = "timeless.shadcn";

function redirectToPrimitive() {
  const redirects = new Map<string, string>([
    ["@timeless/reactive", "@timeless/primitive"],
    ["@timeless/kit", "@timeless/primitive"],
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
    ['"@timeless/reactive"', '"@timeless/primitive"'],
    ["'@timeless/reactive'", "'@timeless/primitive'"],
    ['"@timeless/kit"', '"@timeless/primitive"'],
    ["'@timeless/kit'", "'@timeless/primitive'"],
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
        "@timeless/primitive",
        "@timeless/ui",
      ],
      output: {
        extend: true,
        globals: {
          "@timeless/primitive": "Timeless",
          "@timeless/ui": "Timeless.ui",
        },
        footer: `(function(){try{var g=typeof globalThis!=="undefined"?globalThis:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var t=g.Timeless;if(!t)return;if(t.kit)Object.assign(t,t.kit);Object.assign(g,t)}catch(e){}})();`,
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
    redirectToPrimitive(),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
    rewriteDtsImports(),
  ],
});
