import type { ViteDevServer } from "vite";
import path from "node:path";
import fs from "node:fs";

import { VERSION } from "../version.js";

const TIMELESS_VERSION = VERSION;

// Setup SSR-safe document mock if not in browser
if (typeof globalThis.document === "undefined") {
  const noop = () => {};
  const createNoopNode = (): any => ({
    contains: () => false,
    appendChild: noop,
    removeChild: noop,
    insertBefore: noop,
    replaceChild: noop,
    addEventListener: noop,
    removeEventListener: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
    setAttribute: noop,
    removeAttribute: noop,
    classList: {
      add: noop,
      remove: noop,
      toggle: noop,
      contains: () => false,
    },
    style: {},
    childNodes: [],
    children: [],
    firstChild: null,
    lastChild: null,
    parentNode: null,
    nextSibling: null,
    previousSibling: null,
    innerHTML: "",
    outerHTML: "",
    textContent: "",
    nodeType: 1,
    nodeName: "DIV",
    tagName: "DIV",
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    }),
    focus: noop,
    blur: noop,
    click: noop,
  });

  (globalThis as any).document = {
    body: createNoopNode(),
    head: createNoopNode(),
    documentElement: createNoopNode(),
    createElement: () => createNoopNode(),
    createElementNS: () => createNoopNode(),
    createTextNode: () => ({ ...createNoopNode(), nodeType: 3 }),
    createDocumentFragment: () => ({ ...createNoopNode(), childNodes: [] }),
    addEventListener: noop,
    removeEventListener: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    createRange: () => ({
      selectNodeContents: noop,
      collapse: noop,
      setStart: noop,
      setEnd: noop,
    }),
    getSelection: () => null,
  };

  (globalThis as any).window = {
    document: (globalThis as any).document,
    addEventListener: noop,
    removeEventListener: noop,
    matchMedia: () => ({
      matches: false,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
    }),
    getComputedStyle: () => ({
      getPropertyValue: () => "",
    }),
    requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
    cancelAnimationFrame: noop,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    innerWidth: 1024,
    innerHeight: 768,
    scrollX: 0,
    scrollY: 0,
  };

  if (typeof globalThis.Element === "undefined") {
    (globalThis as any).Element = class Element {};
  }
  if (typeof globalThis.HTMLElement === "undefined") {
    (globalThis as any).HTMLElement = class HTMLElement {};
  }
  if (typeof (globalThis as any).Node?.ELEMENT_NODE === "undefined") {
    (globalThis as any).Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };
  }
}

/**
 * Create SSR request handler
 */
export function createSSRHandler(
  vite: ViteDevServer,
  pagesDir: string,
  isDev = true,
) {
  return async function handleSSR(url: string): Promise<string> {
    // Setup globalThis.Timeless for SSR BEFORE loading page module
    if (typeof (globalThis as any).Timeless === "undefined") {
      const timelessModule = await vite.ssrLoadModule("@timeless/timeless");
      (globalThis as any).Timeless = timelessModule;
      // Also set window.Timeless for compatibility
      if (typeof (globalThis as any).window !== "undefined") {
        (globalThis as any).window.Timeless = timelessModule;
      }
    }

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
      links: headConfig.links || [],
      content: appHtml,
      data,
      pagePath,
      isDev,
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
  links?: Array<{ rel: string; href: string }>;
  content: string;
  data: Record<string, any>;
  pagePath: string;
  isDev?: boolean;
}): string {
  const {
    title,
    meta,
    links = [],
    content,
    data,
    pagePath,
    isDev = true,
  } = options;

  const metaTags = meta
    .map((m) => `<meta name="${m.name}" content="${escapeHtml(m.content)}">`)
    .join("\n    ");

  const linkTags = links
    .map((l) => `<link rel="${l.rel}" href="${escapeHtml(l.href)}">`)
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
  ${linkTags}
</head>
<body>
  <div id="root">${content}</div>
  <script>window.__TIMELESS_DATA__ = ${serializedData};</script>
  <script src="/public/timeless/${TIMELESS_VERSION}/timeless.umd.min.js"></script>
  <script src="/public/timeless/${TIMELESS_VERSION}/timeless.dom.umd.min.js"></script>
  <script src="/public/timeless/${TIMELESS_VERSION}/timeless.web.umd.min.js"></script>
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
