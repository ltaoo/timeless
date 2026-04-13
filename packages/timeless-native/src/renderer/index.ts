import { type TimelessElement, isElement } from "@timeless/timeless";

declare const __nativeBridge_render: (tree: any) => void;

import { NativeView, isNativeView } from "@/host/view";
import { NativeText } from "@/host/text";
import { NativeImg } from "@/host/img";
import { NativeButton } from "@/host/button";
import { NativeInput } from "@/host/input";
import { NativeRow } from "@/host/row";
import { NativeColumn } from "@/host/column";
import { NativeCheckbox } from "@/host/checkbox";
import { NativeRadio } from "@/host/radio";
import { NativeTextarea } from "@/host/textarea";
import { NativeFor } from "@/host/for";
import { NativeShow } from "@/host/show";
import { NativeMatch } from "@/host/match";
import { NativeFragment } from "@/host/fragment";
import { NativePortal } from "@/host/portal";
import { NativeLazyView } from "@/host/lazy-view";
import { NativeGrid } from "@/host/grid";
import { NativeLabel } from "@/host/label";
import { NativeIcon } from "@/host/icon";
import { NativeFilePicker } from "@/host/file-picker";
import { NativeNumberInput } from "@/host/number-input";
import { NativeSelect } from "@/host/select";

function build(elm: TimelessElement): any {
  console.log(
    "[Native Render] build called with element type:",
    elm?.t,
    "children:",
    elm?.children?.length,
  );

  if (elm.t === "view") {
    const view$ = NativeView({ build });
    elm.$elm = view$;
    return view$;
  }
  if (elm.t === "text") {
    const text$ = NativeText();
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "img") {
    const img$ = NativeImg({ build });
    elm.$elm = img$;
    return img$;
  }
  if (elm.t === "button") {
    const button$ = NativeButton({ build });
    elm.$elm = button$;
    return button$;
  }
  if (elm.t === "input") {
    const input$ = NativeInput({ build });
    elm.$elm = input$;
    return input$;
  }
  if (elm.t === "row") {
    const row$ = NativeRow({ build });
    elm.$elm = row$;
    return row$;
  }
  if (elm.t === "column") {
    const column$ = NativeColumn({ build });
    elm.$elm = column$;
    return column$;
  }
  if (elm.t === "checkbox") {
    const checkbox$ = NativeCheckbox({ build });
    elm.$elm = checkbox$;
    return checkbox$;
  }
  if (elm.t === "radio") {
    const radio$ = NativeRadio({ build });
    elm.$elm = radio$;
    return radio$;
  }
  if (elm.t === "textarea") {
    const textarea$ = NativeTextarea({ build });
    elm.$elm = textarea$;
    return textarea$;
  }
  if (elm.t === "for") {
    const for$ = NativeFor({ build });
    elm.$elm = for$;
    return for$;
  }
  if (elm.t === "show") {
    const show$ = NativeShow({ build });
    elm.$elm = show$;
    return show$;
  }
  if (elm.t === "match") {
    const match$ = NativeMatch({ build });
    elm.$elm = match$;
    return match$;
  }
  if (elm.t === "fragment") {
    const fragment$ = NativeFragment({ build });
    elm.$elm = fragment$;
    return fragment$;
  }
  if (elm.t === "portal") {
    const portal$ = NativePortal({ build });
    elm.$elm = portal$;
    return portal$;
  }
  if (elm.t === "lazy-view") {
    const lazyView$ = NativeLazyView({ build });
    elm.$elm = lazyView$;
    return lazyView$;
  }
  if (elm.t === "grid") {
    const grid$ = NativeGrid({ build });
    elm.$elm = grid$;
    return grid$;
  }
  if (elm.t === "label") {
    const label$ = NativeLabel({ build });
    elm.$elm = label$;
    return label$;
  }
  if (elm.t === "icon") {
    const icon$ = NativeIcon({ build });
    elm.$elm = icon$;
    return icon$;
  }
  if (elm.t === "file-picker") {
    const filePicker$ = NativeFilePicker({ build });
    elm.$elm = filePicker$;
    return filePicker$;
  }
  if (elm.t === "number-input") {
    const numberInput$ = NativeNumberInput({ build });
    elm.$elm = numberInput$;
    return numberInput$;
  }
  if (elm.t === "select") {
    const select$ = NativeSelect({ build });
    elm.$elm = select$;
    return select$;
  }
  return NativeView({ build });
}

export function render(elm: TimelessElement) {
  console.log(
    "[Native Render] render called, elm:",
    elm?.t,
    "children:",
    elm?.children?.length,
  );

  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  if (isElement(elm)) {
    console.log("[Native Render] isElement true, building...");
    const host$ = build(elm);
    console.log(
      "[Native Render] build returned:",
      host$?.$elm,
      "type:",
      host$?.t,
    );

    if (!host$) {
      console.error("[Render] Element render return null", elm.t);
      return;
    }
    const isViewLike = isNativeView(host$) || host$.getType() === "view";
    console.log("[Native Render] isViewLike:", isViewLike);
    const $root = host$.render(elm);
    __nativeBridge_render($root);
    console.log("[Native Render] pushing view to root children, $elm:");
    setTimeout(() => {
      if (typeof elm.onMounted === "function") {
        elm.onMounted({ target: $root });
      }
    }, 0);
    return;
  }
  console.error("[Render] Root Element can't be lazy element");
  return;
}
