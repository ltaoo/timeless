const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const {
  startStaticServer,
  normalizePrefix,
} = require("./lib/static-server");

const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.join(rootDir, "packages");

// Playground app selection. Defaults to web-shadcn; override with
// `pnpm dev --app=web-bootstrap` (or web-material / web-fluent / web-weui …).
const appArg = process.argv.slice(2).find((arg) => arg.startsWith("--app="));
const playgroundApp = appArg ? appArg.split("=").slice(1).join("=") : "web-shadcn";
const playgroundDir = path.join(rootDir, "apps", playgroundApp);
const serverRoot = playgroundDir;
const AssetServerPrefix = "/";
const NormalizedAssetServerPrefix = normalizePrefix(AssetServerPrefix);

// Read version from first build target's package.json
const version = JSON.parse(
  fs.readFileSync(path.join(packagesDir, "reactive", "package.json"), "utf-8"),
).version;

const distDir = path.join(rootDir, "dist", "timeless", version);
const publicDir = path.join(playgroundDir, "public", "timeless", version);

// Map of package names to their artifact paths and destination filenames
const artifacts = [
  {
    pkg: "timeless",
    src: "packages/timeless/dist/timeless.umd.min.js",
    dest: "timeless.umd.min.js",
  },
  {
    pkg: "shadcn",
    src: "packages/shadcn/dist/timeless.shadcn.umd.min.js",
    dest: "timeless.shadcn.umd.min.js",
  },
  {
    pkg: "weui",
    src: "packages/weui/dist/timeless.weui.umd.min.js",
    dest: "timeless.weui.umd.min.js",
  },
  {
    pkg: "bootstrap",
    src: "packages/bootstrap/dist/timeless.bootstrap.umd.min.js",
    dest: "timeless.bootstrap.umd.min.js",
  },
  {
    pkg: "material",
    src: "packages/material/dist/timeless.material.umd.min.js",
    dest: "timeless.material.umd.min.js",
  },
  {
    pkg: "fluent",
    src: "packages/fluent/dist/timeless.fluent.umd.min.js",
    dest: "timeless.fluent.umd.min.js",
  },
  {
    pkg: "animal",
    src: "packages/animal/dist/timeless.animal.umd.min.js",
    dest: "timeless.animal.umd.min.js",
  },
  {
    pkg: "timeless-dom",
    src: "packages/timeless-dom/dist/timeless.dom.umd.min.js",
    dest: "timeless.dom.umd.min.js",
  },
  {
    pkg: "provider-web",
    src: "packages/provider-web/dist/timeless.web.umd.min.js",
    dest: "timeless.web.umd.min.js",
  },
  // {
  //   pkg: "a2ui",
  //   src: "packages/a2ui/dist/timeless.a2ui.umd.min.js",
  //   dest: "timeless.a2ui.umd.min.js",
  // },
  {
    pkg: "utils",
    src: "packages/utils/dist/timeless.utils.umd.min.js",
    dest: "timeless.utils.umd.min.js",
  },
];

// Explicit build dependencies
const buildRelations = {
  base: ["timeless"],
  reactive: ["timeless"],
  // utils: ["timeless"],
  kit: ["timeless"],
  "ui-primitive": ["timeless"],
  "ui-vm": ["timeless"],
  // shadcn: ["timeless"],
  // icons: ["timeless"],
  primitive: ["timeless"],
  timeless: [
    "shadcn",
    "weui",
    "bootstrap",
    "material",
    "fluent",
    "animal",
    "timeless-dom",
  ],
};

let buildQueue = null;
let isBuilding = false;
let buildTimeout = null;
const BUILD_TIMEOUT_MS = 120000; // 2 minutes timeout

function copyArtifacts() {
  console.log("Copying artifacts...");

  // Ensure both output directories exist
  for (const dir of [distDir, publicDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Clean up unrelated artifacts, keep only the whitelisted files
  const keepFiles = new Set([
    "timeless.umd.min.js",
    "timeless.dom.umd.min.js",
    "timeless.shadcn.umd.min.js",
    "timeless.shadcn.css",
    "timeless.weui.umd.min.js",
    "timeless.weui.css",
    "timeless.bootstrap.umd.min.js",
    "timeless.bootstrap.css",
    "timeless.material.umd.min.js",
    "timeless.material.css",
    "timeless.fluent.umd.min.js",
    "timeless.fluent.css",
    "timeless.animal.umd.min.js",
    "timeless.animal.css",
    // animal 的 webfont（两族各一个可变字体）。**必须列在这里**：copyArtifacts
    // 会删除 dist/timeless/<ver>/ 与 public/timeless/<ver>/ 里所有不在白名单的
    // 文件，漏了会表现为「本地打开没字体、重新构建又好一阵」。
    "animal-nunito.woff2",
    "animal-noto.woff2",
    "timeless.web.umd.min.js",
  ]);
  for (const dir of [distDir, publicDir]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!keepFiles.has(f)) {
        try {
          fs.unlinkSync(path.join(dir, f));
        } catch {}
      }
    }
  }

  // Also copy CSS files (and their sibling webfonts) from each package's dist/
  const assetFiles = [];
  const cssWhitelist = new Set([
    "shadcn",
    "weui",
    "bootstrap",
    "material",
    "fluent",
    "animal",
  ]);
  // animal 的 CSS 用 url("./animal-*.woff2") 相对引用同层平铺的字体子集。
  // 只拷 .css 不拷 .woff2，画廊里就会「样式对、字体错（掉到系统字体）」，
  // 而且因为 keepFiles 白名单拦住删除，现象只在浏览器里看得出来。
  const cssAssetExts = [".css", ".woff2"];
  for (const pkg of cssWhitelist) {
    const pkgDist = path.join(packagesDir, pkg, "dist");
    if (!fs.existsSync(pkgDist)) continue;
    fs.readdirSync(pkgDist)
      .filter((f) => cssAssetExts.some((ext) => f.endsWith(ext)))
      .forEach((f) => assetFiles.push({ src: path.join(pkgDist, f), dest: f }));
  }

  // Copy JS artifacts
  artifacts.forEach((item) => {
    const srcPath = path.join(rootDir, item.src);
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, path.join(distDir, item.dest));
        fs.copyFileSync(srcPath, path.join(publicDir, item.dest));
        console.log(
          `Copied ${item.src} -> dist/timeless/${version}/ & public/timeless/${version}/`,
        );
      } catch (e) {
        console.error(`Failed to copy ${item.src}:`, e.message);
      }
    }
  });

  // Copy CSS + webfont files
  assetFiles.forEach(({ src, dest }) => {
    try {
      fs.copyFileSync(src, path.join(distDir, dest));
      fs.copyFileSync(src, path.join(publicDir, dest));
      console.log(
        `Copied asset ${dest} -> dist/timeless/${version}/ & public/timeless/${version}/`,
      );
    } catch (e) {
      console.error(`Failed to copy asset ${dest}:`, e.message);
    }
  });
}

function buildAll() {
  return new Promise((resolve, reject) => {
    console.log("Building all artifacts...");

    const filters = artifacts.map((a) => `./packages/${a.pkg}...`);
    const uniqueFilters = [...new Set(filters)];
    const args = [...uniqueFilters.flatMap((f) => ["--filter", f]), "build"];

    const child = spawn("pnpm", args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("Initial build success.");
        copyArtifacts();
        resolve();
      } else {
        reject(new Error(`Initial build failed with code ${code}`));
      }
    });
  });
}

function runBuild(pkgName) {
  if (isBuilding) {
    // If already building, queue this package (replace any existing queued package)
    // We only keep the latest request to avoid build storms
    if (buildQueue !== pkgName) {
      console.log(`Queuing build for ${pkgName}...`);
      buildQueue = pkgName;
    }
    return;
  }
  isBuilding = true;
  console.log(`\nTriggered by change in @timeless/${pkgName}`);
  console.log(`Building @timeless/${pkgName} and its dependents...`);

  // Use pnpm filter to build package and dependents
  // Filter syntax: ./packages/<pkg>...
  // This builds the package and everything that depends on it
  const targets = new Set([pkgName]);
  const queue = [pkgName];

  while (queue.length > 0) {
    const current = queue.shift();
    if (buildRelations[current]) {
      buildRelations[current].forEach((dep) => {
        if (!targets.has(dep)) {
          targets.add(dep);
          queue.push(dep);
          console.log(
            `Also triggering build for ${dep} due to explicit relation`,
          );
        }
      });
    }
  }

  const filters = Array.from(targets).map((t) => `./packages/${t}...`);

  const args = [...filters.flatMap((f) => ["--filter", f]), "build"];

  const child = spawn("pnpm", args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  // Set timeout to kill build if it takes too long
  buildTimeout = setTimeout(() => {
    console.error(
      `\nBuild timeout after ${BUILD_TIMEOUT_MS / 1000}s, killing process...`,
    );
    child.kill("SIGTERM");
    setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }, 5000);
  }, BUILD_TIMEOUT_MS);

  child.on("close", (code) => {
    if (buildTimeout) {
      clearTimeout(buildTimeout);
      buildTimeout = null;
    }
    isBuilding = false;
    if (code === 0) {
      console.log("Build success.");
      copyArtifacts();
    } else {
      console.error("Build failed with code", code);
    }

    if (buildQueue) {
      const nextPkg = buildQueue;
      buildQueue = null;
      // Small delay to let system settle
      setTimeout(() => runBuild(nextPkg), 100);
    }
  });
}

let debounceTimer = null;
function triggerBuild(pkgName) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runBuild(pkgName);
  }, 1000); // 1s debounce to capture multiple file saves
}

function startDev() {
  console.log(`Watching packages in ${packagesDir}...`);

  try {
    const packages = fs.readdirSync(packagesDir).filter((f) => {
      return fs.statSync(path.join(packagesDir, f)).isDirectory();
    });

    packages.forEach((pkg) => {
      const pkgPath = path.join(packagesDir, pkg);
      const srcPath = path.join(pkgPath, "src");

      // Only watch if src exists
      if (fs.existsSync(srcPath)) {
        console.log(`Watching @timeless/${pkg}`);
        // Watch src directory recursively
        fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
          if (
            filename &&
            !filename.includes(".git") &&
            !filename.includes("node_modules")
          ) {
            triggerBuild(pkg);
          }
        });
      }
    });

    startServer();
  } catch (err) {
    console.error("Error setting up watchers:", err);
  }
}

// Main execution
const args = process.argv.slice(2);
const isBuildOnly = args.includes("--build");
const isProd = args.includes("--prod");

if (isProd) {
  process.env.TIMELESS_PROD = "1";
  console.log("Production mode: minify + drop console.log");
}

buildAll()
  .then(() => {
    if (isBuildOnly) {
      console.log("Build only mode completed.");
      process.exit(0);
    } else {
      startDev();
    }
  })
  .catch((err) => {
    console.error(err);
    if (isBuildOnly) {
      process.exit(1);
    } else {
      console.log("Initial build failed, starting watchers anyway...");
      copyArtifacts();
      startDev();
    }
  });

function startServer() {
  // Parse port from command line args
  const portArg = process.argv.find((arg) => arg.startsWith("--port="));
  const port = portArg ? parseInt(portArg.split("=")[1], 10) : 3000;

  startStaticServer({
    root: serverRoot,
    prefix: NormalizedAssetServerPrefix,
    port,
  });
}
