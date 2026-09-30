const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");

/**
 * 静态服务器：从 scripts/dev.js 抽出，供 dev.js 与 scripts/docs.js 共用。
 *
 * 行为与抽取前逐字节一致（路由、状态码、SPA 回退、CORS、MIME 查表、日志），
 * 见 THEME_PACKAGE_GUIDE.md §8.4。
 */

// MIME 表刻意保持与原 dev.js 相同：**不含** .woff2 / .mjs。
// docs.js 通过 extraMimeTypes 自行补齐，dev.js 不传，因此 dev.js 行为不变。
const DEFAULT_MIME_TYPES = {
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

/** 规整 URL 前缀："" / "/" → "/"，其余补前导斜杠、去尾随斜杠。 */
function normalizePrefix(raw) {
  const s = String(raw || "").trim();
  if (!s || s === "/") return "/";
  const withLeadingSlash = s.startsWith("/") ? s : `/${s}`;
  const withoutTrailingSlashes = withLeadingSlash.replace(/\/+$/, "");
  return withoutTrailingSlashes || "/";
}

/**
 * @param {object} options
 * @param {string} options.root      静态根目录
 * @param {string} [options.prefix]  URL 前缀，默认 "/"
 * @param {object} [options.mimeTypes]      基础 MIME 表
 * @param {object|null} [options.extraMimeTypes] 仅在传入时覆盖基础表
 */
function createStaticServer({
  root,
  prefix = "/",
  mimeTypes = DEFAULT_MIME_TYPES,
  extraMimeTypes = null,
}) {
  const serverRoot = root;
  const NormalizedAssetServerPrefix = normalizePrefix(prefix);
  const types = extraMimeTypes ? { ...mimeTypes, ...extraMimeTypes } : mimeTypes;

  return http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);

    const pathPrefix = NormalizedAssetServerPrefix;
    const requestPath = parsedUrl.pathname || "/";

    if (pathPrefix !== "/") {
      if (requestPath === "/") {
        res.writeHead(302, { Location: `${pathPrefix}/` });
        res.end();
        return;
      }

      if (requestPath === pathPrefix) {
        res.writeHead(302, { Location: `${pathPrefix}/` });
        res.end();
        return;
      }
    }

    let relativePath = requestPath;
    if (pathPrefix !== "/") {
      if (relativePath === pathPrefix) {
        relativePath = "";
      } else if (relativePath.startsWith(`${pathPrefix}/`)) {
        relativePath = relativePath.slice(pathPrefix.length);
      } else {
        res.statusCode = 404;
        res.end(`Not found (Path must start with ${pathPrefix})`);
        return;
      }
    }

    relativePath = relativePath.replace(/^\/+/, "");
    let pathname = path.normalize(path.join(serverRoot, relativePath));
    if (!pathname.startsWith(serverRoot)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

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
          res.setHeader("Content-type", types[ext] || "text/plain");
          // Add CORS headers for dev convenience
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(data);
        }
      });
    });
  });
}

/** createStaticServer + listen，日志与 dev.js:502-506 逐字一致。 */
function startStaticServer({ root, prefix = "/", port, ...opts }) {
  const server = createStaticServer({ root, prefix, ...opts });
  server.listen(port, () => {
    console.log(`\nStatic server listening on port ${port}`);
    console.log(`Root: ${root}`);
    console.log(`Url: http://127.0.0.1:${port}${normalizePrefix(prefix)}/`);
  });
  return server;
}

module.exports = {
  DEFAULT_MIME_TYPES,
  normalizePrefix,
  createStaticServer,
  startStaticServer,
};
