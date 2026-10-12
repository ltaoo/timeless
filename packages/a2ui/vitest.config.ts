import { defineConfig, mergeConfig } from "vitest/config";
import workspace from "../ui-renderer/vitest.config";
import { fileURLToPath } from "node:url";
export default mergeConfig(
  workspace,
  defineConfig({
    cacheDir: fileURLToPath(new URL("./node_modules/.cache", import.meta.url)),
    test: { silent: true },
  }),
);
