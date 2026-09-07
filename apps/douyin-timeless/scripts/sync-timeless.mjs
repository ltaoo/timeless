import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const script_dir = dirname(fileURLToPath(import.meta.url));
const app_dir = resolve(script_dir, "..");
const repository_dir = resolve(app_dir, "../..");
const destination_dir = resolve(app_dir, "public/timeless/current");

const artifacts = [
  ["packages/timeless/dist/timeless.umd.min.js", "timeless.umd.min.js"],
  [
    "packages/timeless-dom/dist/timeless.dom.umd.min.js",
    "timeless.dom.umd.min.js",
  ],
  [
    "packages/provider-web/dist/timeless.web.umd.min.js",
    "timeless.web.umd.min.js",
  ],
];

await mkdir(destination_dir, { recursive: true });
for (const [source, destination] of artifacts) {
  await copyFile(
    resolve(repository_dir, source),
    resolve(destination_dir, destination),
  );
}

console.log("Synced current Timeless browser artifacts.");
