import { type TimelessElement, VNodeView, isElement } from "@timeless/timeless";

import { DOMHostNode } from "@/host/type";
import { DOMView, isDOMView } from "@/host/view";
import { DOMGrid } from "@/host/grid";
import { DOMText } from "@/host/text";
import { DOMShow } from "@/host/show";
import { DOMMatch } from "@/host/match";
import { DOMFor } from "@/host/for";
import { DOMFragment, isDOMFragment } from "@/host/fragment";
import { DOMLazyView } from "@/host/lazy-view";
import { DOMImg } from "@/host/img";
import { DOMIcon } from "@/host/icon";
import { DOMInput } from "@/host/input";
import { DOMButton } from "@/host/button";
import { DOMPortal } from "@/host/portal";
import { DOMPopper } from "@/host/popper";
import { DOMCheckbox } from "@/host/checkbox";
import { DOMLabel } from "@/host/label";
import { DOMTextarea } from "@/host/textarea";

function build(elm: TimelessElement): VNodeView<any> {
  if (elm.t === "view") {
    const view$ = DOMView({ build });
    elm.$elm = view$;
    // view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    const text$ = DOMText({ build });
    elm.$elm = text$;
    // text$.render(elm);
    return text$;
  }
  if (elm.t === "label") {
    const label$ = DOMLabel({ build });
    elm.$elm = label$;
    // label$.render(elm);
    return label$;
  }
  if (elm.t === "fragment") {
    const fragment$ = DOMFragment({ build });
    elm.$elm = fragment$;
    // fragment$.render(elm);
    return fragment$;
  }
  if (elm.t === "lazy-view") {
    const lazyView$ = DOMLazyView({ build });
    elm.$elm = lazyView$;
    // lazyView$.render(elm);
    return lazyView$;
  }
  if (elm.t === "popper") {
    const popper$ = DOMPopper({ build });
    elm.$elm = popper$;
    // popper$.render(elm);
    return popper$;
  }
  if (elm.t === "icon") {
    const icon$ = DOMIcon({ build });
    elm.$elm = icon$;
    // icon$.render(elm);
    return icon$;
  }
  if (elm.t === "img") {
    const img$ = DOMImg({ build });
    elm.$elm = img$;
    // img$.render(elm);
    return img$;
  }
  if (elm.t === "grid") {
    const grid$ = DOMGrid({ build });
    elm.$elm = grid$;
    // grid$.render(elm);
    return grid$;
  }
  if (elm.t === "input") {
    const input$ = DOMInput({ build });
    elm.$elm = input$;
    // input$.render(elm);
    return input$;
  }
  if (elm.t === "textarea") {
    const textarea$ = DOMTextarea({ build });
    elm.$elm = textarea$;
    // textarea$.render(elm);
    return textarea$;
  }
  if (elm.t === "checkbox") {
    const checkbox$ = DOMCheckbox({ build });
    elm.$elm = checkbox$;
    // checkbox$.render(elm);
    return checkbox$;
  }
  if (elm.t === "button") {
    const button$ = DOMButton({ build });
    elm.$elm = button$;
    // button$.render(elm);
    return button$;
  }
  if (elm.t === "portal") {
    const portal$ = DOMPortal({ build });
    elm.$elm = portal$;
    // portal$.render(elm);
    return portal$;
  }
  if (elm.t === "show") {
    const show$ = DOMShow({ build });
    elm.$elm = show$;
    // show$.render(elm);
    return show$;
  }
  if (elm.t === "match") {
    const match$ = DOMMatch({ build });
    elm.$elm = match$;
    // match$.render(elm);
    return match$;
  }
  if (elm.t === "for") {
    const for$ = DOMFor({ build });
    elm.$elm = for$;
    // for$.render(elm);
    return for$;
  }
  const view$ = DOMView({ build });
  // view$.render({
  //   t: "view",
  //   $elm: null as any,
  //   state: {},
  //   children: [
  //     {
  //       t: "text",
  //       $elm: null as any,
  //       state: { value: "unkonwn elm" },
  //     },
  //   ],
  // });
  return view$;
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
    if (typeof elm.onMounted === "function") {
      elm.onMounted({ reason: "append to $root", target: $elm });
    }
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
