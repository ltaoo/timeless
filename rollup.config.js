import path from "path";
import { fileURLToPath } from "url";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createConfig = (input, output, name) => ({
  input: path.join(__dirname, input),
  output: {
    file: path.join(__dirname, output),
    format: "umd",
    name: name,
    globals: {
      [name]: name,
    },
  },
  external: [],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
      extensions: [".js", ".ts", ".tsx"],
    }),
    commonjs({
      sourceMap: false,
    }),
    typescript({
      compilerOptions: {
        declaration: false,
        emitDeclarationOnly: false,
      },
    }),
    terser(),
  ],
});

export default [
  createConfig("domains/index.ts", "dist/timeless.core.umd.min.js", "Timeless"),
  createConfig(
    "domains/provider/web/index.ts",
    "dist/timeless.web.umd.min.js",
    "TimelessWeb"
  ),
  createConfig(
    "domains/provider/weapp/index.ts",
    "dist/timeless.weapp.umd.min.js",
    "TimelessWeapp"
  ),
];
