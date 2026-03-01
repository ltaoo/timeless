import analyze from "rollup-plugin-analyzer";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";
import path from "path";
import fs from "fs";
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

const components = fs
  .readdirSync(path.resolve(__dirname, "src"))
  .filter((name) => {
    const componentPath = path.resolve(__dirname, "src", name);
    return (
      fs.statSync(componentPath).isDirectory() &&
      fs.existsSync(path.resolve(componentPath, "index.ts"))
    );
  });

const configs = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/timeless.ui.umd.min.js",
        format: "umd",
        name: "Timeless.ui",
        globals: {},
        sourcemap: false,
      },
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        sourceMap: false,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: null,
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          outDir: null,
        },
      }),
      minify,
    ],
    external: [],
  },
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
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      dts(),
    ],
  },
];

components.forEach((name) => {
  configs.push({
    input: `src/${name}/index.ts`,
    output: [
      {
        file: `dist/${name}/index.js`,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: `dist/${name}/index.esm.js`,
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
        },
      }),
      minify,
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  });

  configs.push({
    input: `src/${name}/index.ts`,
    output: [{ file: `dist/${name}/index.d.ts`, format: "es" }],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      dts(),
    ],
  });
});

export default configs;
