import { type TimelessElement, isElement } from "@timeless/timeless";

import { CanvasShow } from "@/host/show";
import { CanvasView, isCanvasView } from "@/host/view";
import { CanvasFor } from "@/host/for";
import { CanvasGrid } from "@/host/grid";
import { CanvasText } from "@/host/text";
import { CanvasHostNode } from "@/host/type";
import { CanvasDocument, createCanvasDocument } from "@/host/draw";

function build(
  elm: TimelessElement,
  canvas: CanvasDocument,
  opt: Partial<{ root: boolean }> = {},
): CanvasHostNode {
  if (elm.t === "view") {
    const view$ = CanvasView({ canvas, build });
    elm.$elm = view$;
    view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    const text$ = CanvasText(elm.value as any, canvas);
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "grid") {
    const grid$ = CanvasGrid({ canvas, build });
    elm.$elm = grid$;
    grid$.render(elm);
    return grid$;
  }
  if (elm.t === "show") {
    const show$ = CanvasShow({ canvas, build });
    elm.$elm = show$;
    show$.render(elm);
    return show$;
  }
  if (elm.t === "for") {
    const for$ = CanvasFor({ canvas, build });
    elm.$elm = for$;
    for$.render(elm);
    return for$;
  }
  return null;
}

export function render(
  elm: TimelessElement,
  $root: HTMLCanvasElement | null,
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
  const ctx = $root.getContext("2d");
  if (!ctx) {
    return;
  }
  const canvas = createCanvasDocument($root);

  if (isElement(elm)) {
    const host$ = build(elm, canvas, { root: true });
    if (!host$) {
      console.error("[Render] Element render return null");
      return;
    }
    if (!isCanvasView(host$)) {
      console.error("[Render] Element render return non CanvasView");
      return;
    }

    // 将根元素添加到 canvas.body 中
    canvas.appendChild(canvas.body, host$.$elm);
    // 调用 canvas.draw() 渲染整个文档树
    canvas.draw();
    if (typeof elm.onMounted === "function") {
      elm.onMounted({ target: host$.$elm });
    }
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
