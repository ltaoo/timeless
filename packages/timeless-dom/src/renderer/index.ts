import { type TimelessElement, isElement } from "@timeless/timeless";

import { isDOMView } from "@/host/view";
import { isDOMFragment } from "@/host/fragment";
import { build } from "./build";

/**
 * Render a TimelessElement or ElementDescriptor into a DOM container.
 * @param elm - The element or descriptor to render
 * @param $root - The DOM container element
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

  if (isElement(elm)) {
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
    setTimeout(() => {
      if (typeof elm.onMounted === "function") {
        elm.onMounted({ reason: "append to $root", target: $elm });
      }
    }, 0);
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
