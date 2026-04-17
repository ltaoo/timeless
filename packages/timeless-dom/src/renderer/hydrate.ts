import { VNodeView, type TimelessElement } from "@timeless/timeless";

import { resetPortalCounter } from "@/host/portal";
import { countRenderedNodes } from "@/host/fragment";

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

  resetPortalCounter();

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
    $parent: HTMLElement;
  }> = {},
): VNodeView<any> | null {
  // console.log("hydrate node", vnode.t, $elm);
  if (!vnode) {
    return null;
  }
  // Portal finds its own DOM container outside the root — handle before $elm null check
  if (vnode.t === "portal") {
    const portal$ = build(vnode);
    vnode.$elm = portal$;
    portal$.hydrate(vnode, $elm);
    return portal$;
  }
  // Transparent components with 0 rendered nodes (e.g., Show wrapping only portals)
  // can be hydrated without a DOM node — they'll hydrate their children independently
  if (!$elm && countRenderedNodes(vnode) === 0) {
    const t = vnode.t;
    if (t === "show" || t === "fragment" || t === "for" || t === "match") {
      const node$ = build(vnode);
      vnode.$elm = node$;
      node$.hydrate(vnode, $elm, { $parent: opt.$parent });
      return node$;
    }
  }
  if (!$elm) {
    return null;
  }
  if (vnode.t === "view") {
    if ($elm instanceof Text) {
      return null;
    }
    if (opt.initial) {
      const $first = $elm.firstChild;
      if (!$first) {
        return null;
      }
      return hydrate_view(vnode, $first as HTMLElement);
    }
    return hydrate_view(vnode, $elm as HTMLElement);
  }
  if (vnode.t === "text") {
    if (!($elm instanceof Text)) {
      return null;
    }
    const text$ = build(vnode);
    vnode.$elm = text$;
    text$.hydrate(vnode, $elm);
    return text$;
  }
  if (vnode.t === "row") {
    const row$ = build(vnode);
    vnode.$elm = row$;
    row$.hydrate(vnode, $elm);
    return row$;
  }
  if (vnode.t === "column") {
    const column$ = build(vnode);
    vnode.$elm = column$;
    column$.hydrate(vnode, $elm);
    return column$;
  }
  if (vnode.t === "col") {
    const col$ = build(vnode);
    vnode.$elm = col$;
    col$.hydrate(vnode, $elm);
    return col$;
  }
  if (vnode.t === "grid") {
    const grid$ = build(vnode);
    vnode.$elm = grid$;
    grid$.hydrate(vnode, $elm);
    return grid$;
  }
  if (vnode.t === "fragment") {
    const fragment$ = build(vnode);
    vnode.$elm = fragment$;
    fragment$.hydrate(vnode, $elm);
    return fragment$;
  }
  if (vnode.t === "for") {
    const for$ = build(vnode);
    vnode.$elm = for$;
    for$.hydrate(vnode, $elm);
    return for$;
  }
  if (vnode.t === "show") {
    const show$ = build(vnode);
    vnode.$elm = show$;
    show$.hydrate(vnode, $elm);
    return show$;
  }
  // if (vnode.t === "match") {
  //   return hydrateMatch(vnode, domNode);
  // }
  if (vnode.t === "button") {
    const button$ = build(vnode);
    vnode.$elm = button$;
    button$.hydrate(vnode, $elm);
    return button$;
  }
  // if (vnode.t === "img") {
  //   return hydrateImg(vnode, domNode);
  // }
  // if (vnode.t === "label") {
  //   return hydrateLabel(vnode, domNode);
  // }
  if (vnode.t === "input") {
    const input$ = build(vnode);
    vnode.$elm = input$;
    input$.hydrate(vnode, $elm);
    return input$;
  }
  if (vnode.t === "checkbox") {
    const checkbox$ = build(vnode);
    vnode.$elm = checkbox$;
    checkbox$.hydrate(vnode, $elm);
    return checkbox$;
  }
  if (vnode.t === "file-picker") {
    const file_picker$ = build(vnode);
    vnode.$elm = file_picker$;
    file_picker$.hydrate(vnode, $elm);
    return file_picker$;
  }
  if (vnode.t === "number-input") {
    const number_input$ = build(vnode);
    vnode.$elm = number_input$;
    number_input$.hydrate(vnode, $elm);
    return number_input$;
  }
  if (vnode.t === "select") {
    const select$ = build(vnode);
    vnode.$elm = select$;
    select$.hydrate(vnode, $elm);
    return select$;
  }
  // if (vnode.t === "option") {
  //   return hydrateOption(vnode, domNode);
  // }
  return null;
}

/**
 * Hydrate a View component.
 */
function hydrate_view(
  vnode: TimelessElement,
  $elm: HTMLElement,
): VNodeView<HTMLElement> {
  const view$ = build(vnode);
  vnode.$elm = view$;
  view$.hydrate(vnode, $elm);
  return view$;
}
