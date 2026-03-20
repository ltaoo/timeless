const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGES_DIR = path.join(ROOT, "packages");

// Parse --filter "!./packages/xxx" from root package.json build script
const rootPkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
);
const buildScript = rootPkg.scripts.build;
const ignorePattern = /--filter\s+"!\.\/packages\/([^"]+)"/g;
const ignored = new Set();
let match;
while ((match = ignorePattern.exec(buildScript)) !== null) {
  ignored.add(match[1]);
}

// Also ignore apps
ignored.add("__apps__"); // placeholder so apps filter logic is separate

console.log("Ignored packages:", [...ignored].filter((x) => x !== "__apps__"));

// Scan packages/, filter out ignored and those without a build script
const packageDirs = fs
  .readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => !ignored.has(name));

const buildTargets = [];
for (const name of packageDirs) {
  const pkgJsonPath = path.join(PACKAGES_DIR, name, "package.json");
  if (!fs.existsSync(pkgJsonPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  if (pkg.scripts && pkg.scripts.build) {
    buildTargets.push({ dir: name, name: pkg.name, version: pkg.version });
  }
}

console.log(
  "Build targets:",
  buildTargets.map((t) => t.dir)
);

// Reconstruct filter args
const filterArgs = [
  '--filter "./packages/*"',
  '--filter "!./apps/*"',
  ...Array.from(ignored)
    .filter((x) => x !== "__apps__")
    .map((x) => `--filter "!./packages/${x}"`),
];

const isProd = process.argv.includes("--prod");
const env = isProd ? "TIMELESS_PROD=1 " : "";

// Run pnpm build with same filters
const cmd = `${env}pnpm ${filterArgs.join(" ")} -r run build`;
console.log(`\nRunning: ${cmd}\n`);
execSync(cmd, { cwd: ROOT, stdio: "inherit", shell: true });

// Read version from first build target
const version = buildTargets[0].version;
const outDir = path.join(ROOT, "dist", "timeless", version);

// Clean output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy *.umd.min.js and *.css from each package's dist/
let copied = 0;
for (const target of buildTargets) {
  const distPath = path.join(PACKAGES_DIR, target.dir, "dist");
  if (!fs.existsSync(distPath)) {
    console.warn(`Warning: ${target.dir}/dist not found, skipping`);
    continue;
  }
  const files = fs
    .readdirSync(distPath)
    .filter((f) => f.endsWith(".umd.min.js") || f.endsWith(".css"));
  if (files.length === 0) {
    console.warn(`Warning: ${target.dir}/dist has no .umd.min.js or .css, skipping`);
    continue;
  }
  for (const file of files) {
    fs.copyFileSync(path.join(distPath, file), path.join(outDir, file));
  }
  copied++;
  console.log(`Copied: ${target.dir} (${files.join(", ")}) -> dist/timeless/${version}/`);
}

console.log(`\nDone! ${copied} packages collected in dist/timeless/${version}/`);
