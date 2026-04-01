import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";
import dtsPlugin from "vite-plugin-dts";

import { buildLibName, isProd } from "../../vite.config.base";

const isWhole = process.argv.includes("--whole");

// 获取所有组件目录
const components = fs.readdirSync(resolve(__dirname, "src")).filter((name) => {
  const componentPath = resolve(__dirname, "src", name);
  return (
    fs.statSync(componentPath).isDirectory() &&
    fs.existsSync(resolve(componentPath, "index.ts"))
  );
});

const name = "timeless.primitive";

function multiWorkspaceAtAlias() {
  const primitiveSrc = resolve(__dirname, "src");
  const uiSrc = resolve(__dirname, "../ui/src");
  const kitSrc = resolve(__dirname, "../kit/src");
  const baseSrc = resolve(__dirname, "../base/src");

  function resolveFile(root: string, subpath: string) {
    const base = resolve(root, subpath);
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

    const exts = [".ts", ".tsx", ".js", ".mjs"];
    if (base.endsWith(".js") || base.endsWith(".mjs")) {
      const withoutJsExt = base.replace(/\.m?js$/, "");
      for (const ext of [".ts", ".tsx"]) {
        const mapped = `${withoutJsExt}${ext}`;
        if (fs.existsSync(mapped) && fs.statSync(mapped).isFile()) {
          return mapped;
        }
      }
      if (fs.existsSync(withoutJsExt) && fs.statSync(withoutJsExt).isFile()) {
        return withoutJsExt;
      }
      if (fs.existsSync(withoutJsExt) && fs.statSync(withoutJsExt).isDirectory()) {
        for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
          const indexFile = resolve(withoutJsExt, `index${ext}`);
          if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
            return indexFile;
          }
        }
      }
    }
    for (const ext of exts) {
      const withExt = `${base}${ext}`;
      if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
        return withExt;
      }
    }

    if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
      for (const ext of exts) {
        const indexFile = resolve(base, `index${ext}`);
        if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
          return indexFile;
        }
      }
    }

    return base;
  }

  function normalizeImporter(importer?: string) {
    if (!importer) return "";
    return importer.split("?")[0];
  }

  return {
    name: "primitive-multi-workspace-at-alias",
    enforce: "pre",
    resolveId(source: string, importer?: string) {
      if (!source.startsWith("@/")) return null;
      const subpath = source.slice(2);
      const normalizedImporter = normalizeImporter(importer);

      if (normalizedImporter.includes("/packages/ui/src/")) {
        return resolveFile(uiSrc, subpath);
      }
      if (normalizedImporter.includes("/packages/kit/src/")) {
        return resolveFile(kitSrc, subpath);
      }
      if (normalizedImporter.includes("/packages/base/src/")) {
        return resolveFile(baseSrc, subpath);
      }
      return resolveFile(primitiveSrc, subpath);
    },
  };
}

function rewriteDtsWorkspaceImports() {
  const distDir = resolve(__dirname, "dist");
  const replacements: Array<[string, string]> = [
    ['"../../../ui/src"', '"@timeless/ui"'],
    ["'../../../ui/src'", "'@timeless/ui'"],
    ['"../../../reactive/src"', '"@timeless/reactive"'],
    ["'../../../reactive/src'", "'@timeless/reactive'"],
    ['"../../../kit/src"', '"@timeless/kit"'],
    ["'../../../kit/src'", "'@timeless/kit'"],
    ['"../../../base/src"', '"@timeless/base"'],
    ["'../../../base/src'", "'@timeless/base'"],
    ['"../../../utils/src"', '"@timeless/utils"'],
    ["'../../../utils/src'", "'@timeless/utils'"],
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
    name: "primitive-rewrite-dts-workspace-imports",
    apply: "build",
    enforce: "post",
    closeBundle() {
      walk(distDir);
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@timeless/base": resolve(__dirname, "../base/src"),
      "@timeless/reactive": resolve(__dirname, "../reactive/src"),
      "@timeless/utils": resolve(__dirname, "../utils/src"),
      "@timeless/ui": resolve(__dirname, "../ui/src"),
      "@timeless/kit": resolve(__dirname, "../kit/src"),
      "@timeless/types": resolve(__dirname, "../types/src"),
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
      external: [],
      output: {
        globals: {},
      },
    },
  },
  plugins: [
    multiWorkspaceAtAlias(),
    dtsPlugin({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
    rewriteDtsWorkspaceImports(),
  ],
});
