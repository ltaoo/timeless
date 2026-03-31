import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { View, isBrowser, renderToString } from "@timeless/timeless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");

console.log("isBrowser:", isBrowser);

// --- Build the component tree on the server ---

function App() {
  const items = ["Apple", "Banana", "Cherry"];

  return View({ type: "div", class: "app" }, [
    View({ type: "h1" }, ["Timeless SSR Demo"]),
    View({ type: "p", class: "info" }, [
      "Rendered on server. JavaScript will make it interactive.",
    ]),
    View({ type: "div", class: "counter-section" }, [
      View({ type: "h2" }, ["Counter"]),
      View({ type: "div", class: "counter" }, [
        View({ type: "button", id: "dec" }, ["-"]),
        View({ type: "span", id: "count" }, ["0"]),
        View({ type: "button", id: "inc" }, ["+"]),
      ]),
    ]),
    View({ type: "div", class: "list-section" }, [
      View({ type: "h2" }, ["Fruit List"]),
      View(
        { type: "ul" },
        items.map((item) => View({ type: "li" }, [item])),
      ),
    ]),
  ]);
}

const ssrHtml = renderToString(App());
console.log("SSR HTML generated, length:", ssrHtml.length);

// --- Static file MIME types ---

const MIME = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
};

// --- UMD bundle paths ---

const LIB_MAP = {
  "/lib/reactive.js": path.join(
    ROOT,
    "packages/reactive/dist/timeless.reactive.umd.min.js",
  ),
  "/lib/ui.js": path.join(ROOT, "packages/ui/dist/timeless.ui.umd.min.js"),
  "/lib/kit.js": path.join(ROOT, "packages/kit/dist/timeless.kit.umd.min.js"),
  "/lib/timeless.js": path.join(
    ROOT,
    "packages/timeless/dist/timeless.umd.min.js",
  ),
  "/lib/timeless-dom.js": path.join(
    ROOT,
    "packages/timeless-dom/dist/timeless.dom.umd.min.js",
  ),
};

// --- HTML template ---

function buildPage(ssrContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Timeless SSR Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; background: #f5f5f5; }
    .app { max-width: 480px; margin: 0 auto; }
    h1 { margin-bottom: 8px; }
    h2 { margin: 24px 0 12px; font-size: 1.1em; }
    .info { color: #666; margin-bottom: 16px; }
    .counter { display: flex; align-items: center; gap: 16px; }
    .counter button {
      width: 36px; height: 36px; font-size: 18px; cursor: pointer;
      border: 1px solid #ccc; border-radius: 6px; background: #fff;
    }
    .counter button:hover { background: #e8e8e8; }
    .counter span { font-size: 24px; min-width: 48px; text-align: center; }
    ul { list-style: none; }
    li {
      padding: 8px 12px; margin-bottom: 4px;
      background: #fff; border-radius: 6px; border: 1px solid #e0e0e0;
    }
    .ssr-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: 12px; margin-bottom: 16px;
    }
    .ssr-badge.server { background: #dbeafe; color: #1d4ed8; }
    .ssr-badge.client { background: #dcfce7; color: #16a34a; }
  </style>
</head>
<body>
  <div id="root">${ssrContent}</div>

  <!-- UMD bundles for client-side rendering -->
  <script src="/lib/reactive.js"></script>
  <script src="/lib/ui.js"></script>
  <script src="/lib/kit.js"></script>
  <script src="/lib/timeless.js"></script>
  <script src="/lib/timeless-dom.js"></script>
  <script src="/client.js"></script>
</body>
</html>`;
}

// --- HTTP server ---

const PORT = 3100;

const server = http.createServer((req, res) => {
  // Main page
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(buildPage(ssrHtml));
    return;
  }

  // Client JS
  if (req.url === "/client.js") {
    const file = path.join(__dirname, "client.js");
    if (fs.existsSync(file)) {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(fs.readFileSync(file, "utf-8"));
      return;
    }
  }

  // UMB lib bundles
  if (req.url && LIB_MAP[req.url]) {
    const file = LIB_MAP[req.url];
    if (fs.existsSync(file)) {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(fs.readFileSync(file, "utf-8"));
      return;
    }
    res.writeHead(404);
    res.end(
      `UMD bundle not found: ${file}\nRun "pnpm run build" in the project root first.`,
    );
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`SSR server running at http://localhost:${PORT}`);
});
