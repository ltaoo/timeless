import { TimelessElement } from "@/primitive/view";

import { STUB_MARKER } from "./env";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serializeNode(node: any): string {
  if (!node) return "";

  const type = node[STUB_MARKER];

  // Text node
  if (type === "text") {
    return escapeHtml(String(node.textContent ?? ""));
  }

  // Fragment
  if (type === "fragment") {
    return (node.__children || []).map(serializeNode).join("");
  }

  // Element
  if (type === "element") {
    const tag = node.__tag as string;
    let html = `<${tag}`;

    // class
    if (node.className) {
      html += ` class="${escapeHtml(node.className)}"`;
    }

    // style
    if (node.style && node.style.cssText) {
      html += ` style="${escapeHtml(node.style.cssText)}"`;
    }

    // attributes
    const attrs = node.__attrs as Map<string, string>;
    if (attrs) {
      for (const [k, v] of attrs) {
        html += ` ${k}="${escapeHtml(String(v))}"`;
      }
    }

    // Void elements
    if (VOID_ELEMENTS.has(tag)) {
      html += " />";
      return html;
    }

    html += ">";
    html += (node.__children || []).map(serializeNode).join("");
    html += `</${tag}>`;
    return html;
  }

  // Real DOM node (shouldn't happen on server, but just in case)
  return "";
}

/**
 * Render a TimelessElement tree to an HTML string (for SSR).
 * Only works on the server where stub nodes track structure.
 */
export function renderToString(el: TimelessElement): string {
  const result = el.render();
  if (!result) return "";
  return serializeNode(result);
}
