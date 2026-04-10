import { type TimelessElement } from "@timeless/timeless";

import { render } from "./index";
import { build } from "./build";

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
  if (vnode.onMounted) {
    vnode.onMounted({
      target: container,
    });
  }
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
  // console.log("hydrate node", vnode.t, $elm);
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
      hydrate_view(vnode, $first as HTMLElement);
      return;
    }
    hydrate_view(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "text") {
    if (!($elm instanceof Text)) {
      return;
    }
    hydrate_text(vnode, $elm as Text);
    return;
  }
  if (vnode.t === "fragment") {
    hydrate_fragment(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "for") {
    hydrate_for(vnode, $elm as HTMLElement);
    return;
  }
  if (vnode.t === "show") {
    hydrate_show(vnode, $elm as HTMLElement);
    return;
  }
  // if (vnode.t === "match") {
  //   return hydrateMatch(vnode, domNode);
  // }
  if (vnode.t === "button") {
    hydrate_button(vnode, $elm as HTMLElement);
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
function hydrate_view(vnode: TimelessElement, $elm: HTMLElement) {
  const view$ = build(vnode);
  vnode.$elm = view$;
  view$.hydrate(vnode, $elm);
}

/**
 * Hydrate a Text component.
 */
function hydrate_text(vnode: TimelessElement, $elm: Text): any {
  const text$ = build(vnode);
  vnode.$elm = text$;
  text$.hydrate(vnode, $elm);
}

function hydrate_fragment(vnode: TimelessElement, $elm: HTMLElement) {
  const fragment$ = build(vnode);
  vnode.$elm = fragment$;
  fragment$.hydrate(vnode, $elm);
}

/**
 * Hydrate a For component.
 */
function hydrate_for(vnode: TimelessElement, $elm: HTMLElement) {
  const for$ = build(vnode);
  vnode.$elm = for$;
  for$.hydrate(vnode, $elm);
}

/**
 * Hydrate a Show component.
 */
function hydrate_show(vnode: TimelessElement, $elm: HTMLElement) {
  const show$ = build(vnode);
  vnode.$elm = show$;
  show$.hydrate(vnode, $elm);
}

function hydrate_button(vnode: TimelessElement, $elm: HTMLElement) {
  const button$ = build(vnode);
  vnode.$elm = button$;
  button$.hydrate(vnode, $elm);
}
