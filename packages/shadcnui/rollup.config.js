import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: path.join(__dirname, "src/index.ts"),
  output: {
    file: path.join(__dirname, "dist/shadcnui.umd.min.js"),
    format: "umd",
    name: "ShadcnUI",
    globals: {
      "@timeless/reactive": "Reactive",
      "@timeless/headless": "Headless",
    },
    footer: `if (typeof window !== "undefined") { Object.assign(window, window.ShadcnUI); }`,
  },
  external: ["@timeless/reactive", "@timeless/headless"],
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
