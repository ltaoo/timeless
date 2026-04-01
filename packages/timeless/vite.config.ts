import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";
import dtsPlugin from "vite-plugin-dts";

import { buildLibName, isProd } from "../../vite.config.base";

const name = "timeless";

function multiWorkspaceAtAlias() {
  const primitiveSrc = resolve(__dirname, "../primitive/src");
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
    name: "timeless-multi-workspace-at-alias",
    enforce: "pre",
    resolveId(source: string, importer?: string) {
      if (!source.startsWith("@/")) return null;
      const subpath = source.slice(2);
      const normalizedImporter = normalizeImporter(importer);

      if (normalizedImporter.includes("/packages/primitive/src/")) {
        return resolveFile(primitiveSrc, subpath);
      }
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

export default defineConfig({
  resolve: {
    alias: {
      "@timeless/base": resolve(__dirname, "../base/src"),
      "@timeless/icons": resolve(__dirname, "../icons/src"),
      "@timeless/reactive": resolve(__dirname, "../reactive/src"),
      "@timeless/utils": resolve(__dirname, "../utils/src"),
      "@timeless/ui": resolve(__dirname, "../ui/src"),
      "@timeless/kit": resolve(__dirname, "../kit/src"),
      "@timeless/types": resolve(__dirname, "../types/src"),
      "@timeless/primitive": resolve(__dirname, "../primitive/src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return `index.esm.js`;
        if (format === "cjs") return "index.js";
        if (format === "umd") return `${name}.umd.min.js`;
        return `index.${format}.js`;
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
  ],
});
