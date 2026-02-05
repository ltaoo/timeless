import path from "path";
import { fileURLToPath } from "url";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    input: path.join(__dirname, "domains/index.ts"),
    output: {
      file: path.join(__dirname, "dist/timeless.core.d.ts"),
      format: "es",
      footer: "export as namespace Timeless;",
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      dts({
        respectExternal: false,
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "mitt": ["./node_modules/mitt/index.d.ts"],
            "url-parse": ["./node_modules/@types/url-parse/index.d.ts"],
            "@/utils": ["./utils/index.ts"],
            "@/*": ["./*"],
          },
        },
      }),
    ],
  },
];
