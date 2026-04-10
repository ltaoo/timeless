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

  // const firstChild = container.firstChild;

  if (!container.firstChild) {
    console.warn("[Hydrate] No SSR content found, falling back to render");
    render(vnode, container);
    return;
  }

  // Perform hydration
  hydrate_node(vnode, container, { initial: true });
}

/**
 * Recursively hydrate a virtual node onto an existing DOM node.
 */
export function hydrate_node(
  vnode: TimelessElement,
  $elm: HTMLElement | Text,
  opt: Partial<{
    initial: boolean;
  }> = {},
) {
  console.log("hydrate node", vnode.t, $elm);
  if (!vnode || !$elm) {
    return;
  }
  if (vnode.t === "view") {
    if ($elm instanceof Text) {
      return;
    }
    if (opt.initial) {
      const $first = $elm.firstChild;
      if (!$first) {
        return;
      }
      hydrateView(vnode, $first as HTMLElement);
      return;
    }
    hydrateView(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "text") {
    if (!($elm instanceof Text)) {
      return;
    }
    hydrateText(vnode, $elm as Text);
    return;
  }
  if (vnode.t === "fragment") {
    hydrateFragment(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "for") {
    hydrateFor(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "show") {
    hydrateShow(vnode, $elm as HTMLElement);
    return;
  }
  // if (vnode.t === "match") {
  //   return hydrateMatch(vnode, domNode);
  // }
  if (vnode.t === "button") {
    hydrateButton(vnode, $elm as HTMLElement);
    return;
  }
  // if (vnode.t === "img") {
  //   return hydrateImg(vnode, domNode);
  // }
  // if (vnode.t === "label") {
  //   return hydrateLabel(vnode, domNode);
  // }
  // if (vnode.t === "input") {
  //   return hydrateInput(vnode, domNode);
  // }
  // if (vnode.t === "select") {
  //   return hydrateSelect(vnode, domNode);
  // }
  // if (vnode.t === "option") {
  //   return hydrateOption(vnode, domNode);
  // }
}

/**
 * Hydrate a View component.
 */
function hydrateView(vnode: TimelessElement, $elm: HTMLElement) {
  const view$ = build(vnode);
  vnode.$elm = view$;
  view$.hydrate(vnode, $elm);
}

/**
 * Hydrate a Text component.
 */
function hydrateText(vnode: TimelessElement, $elm: Text): any {
  const text$ = build(vnode);
  vnode.$elm = text$;
  text$.hydrate(vnode, $elm);
}

function hydrateFragment(vnode: TimelessElement, $elm: HTMLElement) {
  const fragment$ = build(vnode);
  vnode.$elm = fragment$;
  fragment$.hydrate(vnode, $elm);
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
function hydrateShow(vnode: TimelessElement, $elm: HTMLElement) {
  const show$ = build(vnode);
  vnode.$elm = show$;
  show$.hydrate(vnode, $elm);
}

function hydrateButton(vnode: TimelessElement, $elm: HTMLElement) {
  const button$ = build(vnode);
  vnode.$elm = button$;
  button$.hydrate(vnode, $elm);
}
