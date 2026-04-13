import { type TimelessElement, isElement } from "@timeless/timeless";

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
    console.log("[Native Render] View created, children:", elm.children);
    view$.render(elm);
    // console.log("[Native Render] View rendered, $elm:", view$.$elm);
    return view$;
  }
  if (elm.t === "text") {
    console.log("[Native Render] Text element:", elm.state);
    const text$ = NativeText();
    text$.render(elm);
    console.log("[Native Render] Text rendered, $elm:", text$.$elm);
    return text$;
  }
  if (elm.t === "img") {
    const img$ = NativeImg({ build });
    img$.render(elm);
    return img$;
  }
  if (elm.t === "button") {
    const button$ = NativeButton({ build });
    button$.render(elm);
    return button$;
  }
  if (elm.t === "input") {
    const input$ = NativeInput({ build });
    input$.render(elm);
    return input$;
  }
  if (elm.t === "row") {
    const row$ = NativeRow({ build });
    row$.render(elm);
    return row$;
  }
  if (elm.t === "column") {
    const column$ = NativeColumn({ build });
    column$.render(elm);
    return column$;
  }
  if (elm.t === "checkbox") {
    const checkbox$ = NativeCheckbox({ build });
    checkbox$.render(elm);
    return checkbox$;
  }
  if (elm.t === "radio") {
    const radio$ = NativeRadio({ build });
    radio$.render(elm);
    return radio$;
  }
  if (elm.t === "textarea") {
    const textarea$ = NativeTextarea({ build });
    textarea$.render(elm);
    return textarea$;
  }
  if (elm.t === "for") {
    const for$ = NativeFor({ build });
    for$.render(elm);
    return for$;
  }
  if (elm.t === "show") {
    const show$ = NativeShow({ build });
    show$.render(elm);
    return show$;
  }
  if (elm.t === "match") {
    const match$ = NativeMatch({ build });
    match$.render(elm);
    return match$;
  }
  if (elm.t === "fragment") {
    const fragment$ = NativeFragment({ build });
    fragment$.render(elm);
    return fragment$;
  }
  if (elm.t === "portal") {
    const portal$ = NativePortal({ build });
    portal$.render(elm);
    return portal$;
  }
  if (elm.t === "lazy-view") {
    const lazyView$ = NativeLazyView({ build });
    lazyView$.render(elm);
    return lazyView$;
  }
  if (elm.t === "grid") {
    const grid$ = NativeGrid({ build });
    grid$.render(elm);
    return grid$;
  }
  if (elm.t === "label") {
    const label$ = NativeLabel({ build });
    label$.render(elm);
    return label$;
  }
  if (elm.t === "icon") {
    const icon$ = NativeIcon({ build });
    icon$.render(elm);
    return icon$;
  }
  if (elm.t === "file-picker") {
    const filePicker$ = NativeFilePicker({ build });
    filePicker$.render(elm);
    return filePicker$;
  }
  if (elm.t === "number-input") {
    const numberInput$ = NativeNumberInput({ build });
    numberInput$.render(elm);
    return numberInput$;
  }
  if (elm.t === "select") {
    const select$ = NativeSelect({ build });
    select$.render(elm);
    return select$;
  }
  return null;
}

export function render(
  elm: TimelessElement,
  $root: any,
  extra: Partial<{
    onVNodeCreated: (data: any) => void;
  }> = {},
) {
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

    if (isViewLike) {
      console.log(
        "[Native Render] pushing view to root children, $elm:",
        host$.$elm,
      );
      if ($root) {
        if (Array.isArray($root.children)) {
          $root.children.push(host$.$elm);
        }
      }
      if (typeof elm.onMounted === "function") {
        elm.onMounted({ target: host$.$elm });
      }
      return;
    }

    console.log(
      "[Native Render] pushing non-view to root children, $elm:",
      host$.$elm,
    );
    if ($root) {
      if (Array.isArray($root.children)) {
        $root.children.push(host$.$elm);
      }
    }
    if (typeof elm.onMounted === "function") {
      elm.onMounted({ target: host$.$elm });
    }
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
