import { isElement, TimelessElement } from "@/primitive/view";
import { getHost } from "@/host";

export function render(elm: TimelessElement, $root: any) {
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }
  if (isElement(elm)) {
    const host = getHost();
    const $content = elm.render();
    if (!$content) {
      console.error("[Render] Element render return null");
      return;
    }
    host.appendChild($root, $content);
    return;
  }
  //   if (isLazyElement(elm)) {
  //     elm.then((m) => {
  //       const _elm = m.default();
  //       if (!isElement(_elm)) {
  //         console.error("[Render] Lazy component render return null");
  //         return;
  //       }
  //       const $content = _elm.render();
  //       if (!$content) {
  //         console.error("[Render] Lazy component render return null");
  //         return;
  //       }
  //       $root.appendChild($content);
  //     });
  //     return;
  //   }
  console.error("[Render] Root Element can't be lazy element");
}
