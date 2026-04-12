import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  View,
  For,
  isBrowser,
  renderToString,
  Button,
} from "@timeless/timeless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");

console.log("isBrowser:", isBrowser);

// --- Build the component tree on the server ---
// Note: Server-side uses static data, client-side will use reactive refs

function App() {
  const items = ["Apple", "Banana", "Cherry"];

  return View({ as: "div", class: "app" }, [
    View({ as: "h1" }, ["Timeless SSR Demo"]),
    View({ as: "p", class: "info" }, [
      "Rendered on server. JavaScript will make it interactive.",
    ]),
    View({ as: "div", class: "counter-section" }, [
      View({ as: "h2" }, ["Counter"]),
      View({ as: "div", class: "counter" }, [
        Button({}, ["-"]),
        View({ as: "span" }, ["0"]),
        Button({}, ["+"]),
      ]),
    ]),
    View({ as: "div", class: "list-section" }, [
      View({ as: "h2" }, ["Fruit List"]),
      View({ as: "ul" }, [
        For({
          each: items,
          render: (item) => View({ as: "li" }, [item]),
        }),
      ]),
      View(
        {
          as: "div",
          style: { marginTop: "12px", display: "flex", gap: "8px" },
        },
        [
          Button(
            {
              style: {
                padding: "6px 12px",
                border: "1px solid #ccc",
                "border-radius": "6px",
                background: "#fff",
              },
            },
            ["Add Fruit"],
          ),
          Button(
            {
              style: {
                padding: "6px 12px",
                border: "1px solid #ccc",
                "border-radius": "6px",
                background: "#fff",
              },
            },
            ["Remove Last"],
          ),
        ],
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
