import { type TimelessElement, isElement } from "@timeless/timeless";
import { patch } from "@timeless/timeless";

import { isDOMView } from "@/host/view";
import { isDOMFragment } from "@/host/fragment";
import { build, buildAndRender } from "./build";

/**
 * Render a TimelessElement into a DOM container.
 *
 * On first call for a given $root, builds and appends the element tree.
 * On subsequent calls (e.g. HMR), diffs against the previous element tree
 * and applies minimal DOM patches — no full re-render needed.
 */
export function render(
  elm: TimelessElement,
  $root: HTMLElement | null,
  extra: Partial<{
    onVNodeCreated: (data: any) => void;
  }> = {},
) {
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  if (!isElement(elm)) {
    console.error("[Render] Root Element can't be lazy element");
    return;
  }

  // ── HMR path: previous element exists → patch in place ──
  const prev = rootElements.get($root);
  if (prev) {
    patch(prev, elm, { buildAndRender });
    rootElements.set($root, elm);
    return;
  }

  // ── Initial render ──
  const host$ = build(elm);
  if (!host$) {
    console.error("[Render] Element render return null");
    return;
  }
  if (!isDOMView(host$) && !isDOMFragment(host$)) {
    console.error(
      "[Render] Element render return non DOMView or DOMFragment",
    );
    return;
  }
  const $elm = host$.render(elm);
  if (!$elm) {
    return;
  }
  $root.appendChild($elm);
  rootElements.set($root, elm);
  setTimeout(() => {
    if (typeof elm.onMounted === "function") {
      elm.onMounted({ reason: "append to $root", target: $elm });
    }
  }, 0);
}

/** Track the current root element per container for diff-based HMR updates. */
const rootElements = new WeakMap<HTMLElement, TimelessElement>();
