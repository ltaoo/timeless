import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Get all .ts files in src except index.ts and d.ts files
const components = fs
  .readdirSync(path.resolve(__dirname, "src"))
  .filter((name) => {
    return (
      name.endsWith(".ts") && name !== "index.ts" && !name.endsWith(".d.ts")
    );
  })
  .map((name) => name.replace(".ts", ""));

const configs = [
  // UMD Build
  {
    input: path.join(__dirname, "src/index.ts"),
    output: [
      {
        file: path.join(__dirname, "dist/timeless.headless.umd.min.js"),
        format: "umd",
        name: "Timeless.headless",
        extend: true,
        globals: {
          "@timeless/reactive": "Timeless.reactive",
          "@timeless/kit": "Timeless",
          "@timeless/ui": "Timeless.ui",
        },
        footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless.headless) {
          Object.assign(window, window.Timeless.headless);
        }
      }`,
      },
    ],
    external: ["@timeless/reactive", "@timeless/kit", "@timeless/ui"],
    plugins: [
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        sourceMap: false,
      }),
      minify,
    ],
  },
  // Main CJS and ESM Build
  {
    input: path.join(__dirname, "src/index.ts"),
    output: [
      {
        file: path.join(__dirname, "dist/index.js"),
        format: "cjs",
        sourcemap: true,
      },
      {
        file: path.join(__dirname, "dist/index.esm.js"),
        format: "esm",
        sourcemap: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationMap: false,
        outDir: null,
        declarationDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
          declarationDir: null,
        },
      }),
    ],
  },
  // Main d.ts Build
  {
    input: path.join(__dirname, "src/index.ts"),
    output: [{ file: path.join(__dirname, "dist/index.d.ts"), format: "es" }],
    plugins: [dts()],
  },
];

// Individual Component Builds
components.forEach((name) => {
  configs.push({
    input: path.join(__dirname, `src/${name}.ts`),
    output: [
      {
        file: path.join(__dirname, `dist/${name}/index.js`),
        format: "cjs",
        sourcemap: true,
      },
      {
        file: path.join(__dirname, `dist/${name}/index.esm.js`),
        format: "esm",
        sourcemap: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationMap: false,
        outDir: null,
        declarationDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
          declarationDir: null,
        },
      }),
    ],
  });

  configs.push({
    input: path.join(__dirname, `src/${name}.ts`),
    output: [
      { file: path.join(__dirname, `dist/${name}/index.d.ts`), format: "es" },
    ],
    plugins: [dts()],
  });
});

export default configs;
