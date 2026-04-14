import { resolve } from "path";

import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.js"),
  name: "app",
  globalName: "App",
  formats: ["umd"],
  fileName: () => "app.js",
  minify: true,
  dts: false,
});
