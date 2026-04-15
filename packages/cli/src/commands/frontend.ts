import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { WebSocketServer, type WebSocket } from "ws";

export interface FrontendOptions {
  port: number;
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "application/font-woff",
  ".woff2": "font/woff2",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

const HMR_CLIENT_SCRIPT = `
<script>
(function() {
  var hotModules = {};

  globalThis.__hmr_createHot__ = function(path) {
    var existing = hotModules[path];
    var data = existing ? existing.data : {};
    var hot = {
      data: data,
      _acceptCb: existing ? existing._acceptCb : null,
      _disposeCb: existing ? existing._disposeCb : null,
      accept: function(cb) {
        hot._acceptCb = cb;
      },
      dispose: function(cb) {
        hot._disposeCb = cb;
      }
    };
    hotModules[path] = hot;
    return hot;
  };

  var protocol = location.protocol === "https:" ? "wss:" : "ws:";
  var reconnectTimer = null;

  function handleMessage(event) {
    var data;
    try { data = JSON.parse(event.data); } catch(e) { return; }

    if (data.type === "update") {
      var fsPath = data.path;
      var hot = hotModules[fsPath];
      if (!hot || !hot._acceptCb) {
        console.log("[HMR] No accept handler for " + fsPath + ", reloading page");
        location.reload();
        return;
      }
      if (hot._disposeCb) {
        try { hot._disposeCb(hot.data); } catch(e) {
          console.error("[HMR] dispose error:", e);
        }
      }
      console.log("[HMR] Updated " + fsPath);
      import("./" + fsPath + "?t=" + Date.now()).then(function(mod) {
        try {
          hot._acceptCb(mod);
        } catch(err) {
          console.error("[HMR] accept error:", err);
          location.reload();
        }
      }).catch(function(err) {
        console.error("[HMR] Failed to reload module:", err);
        location.reload();
      });
    } else if (data.type === "css-update") {
      var links = document.querySelectorAll('link[rel="stylesheet"]');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = link.getAttribute("href");
        if (href && href.indexOf(data.path) !== -1) {
          var newHref = href.split("?")[0] + "?t=" + Date.now();
          link.setAttribute("href", newHref);
          console.log("[HMR] CSS updated: " + data.path);
        }
      }
    } else if (data.type === "full-reload") {
      location.reload();
    }
  }

  function connect() {
    var ws = new WebSocket(protocol + "//" + location.host + "/__hmr");
    ws.onopen = function() {
      console.log("[HMR] Connected");
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    };
    ws.onmessage = handleMessage;
    ws.onclose = function() {
      console.log("[HMR] Disconnected, attempting reconnect...");
      if (!reconnectTimer) {
        reconnectTimer = setInterval(connect, 2000);
      }
    };
  }

  connect();
})();
</script>
`;

function injectHmrClient(html: string): string {
  const bodyCloseIndex = html.lastIndexOf("</body>");
  if (bodyCloseIndex !== -1) {
    return (
      html.slice(0, bodyCloseIndex) +
      HMR_CLIENT_SCRIPT +
      html.slice(bodyCloseIndex)
    );
  }
  return html + HMR_CLIENT_SCRIPT;
}

export async function frontend(options: FrontendOptions) {
  const { port } = options;
  const root = process.cwd();
  const srcDir = path.join(root, "src");

  console.log();
  console.log(pc.cyan("  Timeless Frontend Dev Server"));
  console.log();

  if (!fs.existsSync(path.join(root, "index.html"))) {
    console.error(
      pc.red("  Error: No index.html found in current directory"),
    );
    process.exit(1);
  }

  // --- HTTP Server ---
  const server = http.createServer((req, res) => {
    const reqUrl = req.url || "/";
    const parsedPath = reqUrl.split("?")[0];
    let relativePath = parsedPath.replace(/^\/+/, "");

    // Security: prevent path traversal
    const filePath = path.normalize(path.join(root, relativePath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const serveFile = (fp: string) => {
      fs.readFile(fp, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const ext = path.extname(fp);
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        // Inject import.meta.hot for JS files under src/
        const relFromRoot = path.relative(root, fp);
        if (
          (ext === ".js" || ext === ".mjs") &&
          relFromRoot.startsWith("src" + path.sep)
        ) {
          const hotPath = relFromRoot.replace(/\\/g, "/");
          const preamble = `import.meta.hot = globalThis.__hmr_createHot__("${hotPath}");\n`;
          res.writeHead(200, {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
          });
          res.end(preamble + data.toString("utf-8"));
          return;
        }

        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        });
        res.end(data);
      });
    };

    const serveHtml = (fp: string) => {
      const html = fs.readFileSync(fp, "utf-8");
      const injected = injectHmrClient(html);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      });
      res.end(injected);
    };

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        if (path.basename(filePath) === "index.html") {
          serveHtml(filePath);
          return;
        }
        serveFile(filePath);
        return;
      }

      if (!err && stats.isDirectory()) {
        const indexPath = path.join(filePath, "index.html");
        if (fs.existsSync(indexPath)) {
          serveHtml(indexPath);
          return;
        }
      }

      // SPA fallback: no extension → serve root index.html
      const ext = path.extname(parsedPath);
      if (!ext || ext === ".html") {
        const indexPath = path.join(root, "index.html");
        if (fs.existsSync(indexPath)) {
          serveHtml(indexPath);
          return;
        }
      }

      res.writeHead(404);
      res.end("Not found");
    });
  });

  // --- WebSocket (via ws library) ---
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const reqPath = (req.url || "").split("?")[0];
    if (reqPath !== "/__hmr") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  const wsClients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    wsClients.add(ws);
    console.log(
      `  ${pc.green("ws")}   ${pc.dim(`client connected (${wsClients.size} total)`)}`,
    );
    ws.on("close", () => {
      wsClients.delete(ws);
      console.log(
        `  ${pc.dim("ws")}   ${pc.dim(`client disconnected (${wsClients.size} total)`)}`,
      );
    });
    ws.on("error", () => {
      wsClients.delete(ws);
    });
  });

  function wsSend(data: string) {
    for (const ws of wsClients) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    }
  }

  // --- File watcher ---
  if (fs.existsSync(srcDir)) {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    fs.watch(srcDir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      if (filename.includes("node_modules") || filename.includes(".git"))
        return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const filePath = `src/${filename}`;
        const ext = path.extname(filename);

        if (ext === ".css") {
          console.log(`  ${pc.magenta("css")}  ${pc.dim(filePath)}`);
          wsSend(JSON.stringify({ type: "css-update", path: filePath }));
        } else if (ext === ".js" || ext === ".mjs" || ext === ".ts") {
          console.log(`  ${pc.green("hmr")}  ${pc.dim(filePath)}`);
          wsSend(JSON.stringify({ type: "update", path: filePath }));
        } else {
          console.log(`  ${pc.yellow("reload")}  ${pc.dim(filePath)}`);
          wsSend(JSON.stringify({ type: "full-reload" }));
        }
      }, 50);
    });

    console.log(`  ${pc.dim("Watching")} src/ ${pc.dim("for changes")}`);
  } else {
    console.log(
      pc.yellow("  Warning: No src/ directory found, HMR disabled"),
    );
  }

  // --- Start ---
  server.listen(port, () => {
    console.log();
    console.log(
      `  ${pc.green("➜")}  Local:   ${pc.cyan(`http://localhost:${port}/`)}`,
    );
    console.log();
    console.log(pc.dim("  Ready for development..."));
    console.log();
  });

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log();
    console.log(pc.dim("  Shutting down..."));
    wss.close();
    server.close();
    process.exit(0);
  });
}
