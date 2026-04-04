import { defineConfig, UserConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export const isProd = process.env.TIMELESS_PROD === "1";

export interface BuildOptions {
  entry: string;
  name?: string;
  globalName?: string;
  external?: string[];
  globals?: Record<string, string>;
  define?: Record<string, string>;
  formats?: ("es" | "cjs" | "umd")[];
  fileName?: (format: string) => string;
  minify?: boolean;
  sourcemap?: boolean;
  dts?: boolean;
  alias?: Record<string, string>;
  footer?: string;
  rollupConfig?: {};
}
export function buildLibName(name?: string, globalName?: string) {
  return (
    globalName ||
    (name ? name.charAt(0).toUpperCase() + name.slice(1) : undefined)
  );
}
export function createLibConfig(options: BuildOptions): UserConfig {
  const {
    entry,
    name,
    globalName,
    external = [],
    globals = {},
    define = {},
    formats = ["es", "cjs"],
    fileName,
    minify = false,
    sourcemap = true,
    dts: need_generate_dts = true,
    alias = {},
    footer,
  } = options;

  // 如果没有指定 globalName，则将 name 首字母大写作为全局变量名
  const plugins = [];
  if (need_generate_dts) {
    plugins.push(
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    );
  }

  return defineConfig({
    define,
    resolve: {
      alias: Object.entries(alias).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    },
    build: {
      lib: {
        entry,
        name: buildLibName(name, globalName),
        formats,
        fileName: (format) => {
          if (fileName) return fileName(format);
          if (format === "es") {
            return name ? `${name}.esm.js` : "index.esm.js";
          }
          if (format === "cjs") {
            return "index.js";
          }
          if (format === "umd") {
            return name ? `${name}.umd.min.js` : "index.umd.js";
          }
          return `index.${format}.js`;
        },
      },
      minify: isProd ? "terser" : minify ? "terser" : false,
      ...(isProd && {
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      sourcemap: isProd ? false : sourcemap,
      rollupOptions: {
        external,
        output: {
          globals,
          footer,
        },
        ...options.rollupConfig,
      },
    },
    plugins,
  });
}
