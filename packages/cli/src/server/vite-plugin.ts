import type { Plugin } from "vite";

const VIRTUAL_CLIENT_ENTRY = "/@timeless/client";
const RESOLVED_VIRTUAL_CLIENT = "\0" + VIRTUAL_CLIENT_ENTRY;

/**
 * Vite plugin for Timeless SSR
 *
 * - Provides virtual module for client-side hydration entry
 * - Handles module transformation for SSR
 */
export function timelessPlugin(): Plugin {
  return {
    name: "timeless-ssr",

    resolveId(id) {
      if (id === VIRTUAL_CLIENT_ENTRY) {
        return RESOLVED_VIRTUAL_CLIENT;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_CLIENT) {
        // This module is dynamically generated per request
        // The actual content is injected by the SSR handler
        return `
          console.log("[Timeless] Client entry loaded");
          export {};
        `;
      }
    },

    configureServer(server) {
      // Handle the virtual client module dynamically
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/@timeless/client/")) {
          // Extract page path from URL
          const pagePath = req.url.replace("/@timeless/client", "");
          const clientCode = generateClientEntry(pagePath);

          res.setHeader("Content-Type", "application/javascript");
          res.end(clientCode);
          return;
        }
        next();
      });
    },
  };
}

/**
 * Generate client-side hydration code for a specific page
 * Uses global Timeless and Timeless.DOM from UMD bundles
 */
function generateClientEntry(pagePath: string): string {
  // Normalize page path
  const normalizedPath = pagePath === "/" ? "/index" : pagePath;

  // Use global variables from UMD bundles
  return `
// Use Timeless and Timeless.DOM from global scope (loaded via UMD)
const { hydrate } = window.Timeless.DOM;

async function main() {
  try {
    console.log("[Timeless] Starting hydration...");

    // Get initial data from SSR (plain values, not Refs)
    const initialData = window.__TIMELESS_DATA__ || {};
    console.log("[Timeless] Initial data:", initialData);

    // Dynamic import the page module
    const pageModule = await import("/pages${normalizedPath}.js");
    const Page = pageModule.default;

    if (!Page) {
      console.error("[Timeless] Page component not found in module:", pageModule);
      return;
    }

    // Pass plain data to Page - components can use ref(data.xxx) for reactivity
    console.log("[Timeless] Hydrating with plain data");

    // Hydrate the app
    const root = document.getElementById("root");
    if (root) {
      const originalFirstChild = root.firstChild;
      hydrate(Page({ data: initialData }), root);
      console.log("[Timeless] Hydration complete");
      console.log("[Timeless] DOM reused:", root.firstChild === originalFirstChild);
    } else {
      console.error("[Timeless] Root element not found");
    }
  } catch (e) {
    console.error("[Timeless] Hydration error:", e);
    console.error(e.stack);
  }
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
`;
}
