import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import alias from "@rollup/plugin-alias";
import { dts } from "rollup-plugin-dts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    external: ["solid-js", "solid-js/web", "solid-js/store", /@timeless\/domains/],
    plugins: [
      alias({
        entries: [
          { find: "@/domains", replacement: path.resolve(__dirname, "../../packages/domains/src") },
          { find: "@/biz", replacement: path.resolve(__dirname, "../../packages/biz/src") },
          { find: "@", replacement: path.resolve(__dirname, "src") },
        ],
      }),
      resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      }),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        presets: ["solid", "@babel/preset-typescript"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        exclude: "node_modules/**",
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // We use rollup-plugin-dts for declaration files
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
