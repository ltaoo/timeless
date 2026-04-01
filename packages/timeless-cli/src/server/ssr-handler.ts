import type { ViteDevServer } from "vite";
import path from "node:path";
import fs from "node:fs";

/**
 * Create SSR request handler
 */
export function createSSRHandler(vite: ViteDevServer, pagesDir: string) {
  return async function handleSSR(url: string): Promise<string> {
    // Determine page path from URL
    const pagePath = urlToPagePath(url);
    const pageFile = resolvePageFile(pagesDir, pagePath);

    if (!pageFile) {
      return generate404Page(url);
    }

    // Load the page module via Vite's SSR loader
    const pageModule = await vite.ssrLoadModule(pageFile);

    const Page = pageModule.default;
    const load = pageModule.load;
    const head = pageModule.head;

    if (!Page) {
      return generateErrorPage("Page component not exported as default");
    }

    // Execute load() to get initial data
    let data = {};
    if (typeof load === "function") {
      try {
        data = await load({ url, params: {}, query: parseQuery(url) });
      } catch (e: any) {
        console.error("[SSR] Error in load():", e);
        return generateErrorPage(`Error in load(): ${e.message}`);
      }
    }

    // Import renderToString dynamically to use Vite's SSR transform
    const { renderToString } = await vite.ssrLoadModule("@timeless/timeless");

    // Render the page
    let appHtml = "";
    try {
      const vnode = Page({ data });
      appHtml = renderToString(vnode);
    } catch (e: any) {
      console.error("[SSR] Error rendering page:", e);
      return generateErrorPage(`Render error: ${e.message}`);
    }

    // Generate head
    const headConfig = typeof head === "function" ? head({ data }) : {};

    // Generate full HTML
    return generateHTML({
      title: headConfig.title || "Timeless App",
      meta: headConfig.meta || [],
      content: appHtml,
      data,
      pagePath,
    });
  };
}

/**
 * Convert URL to page file path
 */
function urlToPagePath(url: string): string {
  const [pathname] = url.split("?");
  if (pathname === "/") return "/index";
  return pathname.replace(/\/$/, "");
}

/**
 * Find the actual page file
 */
function resolvePageFile(
  pagesDir: string,
  pagePath: string,
): string | undefined {
  const extensions = [".js", ".ts", ".jsx", ".tsx"];

  for (const ext of extensions) {
    const fullPath = path.join(pagesDir, pagePath + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Try index file in directory
  for (const ext of extensions) {
    const fullPath = path.join(pagesDir, pagePath, "index" + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return undefined;
}

/**
 * Parse URL query string
 */
function parseQuery(url: string): Record<string, string> {
  const [, queryString] = url.split("?");
  if (!queryString) return {};

  const params: Record<string, string> = {};
  for (const pair of queryString.split("&")) {
    const [key, value] = pair.split("=");
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    }
  }
  return params;
}

/**
 * Generate the full HTML page
 */
function generateHTML(options: {
  title: string;
  meta: Array<{ name: string; content: string }>;
  content: string;
  data: Record<string, any>;
  pagePath: string;
}): string {
  const { title, meta, content, data, pagePath } = options;

  const metaTags = meta
    .map((m) => `<meta name="${m.name}" content="${escapeHtml(m.content)}">`)
    .join("\n    ");

  const serializedData = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${metaTags}
</head>
<body>
  <div id="root">${content}</div>
  <script>window.__TIMELESS_DATA__ = ${serializedData};</script>
  <script type="module" src="/@timeless/client${pagePath}"></script>
</body>
</html>`;
}

/**
 * Generate 404 page
 */
function generate404Page(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; text-align: center; }
    h1 { color: #333; }
    p { color: #666; }
    code { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Page not found: <code>${escapeHtml(url)}</code></p>
  <p>Create a page file in the <code>pages/</code> directory.</p>
</body>
</html>`;
}

/**
 * Generate error page
 */
function generateErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; }
    h1 { color: #dc2626; }
    pre { background: #fef2f2; padding: 16px; border-radius: 8px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Server Error</h1>
  <pre>${escapeHtml(message)}</pre>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
