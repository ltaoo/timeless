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
// entries during their own build, so dependencies must be refreshed before
// their consumers.
const BUILD_ORDER = [
  "base",
  "reactive",
  "utils",
  "primitive",
  "lite",
  "ui-vm",
  "kit",
  "icons",
  "ui-primitive",
  "timeless",
  "timeless-dom",
  "provider-web",
  "shadcn",
  "weui",
  "bootstrap",
  "material",
  "fluent",
  "animal",
  "findrssui",
];

// Browser distribution consumed by wx_channels_download and the web demos.
const ARTIFACTS = [
  ["timeless", "timeless.umd.min.js", "bundle-analysis.json"],
  ["lite", "timeless.lite.umd.min.js", "bundle-analysis.json"],
  ["utils", "timeless.utils.umd.min.js", "bundle-analysis.json"],
  ["timeless-dom", "timeless.dom.umd.min.js"],
  ["provider-web", "timeless.web.umd.min.js"],
  ["shadcn", "timeless.shadcn.umd.min.js"],
  ["shadcn", "timeless.shadcn.css"],
  ["weui", "timeless.weui.umd.min.js"],
  ["weui", "timeless.weui.css"],
  ["bootstrap", "timeless.bootstrap.umd.min.js"],
  ["bootstrap", "timeless.bootstrap.css"],
  ["material", "timeless.material.umd.min.js"],
  ["material", "timeless.material.css"],
  ["fluent", "timeless.fluent.umd.min.js"],
  ["fluent", "timeless.fluent.css"],
  ["animal", "timeless.animal.umd.min.js"],
  ["animal", "timeless.animal.css"],
  // animal 的 webfont 子集是**独立文件**（vite 的 lib 模式默认会把资源内联成
  // base64，靠 fonts.css 里的 `?no-inline` 关掉了），必须随 CSS 一起发布：
  // 产物平铺在 dist 根，CSS 用 url("./animal-*.woff2") 相对引用。
  // 两族各一个可变字体（wght 轴），见 packages/animal/src/style/fonts.css。
  ["animal", "animal-nunito.woff2"],
  ["animal", "animal-noto.woff2"],
  ["findrssui", "timeless.findrssui.umd.min.js"],
  ["findrssui", "timeless.findrssui.css"],
];

// Each profile is a valid browser loading combination. The full and lite
// bundles are alternatives, so cross-profile overlap is intentional.
const LOAD_PROFILES = {
  full: [
    "timeless.umd.min.js",
    "timeless.dom.umd.min.js",
    "timeless.web.umd.min.js",
    "timeless.shadcn.umd.min.js",
    "timeless.weui.umd.min.js",
  ],
  lite: ["timeless.lite.umd.min.js", "timeless.dom.umd.min.js"],
  lite_with_utils: ["timeless.lite.umd.min.js", "timeless.utils.umd.min.js"],
  // Scoped style libraries. They are mutually exclusive with the global
  // shadcn/weui bundles, so they stay out of `full` on purpose. The four of
  // them *can* load together (attribute-scoped CSS, no shared globals), which
  // makes this the strongest duplicate-dependency check.
  style_libs: [
    "timeless.dom.umd.min.js",
    "timeless.web.umd.min.js",
    "timeless.bootstrap.umd.min.js",
    "timeless.material.umd.min.js",
    "timeless.fluent.umd.min.js",
    "timeless.animal.umd.min.js",
  ],
  // findrss-reader 自有组件库。它的 CSS 没有 `*` / `body` 级重置，只在
  // `:root` 上挂 `--frui-*`，因此与 shadcn/weui 不冲突；这里只作**清单记录**，
  // 不进 `full`（不是核心加载面）。
  findrssui: [
    "timeless.umd.min.js",
    "timeless.dom.umd.min.js",
    "timeless.web.umd.min.js",
    "timeless.findrssui.umd.min.js",
  ],
};

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
    for (const [packageDir, filename, analysis] of ARTIFACTS) {
      const source = path.join(PACKAGES_DIR, packageDir, "dist", filename);
      if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
        throw new Error(
          `Required artifact missing: packages/${packageDir}/dist/${filename}`,
        );
      }
      const destination = path.join(stagingDir, filename);
      fs.copyFileSync(source, destination);
      const bytes = fs.statSync(destination).size;
      files.push({
        filename,
        package: packageDir,
        bytes,
        ...(analysis ? { analysis } : {}),
      });
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
          load_profiles: LOAD_PROFILES,
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
  console.log(
    `Collected ${files.length} browser artifacts plus manifest.json.`,
  );
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
