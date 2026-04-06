import { type TimelessElement, isElement } from "@timeless/timeless";

import { DOMView, isDOMView } from "@/host/view";
import { DOMGrid } from "@/host/grid";
import { DOMText } from "@/host/text";
import { DOMShow } from "@/host/show";
import { DOMFor } from "@/host/for";
import { DOMHostNode } from "@/host/type";
import { DOMFragment, isDocumentFragment } from "@/host/fragment";
import { DOMImg } from "@/host/img";

function build(elm: TimelessElement): DOMHostNode {
  if (elm.t === "view") {
    const view$ = DOMView({ build });
    elm.$elm = view$;
    view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    // console.log("[]in build elm.t is text", elm.value);
    const text$ = DOMText(elm.value as any);
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "fragment") {
    const fragment$ = DOMFragment({ build });
    elm.$elm = fragment$;
    fragment$.render(elm);
    return fragment$;
  }
  if (elm.t === "img") {
    const img$ = DOMImg({ build });
    elm.$elm = img$;
    img$.render(elm);
    return img$;
  }
  if (elm.t === "grid") {
    const grid$ = DOMGrid({ build });
    elm.$elm = grid$;
    grid$.render(elm);
    return grid$;
  }
  if (elm.t === "show") {
    const show$ = DOMShow({ build });
    elm.$elm = show$;
    show$.render(elm);
    return show$;
  }
  if (elm.t === "for") {
    const for$ = DOMFor({ build });
    elm.$elm = for$;
    for$.render(elm);
    return for$;
  }
  return null;
}

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
    if (!isDOMView(host$) && !isDocumentFragment(host$)) {
      console.error(
        "[Render] Element render return non DOMView or DOMFragment",
      );
      return;
    }
    $root.appendChild(host$.$elm);
    if (typeof elm.onMounted === "function") {
      elm.onMounted({ target: host$.$elm });
    }
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
