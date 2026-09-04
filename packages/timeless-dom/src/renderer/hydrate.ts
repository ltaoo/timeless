import { VNodeView, type TimelessElement } from "@timeless/timeless";

import { resetPortalCounter } from "@/host/portal";
import { isDOMTableElementType } from "@/host/table";

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

  // resetPortalCounter();

  // const firstChild = container.firstChild;

  if (!container.firstChild) {
    const $container = document.querySelector(`[data-timeless-portal="0"]`);
    if (!$container) {
      console.warn("[Hydrate] No SSR content found, falling back to render");
      render(vnode, container);
    }
    // 是 Show、For、Portal 等 透明组件
    const view$ = hydrate_node(vnode, container as HTMLElement | Text, {
      initial: true,
      $parent: container,
      offset: 0,
      idx: 0,
    });
    if (vnode.onMounted) {
      console.log("before onMounted", vnode.t, view$);
      vnode.onMounted({
        target: view$,
      });
    }
    return;
  }

  // Perform hydration
  const view$ = hydrate_node(
    vnode,
    container.firstChild as HTMLElement | Text,
    {
      initial: true,
      $parent: container,
      offset: 0,
      idx: 0,
    },
  );
  console.log("before onMounted", vnode.t, view$);
  if (vnode.onMounted) {
    vnode.onMounted({
      target: view$,
    });
  }
}

/**
 * Recursively hydrate a virtual node onto an existing DOM node.
 */
export function hydrate_node(
  vnode: TimelessElement,
  $elm: HTMLElement | Text,
  opt: {
    initial?: boolean;
    $parent: HTMLElement;
    offset: number;
    idx: number;
  },
): VNodeView<any> | null {
  console.log("hydrate node", vnode.t, $elm, opt.$parent, opt.offset);

  // Portal finds its own DOM container outside the root — handle before $elm null check

  // Transparent components with 0 rendered nodes (e.g., Show wrapping only portals)
  // can be hydrated without a DOM node — they'll hydrate their children independently
  // if (!$elm) {
  //   return null;
  // }
  if (isDOMTableElementType(vnode.t)) {
    if ($elm.nodeType === 3) return null;
    const table$ = build(vnode);
    vnode.$elm = table$;
    table$.hydrate(vnode, $elm, opt);
    return table$;
  }
  if (vnode.t === "list-view-v2") {
    if ($elm.nodeType === 3) return null;
    const listview$ = build(vnode);
    vnode.$elm = listview$;
    listview$.hydrate(vnode, $elm, opt);
    return listview$;
  }
  if (vnode.t === "view") {
    if ($elm.nodeType === 3) {
      return null;
    }
    const view$ = build(vnode);
    vnode.$elm = view$;
    view$.hydrate(vnode, $elm, opt);
    return view$;
  }
  if (vnode.t === "text") {
    if (!($elm.nodeType === 3)) {
      return null;
    }
    const text$ = build(vnode);
    vnode.$elm = text$;
    text$.hydrate(vnode, $elm, opt);
    return text$;
  }
  if (vnode.t === "rich-text") {
    if ($elm.nodeType === 3) {
      return null;
    }
    const rich_text$ = build(vnode);
    vnode.$elm = rich_text$;
    rich_text$.hydrate(vnode, $elm, opt);
    return rich_text$;
  }
  if (vnode.t === "row") {
    const row$ = build(vnode);
    vnode.$elm = row$;
    row$.hydrate(vnode, $elm, opt);
    return row$;
  }
  if (vnode.t === "column") {
    const column$ = build(vnode);
    vnode.$elm = column$;
    column$.hydrate(vnode, $elm, opt);
    return column$;
  }
  if (vnode.t === "col") {
    const col$ = build(vnode);
    vnode.$elm = col$;
    col$.hydrate(vnode, $elm, opt);
    return col$;
  }
  if (vnode.t === "grid") {
    const grid$ = build(vnode);
    vnode.$elm = grid$;
    grid$.hydrate(vnode, $elm, opt);
    return grid$;
  }
  if (vnode.t === "fragment") {
    const fragment$ = build(vnode);
    vnode.$elm = fragment$;
    fragment$.hydrate(vnode, $elm, opt);
    return fragment$;
  }
  if (vnode.t === "portal") {
    const portal$ = build(vnode);
    vnode.$elm = portal$;
    portal$.hydrate(vnode, $elm, opt);
    return portal$;
  }
  if (vnode.t === "for") {
    const for$ = build(vnode);
    vnode.$elm = for$;
    for$.hydrate(vnode, $elm, opt);
    return for$;
  }
  if (vnode.t === "show") {
    const show$ = build(vnode);
    vnode.$elm = show$;
    show$.hydrate(vnode, $elm, opt);
    return show$;
  }
  if (vnode.t === "match") {
    const match$ = build(vnode);
    vnode.$elm = match$;
    match$.hydrate(vnode, $elm, opt);
    return match$;
  }
  if (vnode.t === "button") {
    const button$ = build(vnode);
    vnode.$elm = button$;
    button$.hydrate(vnode, $elm, opt);
    return button$;
  }
  if (vnode.t === "icon") {
    const icon$ = build(vnode);
    vnode.$elm = icon$;
    icon$.hydrate(vnode, $elm, opt);
    return icon$;
  }
  if (vnode.t === "img") {
    const img$ = build(vnode);
    vnode.$elm = img$;
    img$.hydrate(vnode, $elm, opt);
    return img$;
  }
  if (vnode.t === "label") {
    const label$ = build(vnode);
    vnode.$elm = label$;
    label$.hydrate(vnode, $elm, opt);
    return label$;
  }
  if (vnode.t === "input") {
    const input$ = build(vnode);
    vnode.$elm = input$;
    input$.hydrate(vnode, $elm, opt);
    return input$;
  }
  if (vnode.t === "checkbox") {
    const checkbox$ = build(vnode);
    vnode.$elm = checkbox$;
    checkbox$.hydrate(vnode, $elm, opt);
    return checkbox$;
  }
  if (vnode.t === "file-picker") {
    const file_picker$ = build(vnode);
    vnode.$elm = file_picker$;
    file_picker$.hydrate(vnode, $elm, opt);
    return file_picker$;
  }
  if (vnode.t === "number-input") {
    const number_input$ = build(vnode);
    vnode.$elm = number_input$;
    number_input$.hydrate(vnode, $elm, opt);
    return number_input$;
  }
  if (vnode.t === "select") {
    const select$ = build(vnode);
    vnode.$elm = select$;
    select$.hydrate(vnode, $elm, opt);
    return select$;
  }
  // if (vnode.t === "option") {
  //   return hydrateOption(vnode, domNode);
  // }
  return null;
}
