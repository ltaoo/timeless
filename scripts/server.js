const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.join(rootDir, "packages");
const playgroundDir = path.join(rootDir, "apps/web-vanilla");
// const playgroundDir = path.join(rootDir, "apps/reactive-playground");
const serverRoot = playgroundDir;
const targetDir = path.join(playgroundDir, "public");

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

startServer();
