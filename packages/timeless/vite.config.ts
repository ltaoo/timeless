import { resolve } from "path";
import fs from "fs";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

import pkg from "./package.json";

import { buildLibName, isProd } from "../../vite.config.base";
import { bundle_analysis_plugin } from "../../scripts/vite-plugin-bundle-analysis";

const name = "timeless";

function resolvePackageSourceAliases() {
  return {
    name: "timeless-resolve-package-source-aliases",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (!importer || !source.startsWith("@/")) return null;

      const packageMatch = importer.match(/\/packages\/([^/]+)\//);
      if (!packageMatch) return null;

      const target = resolve(
        __dirname,
        "..",
        packageMatch[1],
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
      "@timeless/lite": resolve(__dirname, "../lite/src/index.ts"),
      "@timeless/inner-base": resolve(__dirname, "../base/src/index.ts"),
      "@timeless/inner-icons": resolve(__dirname, "../icons/src/index.ts"),
      "@timeless/inner-primitive": resolve(
        __dirname,
        "../primitive/src/index.ts",
      ),
      "@timeless/inner-reactive": resolve(
        __dirname,
        "../reactive/src/index.ts",
      ),
      "@timeless/inner-kit": resolve(__dirname, "../kit/src/index.ts"),
      "@timeless/inner-utils": resolve(__dirname, "../utils/src/index.ts"),
      "@timeless/inner-vm": resolve(__dirname, "../ui-vm/src/index.ts"),
      "@timeless/ui-primitive": resolve(
        __dirname,
        "../ui-primitive/src/index.ts",
      ),
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
    resolvePackageSourceAliases(),
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
