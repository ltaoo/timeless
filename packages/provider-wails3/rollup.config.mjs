import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json"));

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
        file: "dist/index.mjs",
        format: "es",
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
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/timeless.wails3.umd.min.js",
      format: "umd",
      name: "Timeless.wails3",
      globals: {
        "@timeless/reactive": "Timeless.reactive",
        "@timeless/headless": "Timeless.headless",
        "@timeless/kit": "Timeless",
        "@timeless/ui": "Timeless.ui",
      },
      sourcemap: true,
    },
    external: [
      "@timeless/reactive",
      "@timeless/headless",
      "@timeless/kit",
      "@timeless/ui",
    ],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
];

export default (args) => {
  if (args.whole) delete args.whole;
  return config;
};
