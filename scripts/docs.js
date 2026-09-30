const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { startStaticServer } = require("./lib/static-server");

/**
 * 各样式库文档站启动器。
 *
 * 用法（在 packages/<lib>/ 下，或根目录用 --lib=）：
 *   pnpm --filter ./packages/<lib> run docs
 *   pnpm docs -- --lib=<lib> [--port=<n>] [--watch]
 *
 * 行为：产物缺失/过期 → 先构建（复用 dev.js --build）；否则直接起静态服务。
 * `--watch` 交给 dev.js（它自带 buildAll + packages/ *\/src 监听 + 静态服务）。
 *
 * 单一事实来源：lib → app → port 的映射只写在下面这张表里。
 */

const rootDir = path.resolve(__dirname, "..");
const devJs = path.join(rootDir, "scripts", "dev.js");

const DOC_SITES = {
  shadcn: { app: "web-shadcn", port: 3400 },
  bootstrap: { app: "web-bootstrap", port: 3401 },
  material: { app: "web-material", port: 3402 },
  fluent: { app: "web-fluent", port: 3403 },
  animal: { app: "web-animal", port: 3404 },
  weui: { app: "web-weui", port: 3405 },
};

const LIB_NAMES = Object.keys(DOC_SITES);

/** 这些包的 src/dist 变化会让某个 lib 的产物过期。 */
const ARTIFACT_PACKAGES = [
  "timeless",
  "shadcn",
  "weui",
  "bootstrap",
  "material",
  "fluent",
  "animal",
  "timeless-dom",
  "provider-web",
  "utils",
];

function usage() {
  const lines = LIB_NAMES.map(
    (lib) => `  --lib=${lib.padEnd(10)} → ${DOC_SITES[lib].app} (port ${DOC_SITES[lib].port})`,
  );
  console.log(
    [
      "用法：node scripts/docs.js --lib=<lib> [--port=<n>] [--watch]",
      "也可在 packages/<lib>/ 下运行（lib 从该包名推断）。",
      "",
      "可用的库：",
      ...lines,
    ].join("\n"),
  );
}

function resolveLib() {
  const libArg = process.argv.find((arg) => arg.startsWith("--lib="));
  if (libArg) return libArg.split("=").slice(1).join("=");

  // 包脚本的 cwd 是 packages/<lib>，从包名推断（app 目录名与包名并不总是一致，
  // 例如 @timeless/shadcn 的 app 是 apps/web-shadcn）。
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
    );
    return String(pkg.name || "").replace(/^@timeless\//, "");
  } catch {
    return "";
  }
}

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else out.push(p);
    }
  };
  walk(dir);
  return out;
}

function newestMtime(dir) {
  let newest = 0;
  for (const f of listFiles(dir)) {
    try {
      const m = fs.statSync(f).mtimeMs;
      if (m > newest) newest = m;
    } catch {}
  }
  return newest;
}

/**
 * 产物是否过期：publicDir 缺失、dist 里有文件没拷过去、或
 * 「任一相关源码/dist 比「最旧的产物」还新」。
 */
function isStale(app, version) {
  const publicDir = path.join(rootDir, "apps", app, "public", "timeless", version);
  const distDir = path.join(rootDir, "dist", "timeless", version);

  if (!fs.existsSync(publicDir)) return true;

  const publicFiles = listFiles(publicDir);
  const publicSet = new Set(publicFiles.map((f) => path.relative(publicDir, f)));
  for (const f of listFiles(distDir)) {
    if (!publicSet.has(path.relative(distDir, f))) return true;
  }

  let newestSource = 0;
  for (const pkg of ARTIFACT_PACKAGES) {
    for (const sub of ["src", "dist"]) {
      newestSource = Math.max(
        newestSource,
        newestMtime(path.join(rootDir, "packages", pkg, sub)),
      );
    }
  }

  let oldestArtifact = Infinity;
  for (const f of publicFiles) {
    try {
      oldestArtifact = Math.min(oldestArtifact, fs.statSync(f).mtimeMs);
    } catch {}
  }
  if (oldestArtifact === Infinity) return true;

  return newestSource > oldestArtifact;
}

function build(app) {
  console.log(`Artifacts are missing or out of date for ${app}, building...`);
  const res = spawnSync(process.execPath, [devJs, `--app=${app}`, "--build"], {
    cwd: rootDir,
    stdio: "inherit",
  });
  if (res.status !== 0) {
    console.error(`Build failed with code ${res.status}.`);
    process.exit(res.status || 1);
  }
}

function main() {
  const lib = resolveLib();
  const site = DOC_SITES[lib];
  if (!site) {
    console.error(lib ? `未知的库：${lib}` : "无法确定要启动哪个库。");
    usage();
    process.exit(1);
  }

  const portArg = process.argv.find((arg) => arg.startsWith("--port="));
  const port = portArg ? parseInt(portArg.split("=")[1], 10) : site.port;
  const watch = process.argv.includes("--watch");

  const version = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, "packages", "reactive", "package.json"),
      "utf-8",
    ),
  ).version;

  if (watch) {
    // dev.js 启动即 buildAll() + 监听 packages/*/src + 起静态服务，
    // 直接交给它，避免我们这边再构建一遍。
    spawn(
      process.execPath,
      [devJs, `--app=${site.app}`, `--port=${port}`],
      { cwd: rootDir, stdio: "inherit" },
    );
    return;
  }

  if (isStale(site.app, version)) build(site.app);

  startStaticServer({
    root: path.join(rootDir, "apps", site.app),
    prefix: "/",
    port,
    // dev.js 的 MIME 表不含 .woff2 / .mjs；docs 站需要它们（animal 的字体）。
    extraMimeTypes: { ".woff2": "font/woff2", ".mjs": "text/javascript" },
  });
}

main();
