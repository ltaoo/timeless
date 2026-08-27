import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

import pkg from "./package.json";

import { buildLibName, isProd } from "../../vite.config.base";
import { bundle_analysis_plugin } from "../../scripts/vite-plugin-bundle-analysis";

function resolve_package_source_aliases() {
  return {
    name: "lite-resolve-package-source-aliases",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (!importer || !source.startsWith("@/")) return null;

      const package_match = importer.match(/\/packages\/([^/]+)\//);
      if (!package_match) return null;

      const target = resolve(
        __dirname,
        "..",
        package_match[1],
        "src",
        source.slice(2),
      );
      const candidates = [
        target,
        `${target}.ts`,
        `${target}.tsx`,
        resolve(target, "index.ts"),
        resolve(target, "index.tsx"),
      ];
      return (
        candidates.find(
          (candidate) =>
            fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
        ) || null
      );
    },
  };
}

export default defineConfig({
  define: {
    __Version: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@timeless/inner-base": resolve(__dirname, "../base/src/index.ts"),
      "@timeless/inner-primitive": resolve(
        __dirname,
        "../primitive/src/index.ts",
      ),
      "@timeless/inner-reactive": resolve(
        __dirname,
        "../reactive/src/index.ts",
      ),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "index.esm.js";
        if (format === "cjs") return "index.js";
        if (format === "umd") return "timeless.lite.umd.min.js";
        return `index.${format}.js`;
      },
      name: buildLibName("timeless"),
    },
    minify: isProd ? "terser" : false,
    ...(isProd && {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }),
    sourcemap: false,
    rollupOptions: {
      external: ["tailwindcss"],
      output: {
        globals: {
          tailwindcss: "tailwindcss",
        },
      },
    },
  },
  plugins: [
    resolve_package_source_aliases(),
    bundle_analysis_plugin({
      package_name: pkg.name,
      package_root: __dirname,
      workspace_root: resolve(__dirname, "../.."),
    }),
    dtsPlugin({
      insertTypesEntry: true,
      rollupTypes: false,
      aliasesExclude: [/^@timeless\//],
      compilerOptions: {
        noCheck: true,
      },
    }),
  ],
});
