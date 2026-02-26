import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: path.join(__dirname, "src/index.js"),
  output: {
    file: path.join(__dirname, "dist/reactive.umd.min.js"),
    format: "umd",
    name: "Reactive",
    globals: {},
    footer: `if (typeof window !== "undefined") { Object.assign(window, window.Reactive); }`,
  },
  external: [],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      sourceMap: false,
    }),
    terser(),
  ],
};
