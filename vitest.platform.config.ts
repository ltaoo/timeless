import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const aliases: Record<string, string> = {};
for (const name of readdirSync(resolve(__dirname, "packages"))) {
  const dir = resolve(__dirname, "packages", name);
  if (
    existsSync(resolve(dir, "package.json")) &&
    existsSync(resolve(dir, "src/index.ts"))
  ) {
    aliases[
      JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8")).name
    ] = resolve(dir, "src/index.ts");
  }
}

export default defineConfig({
  define: { __Version: JSON.stringify("test") },
  resolve: { alias: aliases },
  plugins: [
    {
      name: "workspace-source-paths",
      enforce: "pre",
      resolveId(source, importer) {
        if (!source.startsWith("@/") || !importer) return null;
        const name = importer.match(/\/packages\/([^/]+)\//)?.[1];
        if (!name) return null;
        const path = resolve(
          __dirname,
          "packages",
          name,
          "src",
          source.slice(2),
        );
        return (
          [path, `${path}.ts`, resolve(path, "index.ts")].find(
            (candidate) =>
              existsSync(candidate) && statSync(candidate).isFile(),
          ) || null
        );
      },
    },
  ],
  test: {
    globals: true,
    include: [
      "packages/provider-web/src/__tests__/*.test.ts",
      "packages/timeless-dom/src/__tests__/html.test.ts",
      "packages/timeless-dom/src/__tests__/hydration.test.ts",
      "packages/timeless-dom/src/__tests__/text-range.test.ts",
      "packages/kit/src/audio/__tests__/*.test.ts",
      "packages/kit/src/http_client/__tests__/*.test.ts",
      "packages/kit/src/request/__tests__/*.test.ts",
    ],
  },
});
