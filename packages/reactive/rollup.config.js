import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  input: path.join(__dirname, "src/index.ts"),
  output: [
    {
      file: path.join(__dirname, "dist/timeless.reactive.umd.min.js"),
      format: "umd",
      name: "Timeless.reactive",
      globals: {},
      footer: `if (typeof window !== "undefined") { Object.assign(window, window.Timeless.reactive); }`,
    },
    {
      file: path.join(__dirname, "dist/timeless.reactive.esm.js"),
      format: "es",
    },
  ],
  external: [],
  plugins: [
    typescript({
      compilerOptions: {
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    }),
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

export default (args) => {
  if (args.whole) delete args.whole;
  return config;
};
