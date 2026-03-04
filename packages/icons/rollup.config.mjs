import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all .ts files in src except index.ts and d.ts files
const icons = fs
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
    input: "src/index.ts",
    output: [
      {
        file: "dist/timeless.icons.umd.min.js",
        format: "umd",
        name: "Timeless.icons",
        extend: true,
        sourcemap: false,
        globals: {
          "@timeless/reactive": "Timeless.reactive",
        },
      },
    ],
    plugins: [
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
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      }),
      terser(),
    ],
    external: ["@timeless/reactive"],
  },
  // Main CJS and ESM Build
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
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  },
  // Main d.ts Build
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default (args) => {
  // Clear the whole argument to prevent Rollup from complaining about unknown options
  if (args.whole) {
    delete args.whole;
    const whole = true;

    // Individual Icon Builds
    if (whole) {
      icons.forEach((name) => {
        configs.push({
          input: `src/${name}.ts`,
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
          ],
          external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
          ],
        });

        configs.push({
          input: `src/${name}.ts`,
          output: [{ file: `dist/${name}/index.d.ts`, format: "es" }],
          plugins: [dts()],
        });
      });
    }
  }
  return configs;
};
