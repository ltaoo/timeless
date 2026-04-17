import type { Plugin } from "vite";

const VIRTUAL_CLIENT_PREFIX = "/@timeless/client";

/**
 * Vite plugin for Timeless SSR
 *
 * - Provides virtual module for client-side hydration entry
 * - Handles module transformation for SSR
 * - Uses resolveId + load hooks so generated code goes through Vite's
 *   transform pipeline, enabling bare ESM imports (e.g., @timeless/timeless-dom)
 */
export function timelessPlugin(): Plugin {
  return {
    name: "timeless-ssr",

    resolveId(id) {
      // Handle /@timeless/client and /@timeless/client/<pagePath>
      if (id === VIRTUAL_CLIENT_PREFIX || id.startsWith(VIRTUAL_CLIENT_PREFIX + "/")) {
        return "\0" + id;
      }
    },

    load(id) {
      if (id.startsWith("\0" + VIRTUAL_CLIENT_PREFIX)) {
        const rawPath = id.slice(("\0" + VIRTUAL_CLIENT_PREFIX).length);
        const pagePath = rawPath || "/";
        return generateClientEntry(pagePath);
      }
    },
  };
}

/**
 * Generate client-side hydration code for a specific page.
 * Uses ESM imports resolved by Vite — source changes take effect immediately in dev.
 */
function generateClientEntry(pagePath: string): string {
  // Normalize page path
  const normalizedPath = pagePath === "/" ? "/index" : pagePath;

  return `
import { hydrate } from "@timeless/timeless-dom";
import "@timeless/provider-web";

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
