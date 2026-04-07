import { type TimelessElement, isElement } from "@timeless/primitive";

import { NativeView, isNativeView } from "@/host/view";
import { NativeText } from "@/host/text";
import { NativeImg } from "@/host/img";
import { NativeButton } from "@/host/button";
import { NativeInput } from "@/host/input";

function build(elm: TimelessElement): any {
  if (elm.t === "view") {
    const view$ = NativeView({ build });
    elm.$elm = view$;
    view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    const text$ = NativeText(elm.value as any);
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "img") {
    const img$ = NativeImg({ build });
    elm.$elm = img$;
    img$.render(elm);
    return img$;
  }
  if (elm.t === "button") {
    const button$ = NativeButton({ build });
    elm.$elm = button$;
    button$.render(elm);
    return button$;
  }
  if (elm.t === "input") {
    const input$ = NativeInput({ build });
    elm.$elm = input$;
    input$.render(elm);
    return input$;
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
    if (!isNativeView(host$)) {
      console.error("[Render] Element render return non NativeView");
      return;
    }
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
