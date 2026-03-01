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
      file: path.join(__dirname, "dist/timeless.shadcnui.umd.min.js"),
      format: "umd",
      name: "Timeless.shadcnui",
      extend: true,
      globals: {
        "@timeless/reactive": "Timeless.reactive",
        "@timeless/headless": "Timeless.headless",
      },
      footer: `if (typeof window !== "undefined") {
        window.Timeless = window.Timeless || {};
        if (window.Timeless.shadcnui) {
          Object.assign(window, window.Timeless.shadcnui);
        }
      }`,
    },
    {
      file: path.join(__dirname, "dist/timeless.shadcnui.esm.js"),
      format: "es",
    },
  ],
  external: ["@timeless/reactive", "@timeless/headless"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist",
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
