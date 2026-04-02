import { createServer as createViteServer, type ViteDevServer } from "vite";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";

import { timelessPlugin } from "../server/vite-plugin.js";
import { createSSRHandler } from "../server/ssr-handler.js";

export interface DevOptions {
  port: number;
  host: string;
}

export async function dev(options: DevOptions) {
  const { port, host } = options;
  const root = process.cwd();

  console.log();
  console.log(pc.cyan("  Timeless Dev Server"));
  console.log();

  // Check for pages directory
  const pagesDir = path.join(root, "pages");
  const srcDir = path.join(root, "src");

  let entryDir = pagesDir;
  if (!fs.existsSync(pagesDir)) {
    if (fs.existsSync(srcDir)) {
      entryDir = srcDir;
    } else {
      console.error(pc.red("  Error: No pages/ or src/ directory found"));
      console.log();
      console.log("  Create a pages/index.js file to get started:");
      console.log();
      console.log(pc.dim("    // pages/index.js"));
      console.log(pc.dim('    import { View } from "@timeless/timeless";'));
      console.log(pc.dim(""));
      console.log(pc.dim("    export async function load() {"));
      console.log(pc.dim("      return { message: 'Hello World' };"));
      console.log(pc.dim("    }"));
      console.log(pc.dim(""));
      console.log(pc.dim("    export default function Page({ data }) {"));
      console.log(pc.dim('      return View({ as: "h1" }, [data.message]);'));
      console.log(pc.dim("    }"));
      console.log();
      process.exit(1);
    }
  }

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    root,
    server: {
      middlewareMode: true,
      hmr: {
        port: port + 1,
      },
    },
    appType: "custom",
    plugins: [timelessPlugin()],
    optimizeDeps: {
      include: ["@timeless/timeless", "@timeless/timeless-dom"],
    },
  });

  // Create HTTP server
  const server = http.createServer(async (req, res) => {
    const url = req.url || "/";

    try {
      // Handle UMD static files - serve directly without Vite transformation
      if (url.startsWith("/public/timeless/") && url.endsWith(".js")) {
        const publicDir = path.join(root, "public");
        const filePath = path.join(publicDir, url.replace("/public/", ""));

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          res.writeHead(200, {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=31536000"
          });
          res.end(content);
          return;
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("UMD file not found: " + url);
          return;
        }
      }

      // Handle SSR for HTML pages
      if (
        req.method === "GET" &&
        !url.includes(".") &&
        req.headers.accept?.includes("text/html")
      ) {
        const html = await createSSRHandler(vite, entryDir)(url);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }

      // Let Vite handle everything else (static files, HMR, etc.)
      vite.middlewares(req, res);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      console.error(pc.red(`  SSR Error: ${e.message}`));
      console.error(e.stack);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<pre style="color:red">${e.stack}</pre>`);
    }
  });

  server.listen(port, host, () => {
    console.log(
      `  ${pc.green("➜")}  Local:   ${pc.cyan(`http://${host}:${port}/`)}`,
    );
    console.log();
    console.log(pc.dim("  Ready for development..."));
    console.log();
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log();
    console.log(pc.dim("  Shutting down..."));
    await vite.close();
    server.close();
    process.exit(0);
  });
}
