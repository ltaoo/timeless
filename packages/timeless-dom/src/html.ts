import type { kit } from "@timeless/timeless";

function html_node(node: Element): kit.HTMLNode {
  return {
    get tag() {
      return node.tagName.toLowerCase();
    },
    text: () => node.textContent || "",
    html: () => node.innerHTML,
    attr(name: string, ...value: [string | null] | []) {
      if (!value.length) return node.getAttribute(name);
      if (value[0] === null) node.removeAttribute(name);
      else node.setAttribute(name, value[0]);
    },
    select(selector) {
      const result = node.querySelector(selector);
      return result ? html_node(result) : null;
    },
    selectAll: (selector) =>
      Array.from(node.querySelectorAll(selector), html_node),
    remove: () => node.remove(),
  } as kit.HTMLNode;
}

/** Parsing does not sanitize HTML. The result is detached and never mounted automatically. */
export function parse_html(html: string): kit.ParsedHTML {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return {
    root: html_node(doc.documentElement),
    head: html_node(doc.head),
    body: html_node(doc.body),
  };
}
