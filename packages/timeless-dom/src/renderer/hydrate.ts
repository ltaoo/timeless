import { VNodeView, type TimelessElement } from "@timeless/timeless";

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
): VNodeView<any> | null {
  // console.log("hydrate node", vnode.t, $elm);
  if (!vnode || !$elm) {
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
    return hydrate_text(vnode, $elm as Text);
  }
  if (vnode.t === "fragment") {
    return hydrate_fragment(vnode, $elm as HTMLElement);
  }
  if (vnode.t === "for") {
    return hydrate_for(vnode, $elm as HTMLElement);
  }
  if (vnode.t === "show") {
    return hydrate_show(vnode, $elm as HTMLElement);
  }
  // if (vnode.t === "match") {
  //   return hydrateMatch(vnode, domNode);
  // }
  if (vnode.t === "button") {
    return hydrate_button(vnode, $elm as HTMLElement);
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
  if (vnode.t === "file-picker") {
    return hydrate_file_picker(vnode, $elm as HTMLInputElement);
  }
  if (vnode.t === "number-input") {
    return hydrate_number_input(vnode, $elm as HTMLInputElement);
  }
  // if (vnode.t === "select") {
  //   return hydrateSelect(vnode, domNode);
  // }
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

/**
 * Hydrate a Text component.
 */
function hydrate_text(vnode: TimelessElement, $elm: Text): VNodeView<Text> {
  const text$ = build(vnode);
  vnode.$elm = text$;
  text$.hydrate(vnode, $elm);
  return text$;
}

function hydrate_fragment(
  vnode: TimelessElement,
  $elm: HTMLElement,
): VNodeView<Text> {
  const fragment$ = build(vnode);
  vnode.$elm = fragment$;
  fragment$.hydrate(vnode, $elm);
  return fragment$;
}

/**
 * Hydrate a For component.
 */
function hydrate_for(
  vnode: TimelessElement,
  $elm: HTMLElement,
): VNodeView<Text> {
  const for$ = build(vnode);
  vnode.$elm = for$;
  for$.hydrate(vnode, $elm);
  return for$;
}

/**
 * Hydrate a Show component.
 */
function hydrate_show(
  vnode: TimelessElement,
  $elm: HTMLElement,
): VNodeView<Text> {
  const show$ = build(vnode);
  vnode.$elm = show$;
  show$.hydrate(vnode, $elm);
  return show$;
}

function hydrate_button(
  vnode: TimelessElement,
  $elm: HTMLElement,
): VNodeView<HTMLButtonElement> {
  const button$ = build(vnode);
  vnode.$elm = button$;
  button$.hydrate(vnode, $elm);
  return button$;
}

function hydrate_file_picker(
  vnode: TimelessElement,
  $elm: HTMLInputElement,
): VNodeView<HTMLInputElement> {
  const file_picker$ = build(vnode);
  vnode.$elm = file_picker$;
  file_picker$.hydrate(vnode, $elm);
  return file_picker$;
}

function hydrate_number_input(
  vnode: TimelessElement,
  $elm: HTMLInputElement,
): VNodeView<HTMLInputElement> {
  const number_input$ = build(vnode);
  vnode.$elm = number_input$;
  number_input$.hydrate(vnode, $elm);
  return number_input$;
}
