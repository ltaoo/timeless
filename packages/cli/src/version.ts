import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, "..", "package.json");

let VERSION = "0.0.0";
try {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  VERSION = pkg.version;
} catch (e) {
  // Use fallback version if package.json not found
}

export { VERSION };
export default VERSION;
