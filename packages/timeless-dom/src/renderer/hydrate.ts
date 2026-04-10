import { VNodeView, type TimelessElement } from "@timeless/timeless";

import { render } from "./index";
import { build } from "./build";

// export function installDomHost(options?: Parameters<typeof createDomHost>[0]) {
//   const host = createDomHost(options);
//   setHost(host);
//   return host;
// }

/**
 * Hydrate a virtual node tree onto existing server-rendered DOM.
 * This reuses the existing DOM nodes and attaches event listeners and reactive subscriptions.
 *
 * @param vnode - The virtual node tree to hydrate
 * @param container - The DOM container element with server-rendered content
 */
export function hydrate(
  vnode: TimelessElement,
  container: HTMLElement | null,
): void {
  if (!vnode) {
    console.error("[Hydrate] Invalid vnode");
    return;
  }
  if (!container) {
    console.error("[Hydrate] Container element not found");
    return;
  }

  const firstChild = container.firstChild;

  if (!firstChild) {
    console.warn("[Hydrate] No SSR content found, falling back to render");
    render(vnode, container);
    return;
  }

  // Perform hydration
  hydrateNode(vnode, firstChild);
}

/**
 * Recursively hydrate a virtual node onto an existing DOM node.
 */
function hydrateNode(vnode: TimelessElement, domNode: any): any {
  if (!vnode || !domNode) {
    return domNode;
  }

  const vnodeType = vnode.t;

  switch (vnodeType) {
    case "view":
      return hydrateView(vnode, domNode);
    case "text":
      return hydrateText(vnode, domNode);
    case "for":
      return hydrateFor(vnode, domNode);
    case "show":
      return hydrateShow(vnode, domNode);
    default:
      // Unknown type, try to use hydrate method if available
      if (typeof (vnode as any).hydrate === "function") {
        return (vnode as any).hydrate(domNode);
      }
    // Fallback to render
    // return vnode.render();
  }
}

/**
 * Hydrate a View component.
 */
function hydrateView(vnode: TimelessElement, $elm: HTMLElement) {
  const view$ = build(vnode);
  const expected_tag = "div";
  const actual_tag = $elm.nodeName || $elm.tagName || "";

  // Validate tag match
  if (actual_tag.toUpperCase() !== expected_tag) {
    console.warn(
      `[Hydrate] Tag mismatch: expected ${expected_tag}, got ${actual_tag}. Falling back to render.`,
    );
    return view$.render(vnode);
  }
  view$.hydrate(vnode, $elm);
}

/**
 * Hydrate a Text component.
 */
function hydrateText(vnode: TimelessElement, $elm: Text): any {
  const text$ = build(vnode);
  text$.hydrate(vnode, $elm);
}

/**
 * Hydrate a For component.
 */
function hydrateFor(vnode: TimelessElement, domNode: any) {
  // if (typeof (vnode as any).hydrate === "function") {
  //   // const parent = host.getParentNode(domNode);
  //   return (vnode as any).hydrate(domNode, parent);
  // }
  // return vnode.render();
}

/**
 * Hydrate a Show component.
 */
function hydrateShow(vnode: TimelessElement, domNode: any) {
  // if (typeof (vnode as any).hydrate === "function") {
  //   const parent = host.getParentNode(domNode);
  //   return (vnode as any).hydrate(domNode, parent);
  // }
  // return vnode.render();
}
