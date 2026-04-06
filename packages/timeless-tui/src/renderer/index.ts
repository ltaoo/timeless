import { type TimelessElement, isElement } from "@timeless/timeless";

import { TuiShow } from "@/host/show";
import { TuiView, isTuiView } from "@/host/view";
import { TuiFor } from "@/host/for";
import { TuiGrid } from "@/host/grid";
import { TuiText } from "@/host/text";
import { TuiHostNode } from "@/host/type";

export function build(
  elm: TimelessElement,
  opt: Partial<{ root: boolean }> = {},
): TuiHostNode {
  if (elm.t === "view") {
    const view$ = TuiView({ build });
    elm.$elm = view$;
    view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    const text$ = TuiText(elm.value as any);
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "grid") {
    const grid$ = TuiGrid({ build });
    elm.$elm = grid$;
    grid$.render(elm);
    return grid$;
  }
  if (elm.t === "show") {
    const show$ = TuiShow({ build });
    elm.$elm = show$;
    show$.render(elm);
    return show$;
  }
  if (elm.t === "for") {
    const for$ = TuiFor({ build });
    elm.$elm = for$;
    for$.render(elm);
    return for$;
  }
  return null;
}

export function render(
  elm: TimelessElement,
  extra: Partial<{
    onVNodeCreated: (data: any) => void;
  }> = {},
) {
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  if (isElement(elm)) {
    const host$ = build(elm, { root: true });
    if (!host$) {
      console.error("[Render] Element render return null");
      return;
    }
    if (!isTuiView(host$)) {
      console.error("[Render] Element render return non TuiView");
      return;
    }

    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
