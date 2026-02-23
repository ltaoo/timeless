const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const domainsDir = path.join(rootDir, "domains");
const srcFile = path.join(rootDir, "dist", "timeless.core.umd.min.js");
const destFile = path.join(
  rootDir,
  "platform",
  "vanilla",
  "public",
  "timeless.core.umd.min.js"
);

if (!fs.existsSync(domainsDir)) {
  console.error("domains 目录不存在:", domainsDir);
  process.exit(1);
}

let isBuilding = false;
let pendingBuild = false;
let debounceTimer = null;

function queueBuild(reason) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    startBuild(reason);
  }, 300);
}

function startBuild(reason) {
  if (isBuilding) {
    pendingBuild = true;
    return;
  }

  isBuilding = true;
  console.log("检测到 domains 变更，开始执行 pnpm build", reason || "");

  const buildProc = spawn("pnpm", ["build"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  buildProc.on("exit", async (code) => {
    if (code === 0) {
      try {
        await copyBundle();
        console.log("已更新:", destFile);
      } catch (err) {
        console.error("移动构建产物失败:", err);
      }
    } else {
      console.error("pnpm build 执行失败，退出码:", code);
    }

    isBuilding = false;

    if (pendingBuild) {
      pendingBuild = false;
      startBuild("pending");
    }
  });
}

async function copyBundle() {
  await fs.promises.mkdir(path.dirname(destFile), { recursive: true });

  try {
    await fs.promises.copyFile(srcFile, destFile);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("找不到构建产物:", srcFile);
    }
    throw err;
  }
}

function startWatch() {
  console.log("开始监听目录:", domainsDir);

  const watcher = fs.watch(
    domainsDir,
    {
      recursive: true,
    },
    (eventType, filename) => {
      const name = filename || "";
      console.log("文件变更:", eventType, name);
      queueBuild(`${eventType} ${name}`);
    }
  );

  process.on("SIGINT", () => {
    console.log("收到中断信号，停止监听");
    watcher.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("收到终止信号，停止监听");
    watcher.close();
    process.exit(0);
  });
}

const port = parseInt(process.argv[2], 10) || 3000;
const vanillaDir = path.join(rootDir, "platform", "vanilla");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function startServer() {
  http
    .createServer(async (req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0]);
      let filePath = path.join(vanillaDir, urlPath);
      const indexFile = path.join(vanillaDir, "index.html");

      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
      } catch {}

      try {
        const data = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        const ext = path.extname(urlPath);
        if (!ext || ext === ".html") {
          try {
            const data = await fs.promises.readFile(indexFile);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
            return;
          } catch {}
        }
        res.writeHead(404);
        res.end("Not Found");
      }
    })
    .listen(port, () => {
      console.log(`开发服务已启动: http://localhost:${port}`);
    });
}

startServer();
startWatch();
