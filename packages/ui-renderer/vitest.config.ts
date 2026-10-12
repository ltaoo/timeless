import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL("../../", import.meta.url));
const aliases: Record<string, string> = {};
for (const directory of readdirSync(resolve(root, "packages"))) {
  const base = resolve(root, "packages", directory);
  if (
    existsSync(resolve(base, "package.json")) &&
    existsSync(resolve(base, "src/index.ts"))
  ) {
    const pkg = JSON.parse(readFileSync(resolve(base, "package.json"), "utf8"));
    aliases[pkg.name] = resolve(base, "src/index.ts");
  }
}
export default defineConfig({
  cacheDir: resolve(root, "packages/ui-renderer/node_modules/.cache"),
  define: { __Version: JSON.stringify("test") },
  resolve: { alias: aliases },
  plugins: [
    {
      name: "workspace-source-paths",
      enforce: "pre",
      resolveId(source, importer) {
        if (!source.startsWith("@/") || !importer) return null;
        const directory = importer.match(/\/packages\/([^/]+)\//)?.[1];
        if (!directory) return null;
        const file = resolve(
          root,
          "packages",
          directory,
          "src",
          source.slice(2),
        );
        return (
          [file, `${file}.ts`, resolve(file, "index.ts")].find(
            (candidate) =>
              existsSync(candidate) && statSync(candidate).isFile(),
          ) ?? null
        );
      },
    },
  ],
  test: { globals: true, include: ["src/__tests__/*.test.ts"] },
});
