import { isElement, TimelessElement } from "./view";

export function render(elm: TimelessElement, $root: HTMLDivElement) {
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }
  if (isElement(elm)) {
    const $content = elm.render();
    if (!$content) {
      console.error("[Render] Element render return null");
      return;
    }
    $root.appendChild($content);
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
