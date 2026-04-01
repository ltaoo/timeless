import { getHost, HeadlessHost } from "@/host";
import { isElement, TimelessElement } from "@/primitive/view";
import { render } from "./render";

/**
 * Hydrate a virtual node tree onto existing server-rendered DOM.
 * This reuses the existing DOM nodes and attaches event listeners and reactive subscriptions.
 *
 * @param vnode - The virtual node tree to hydrate
 * @param container - The container element with server-rendered content
 */
export function hydrate(vnode: TimelessElement, container: any): void {
  if (!vnode) {
    console.error("[Hydrate] Invalid vnode");
    return;
  }
  if (!container) {
    console.error("[Hydrate] Container element not found");
    return;
  }

  const host = getHost();
  const firstChild = host.getFirstChild(container);

  if (!firstChild) {
    console.warn("[Hydrate] No SSR content found, falling back to render");
    render(vnode, container);
    return;
  }

  // Perform hydration
  hydrateNode(vnode, firstChild, host);
}

/**
 * Recursively hydrate a virtual node onto an existing DOM node.
 */
function hydrateNode(
  vnode: TimelessElement,
  domNode: any,
  host: HeadlessHost,
): any {
  if (!vnode || !domNode) {
    return domNode;
  }

  const vnodeType = (vnode as any).t;

  switch (vnodeType) {
    case "view":
      return hydrateView(vnode, domNode, host);
    case "text":
      return hydrateText(vnode, domNode, host);
    case "for":
      return hydrateFor(vnode, domNode, host);
    case "show":
      return hydrateShow(vnode, domNode, host);
    default:
      // Unknown type, try to use hydrate method if available
      if (typeof (vnode as any).hydrate === "function") {
        return (vnode as any).hydrate(domNode);
      }
      // Fallback to render
      return vnode.render();
  }
}

/**
 * Hydrate a View component.
 */
function hydrateView(
  vnode: TimelessElement,
  domNode: any,
  host: HeadlessHost,
): any {
  const props = (vnode as any)._props || {};
  const expectedTag = (props.as || "div").toUpperCase();
  const actualTag = domNode.nodeName || domNode.tagName || "";

  // Validate tag match
  if (actualTag.toUpperCase() !== expectedTag) {
    console.warn(
      `[Hydrate] Tag mismatch: expected ${expectedTag}, got ${actualTag}. Falling back to render.`,
    );
    return vnode.render();
  }

  // Use the hydrate method
  if (typeof (vnode as any).hydrate === "function") {
    return (vnode as any).hydrate(domNode);
  }

  // Fallback
  vnode.$elm = domNode;
  return vnode.render();
}

/**
 * Hydrate a Text component.
 */
function hydrateText(
  vnode: TimelessElement,
  domNode: any,
  host: HeadlessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    return (vnode as any).hydrate(domNode);
  }

  vnode.$elm = domNode;
  return vnode.render();
}

/**
 * Hydrate a For component.
 */
function hydrateFor(
  vnode: TimelessElement,
  domNode: any,
  host: HeadlessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    const parent = host.getParentNode(domNode);
    return (vnode as any).hydrate(domNode, parent);
  }

  return vnode.render();
}

/**
 * Hydrate a Show component.
 */
function hydrateShow(
  vnode: TimelessElement,
  domNode: any,
  host: HeadlessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    const parent = host.getParentNode(domNode);
    return (vnode as any).hydrate(domNode, parent);
  }

  return vnode.render();
}
