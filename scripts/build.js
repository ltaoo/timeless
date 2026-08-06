const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGES_DIR = path.join(ROOT, "packages");
const ROOT_PACKAGE = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
const VERSION = ROOT_PACKAGE.version;
const OUTPUT_PARENT = path.join(ROOT, "dist", "timeless");
const OUTPUT_DIR = path.join(OUTPUT_PARENT, VERSION);

// Keep this order explicit. Several packages resolve workspace package `dist`
// entries during their own build, and timeless/ui-primitive form a cycle. In
// particular ui-primitive must be refreshed before the final timeless bundle.
const BUILD_ORDER = [
  "base",
  "reactive",
  "utils",
  "primitive",
  "ui-vm",
  "kit",
  "icons",
  "ui-primitive",
  "timeless",
  "timeless-dom",
  "provider-web",
  "shadcn",
  "weui",
];

// Browser distribution consumed by wx_channels_download and the web demos.
const ARTIFACTS = [
  ["timeless", "timeless.umd.min.js"],
  ["timeless-dom", "timeless.dom.umd.min.js"],
  ["utils", "timeless.utils.umd.min.js"],
  ["provider-web", "timeless.web.umd.min.js"],
  ["shadcn", "timeless.shadcn.umd.min.js"],
  ["shadcn", "timeless.shadcn.css"],
  ["weui", "timeless.weui.umd.min.js"],
  ["weui", "timeless.weui.css"],
];

const isProd = process.argv.includes("--prod");
const buildEnv = {
  ...process.env,
  ...(isProd ? { TIMELESS_PROD: "1" } : {}),
};

function readPackage(packageDir) {
  const packagePath = path.join(PACKAGES_DIR, packageDir, "package.json");
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Package not found: packages/${packageDir}`);
  }
  return JSON.parse(fs.readFileSync(packagePath, "utf8"));
}

function buildPackage(packageDir, index) {
  const pkg = readPackage(packageDir);
  if (!pkg.scripts?.build) {
    throw new Error(`Missing build script: ${pkg.name || packageDir}`);
  }
  if (pkg.version !== VERSION) {
    throw new Error(
      `Version mismatch: ${pkg.name} is ${pkg.version}, root is ${VERSION}`,
    );
  }

  console.log(
    `\n[${index + 1}/${BUILD_ORDER.length}] Building ${pkg.name} (${packageDir})`,
  );
  const result = spawnSync(
    "pnpm",
    ["--filter", `./packages/${packageDir}`, "run", "build"],
    {
      cwd: ROOT,
      env: buildEnv,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${pkg.name} build failed with exit code ${result.status}`);
  }
}

function collectArtifacts() {
  fs.mkdirSync(OUTPUT_PARENT, { recursive: true });
  const stagingDir = path.join(OUTPUT_PARENT, `.${VERSION}-${process.pid}`);
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });

  const files = [];
  try {
    for (const [packageDir, filename] of ARTIFACTS) {
      const source = path.join(PACKAGES_DIR, packageDir, "dist", filename);
      if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
        throw new Error(
          `Required artifact missing: packages/${packageDir}/dist/${filename}`,
        );
      }
      const destination = path.join(stagingDir, filename);
      fs.copyFileSync(source, destination);
      const bytes = fs.statSync(destination).size;
      files.push({ filename, package: packageDir, bytes });
      console.log(`Collected ${filename} (${(bytes / 1024).toFixed(1)} KiB)`);
    }

    fs.writeFileSync(
      path.join(stagingDir, "manifest.json"),
      `${JSON.stringify(
        {
          name: ROOT_PACKAGE.name,
          version: VERSION,
          production: isProd,
          generatedAt: new Date().toISOString(),
          files,
        },
        null,
        2,
      )}\n`,
    );

    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    fs.renameSync(stagingDir, OUTPUT_DIR);
  } catch (error) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
    throw error;
  }

  console.log(`\nBuild complete: ${path.relative(ROOT, OUTPUT_DIR)}`);
  console.log(`Collected ${files.length} browser artifacts plus manifest.json.`);
}

function main() {
  console.log(
    `Building Timeless ${VERSION}${isProd ? " (production)" : ""}...`,
  );
  BUILD_ORDER.forEach(buildPackage);
  collectArtifacts();
}

try {
  main();
} catch (error) {
  console.error(`\nBuild failed: ${error.message}`);
  process.exitCode = 1;
}
