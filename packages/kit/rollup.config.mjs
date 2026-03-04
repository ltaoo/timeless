import analyze from "rollup-plugin-analyzer";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const minify = terser({
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ["console.log"], // Ensures console.log is removed even if drop_console is false in some configs
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: false,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      }),
      minify,
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/timeless.kit.umd.min.js",
      format: "umd",
      name: "Timeless",
      extend: true,
      globals: {
        "@timeless/reactive": "Timeless.reactive",
        "@timeless/headless": "Timeless.headless",
        "@timeless/ui": "Timeless.ui",
      },
      sourcemap: true,
    },
    external: [
      "@timeless/reactive",
      "@timeless/headless",
      "@timeless/ui",
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      }),
      // minify,
      // analyze({ summaryOnly: true, limit: 50 }),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      dts(),
    ],
  },
];

export default (args) => {
  if (args.whole) delete args.whole;
  return config;
};
