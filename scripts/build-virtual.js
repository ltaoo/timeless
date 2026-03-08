const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ==========================================
// CONFIGURATION
// Define the packages and exports you want to bundle
// ==========================================
const buildConfig = [
  {
    pkg: "@timeless/reactive",
    exports: ["*"], // Use ['*'] for all, or specific exports like ['createSignal', 'createEffect']
  },
  {
    pkg: "@timeless/headless",
    exports: ["Show"],
  },
];
const name = "timeless";
// ==========================================

const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.join(rootDir, "packages");
const virtualDir = path.join(packagesDir, ".virtual-build");

// Validate and process configuration
const targets = [];

for (const config of buildConfig) {
  const pkgName = config.pkg;
  const exportsList = config.exports;

  if (!pkgName || !exportsList || exportsList.length === 0) {
    console.warn(`Skipping invalid config: ${JSON.stringify(config)}`);
    continue;
  }

  // Resolve package directory
  const shortName = pkgName.replace("@timeless/", "");
  const pkgDir = path.join(packagesDir, shortName);

  if (!fs.existsSync(pkgDir)) {
    console.error(`Package directory not found: ${pkgDir}`);
    process.exit(1);
  }

  targets.push({
    pkgName,
    shortName,
    pkgDir,
    exportsList,
  });
}

if (targets.length === 0) {
  console.error("No valid targets to build.");
  process.exit(1);
}

// Prepare virtual directory
console.log(`Cleaning up ${virtualDir}...`);
if (fs.existsSync(virtualDir)) {
  fs.rmSync(virtualDir, { recursive: true, force: true });
}
fs.mkdirSync(virtualDir, { recursive: true });
fs.mkdirSync(path.join(virtualDir, "src"), { recursive: true });

// Create package.json
const pkgJson = {
  name: "@timeless/virtual-build",
  version: "0.0.0",
  type: "module",
};
fs.writeFileSync(
  path.join(virtualDir, "package.json"),
  JSON.stringify(pkgJson, null, 2),
);

// Prepare alias maps for tsconfig and vite
const tsconfigPaths = {
  "@/*": ["./src/*"],
};
const viteAlias = {};

for (const target of targets) {
  const pkgSrcPath = path.join(target.pkgDir, "src/index.ts");
  // Relative path from virtualDir for tsconfig/vite config
  // Ensure POSIX separators for config files
  const relativePkgSrcPath = path
    .relative(virtualDir, pkgSrcPath)
    .split(path.sep)
    .join("/");

  tsconfigPaths[target.pkgName] = [relativePkgSrcPath];
  viteAlias[target.pkgName] = `resolve(__dirname, "${relativePkgSrcPath}")`;
}

// Create tsconfig.json
const tsConfig = {
  compilerOptions: {
    target: "ES2020",
    module: "ESNext",
    moduleResolution: "bundler",
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
    strict: true,
    jsx: "preserve",
    declaration: true,
    declarationDir: "./dist",
    outDir: "./dist",
    baseUrl: ".",
    paths: tsconfigPaths,
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "dist"],
};
fs.writeFileSync(
  path.join(virtualDir, "tsconfig.json"),
  JSON.stringify(tsConfig, null, 2),
);

// Create vite.config.ts
// Generate alias string manually since we need function calls in values (resolve(...))
const aliasEntries = Object.entries(viteAlias)
  .map(([key, value]) => `    "${key}": ${value}`)
  .join(",\n");

const viteConfigContent = `
import { resolve } from "path";
import { createLibConfig } from "../../vite.config.base";

export default createLibConfig({
  entry: resolve(__dirname, "src/index.ts"),
  name: "${name}",
  formats: ["es", "cjs", "umd"],
  dts: false,
  alias: {
${aliasEntries}
  }
});
`;
fs.writeFileSync(path.join(virtualDir, "vite.config.ts"), viteConfigContent);

// Create src/index.ts
let indexContent = "";

for (const target of targets) {
  const { pkgName, exportsList } = target;

  if (exportsList.includes("*")) {
    indexContent += `export * from "${pkgName}";\n`;
  } else {
    // Check if there are named exports
    const namedExports = exportsList.filter((e) => e !== "*");
    if (namedExports.length > 0) {
      indexContent += `export { ${namedExports.join(", ")} } from "${pkgName}";\n`;
    }
  }
}

fs.writeFileSync(path.join(virtualDir, "src/index.ts"), indexContent);

console.log(`Building virtual project with targets:`);
targets.forEach((t) =>
  console.log(` - ${t.pkgName}: ${t.exportsList.join(", ")}`),
);
console.log(`Virtual project created at: ${virtualDir}`);

try {
  // Execute vite build
  const viteBin = path.join(rootDir, "node_modules", ".bin", "vite");
  execSync(`${viteBin} build`, { cwd: virtualDir, stdio: "inherit" });
  console.log("Build successful!");
  console.log(`Artifacts are in: ${path.join(virtualDir, "dist")}`);
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
