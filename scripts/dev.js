const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.join(rootDir, "packages");
const playgroundDir = path.join(rootDir, "apps/web-vanilla");
// const playgroundDir = path.join(rootDir, "apps/reactive-playground");
const serverRoot = playgroundDir;
const targetDir = path.join(playgroundDir, "public");

// Map of package names to their artifact paths and destination filenames
const artifacts = [
  {
    pkg: "reactive",
    src: "packages/reactive/dist/timeless.reactive.umd.min.js",
    dest: "timeless.reactive.umd.min.js",
  },
  {
    pkg: "ui",
    src: "packages/ui/dist/timeless.ui.umd.min.js",
    dest: "timeless.ui.umd.min.js",
  },
  {
    pkg: "kit",
    src: "packages/kit/dist/timeless.kit.umd.min.js",
    dest: "timeless.kit.umd.min.js",
  },
  {
    pkg: "headless",
    src: "packages/headless/dist/timeless.headless.umd.min.js",
    dest: "timeless.headless.umd.min.js",
  },
  {
    pkg: "icons",
    src: "packages/icons/dist/timeless.icons.umd.min.js",
    dest: "timeless.icons.umd.min.js",
  },
  {
    pkg: "shadcn",
    src: "packages/shadcn/dist/timeless.shadcn.umd.min.js",
    dest: "timeless.shadcn.umd.min.js",
  },
  {
    pkg: "provider-web",
    src: "packages/provider-web/dist/timeless.web.umd.min.js",
    dest: "timeless.web.umd.min.js",
  },
];

// Explicit build dependencies
const buildRelations = {
  reactive: ["headless", "shadcn"],
  kit: ["headless", "shadcn"],
  ui: ["headless", "shadcn"],
  headless: ["icons", "shadcn"],
  icons: ["shadcn"],
};

let buildQueue = null;
let isBuilding = false;
let buildTimeout = null;
const BUILD_TIMEOUT_MS = 120000; // 2 minutes timeout

function copyArtifacts() {
  console.log("Copying artifacts...");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  artifacts.forEach((item) => {
    const srcPath = path.join(rootDir, item.src);
    const destPath = path.join(targetDir, item.dest);
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${item.src} to ${item.dest}`);
      } catch (e) {
        console.error(`Failed to copy ${item.src}:`, e.message);
      }
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
    console.error(`\nBuild timeout after ${BUILD_TIMEOUT_MS / 1000}s, killing process...`);
    child.kill('SIGTERM');
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL');
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
      startDev();
    }
  });

function startServer() {
  // Parse port from command line args
  const portArg = process.argv.find((arg) => arg.startsWith("--port="));
  const port = portArg ? parseInt(portArg.split("=")[1], 10) : 3000;

  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
  };

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const prefix = "/timeless";

    if (parsedUrl.pathname === "/") {
      res.writeHead(302, { Location: prefix + "/" });
      res.end();
      return;
    }

    let targetPath = parsedUrl.pathname;
    if (targetPath.startsWith(prefix)) {
      targetPath = targetPath.slice(prefix.length) || "/";
    } else {
      res.statusCode = 404;
      res.end(`Not found (Path must start with ${prefix})`);
      return;
    }

    let pathname = path.join(serverRoot, targetPath);

    fs.stat(pathname, (err, stats) => {
      if (err) {
        // File not found
        // If it has no extension or is .html, fallback to index.html for SPA routing
        const ext = path.parse(pathname).ext;
        if (!ext || ext === ".html") {
          const indexPath = path.join(serverRoot, "index.html");
          fs.readFile(indexPath, (readErr, data) => {
            if (readErr) {
              res.statusCode = 404;
              res.end(`File ${parsedUrl.pathname} not found!`);
            } else {
              res.setHeader("Content-type", "text/html");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(data);
            }
          });
          return;
        }

        res.statusCode = 404;
        res.end(`File ${parsedUrl.pathname} not found!`);
        return;
      }

      if (stats.isDirectory()) {
        pathname = path.join(pathname, "index.html");
      }

      fs.readFile(pathname, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end(`File ${parsedUrl.pathname} not found!`);
        } else {
          const ext = path.parse(pathname).ext;
          res.setHeader("Content-type", mimeTypes[ext] || "text/plain");
          // Add CORS headers for dev convenience
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(data);
        }
      });
    });
  });

  server.listen(port, () => {
    console.log(`\nStatic server listening on port ${port}`);
    console.log(`Root: ${serverRoot}`);
    console.log(`Url: http://localhost:${port}/timeless/`);
  });
}
