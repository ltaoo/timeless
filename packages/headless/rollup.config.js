import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
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
      },
      footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless.headless) {
          Object.assign(window, window.Timeless.headless);
        }
      }`,
    },
    {
      file: path.join(__dirname, "dist/timeless.headless.esm.js"),
      format: "es",
    },
  ],
  external: ["@timeless/reactive", "@timeless/kit"],
  plugins: [
    typescript(),
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
