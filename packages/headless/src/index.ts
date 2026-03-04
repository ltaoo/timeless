import { LazyView } from "./lazy-view";
import {
  isElement,
  isLazyElement,
  TimelessComponent,
  TimelessElement,
  TimelessNormalComponent,
} from "./view";

console.log("headless v0.1.2");

export * from "@timeless/reactive";

// Reactive
export * from "./for";
export * from "./show";
export * from "./switch";

// Primitives
export * from "./view";
export * from "./fragment";
export * from "./svg";
export * from "./lazy-view";
export * from "./text";
export * from "./html";
export * from "./portal";
export * from "./presence";
export * from "./popper";
export * from "./transition";

// content
export * from "./flex";
export * from "./head";
export * from "./paragraph";
export * from "./table";
export * from "./avatar";
export * from "./card";
export * from "./label";
export * from "./badge";
export * from "./progress";
export * from "./separator";
export * from "./skeleton";
export * from "./alert";

// interactive
export * as ButtonPrimitive from "./button";
export * as MenuPrimitive from "./menu";
export * as DropdownMenuPrimitive from "./dropdown-menu";
export * as ContextMenuPrimitive from "./context-menu";
export * as ResizablePanelsPrimitive from "./resizable-panels";
export * from "./tabs";
export * from "./accordion";

// form
export * from "./input";
export * from "./textarea";
export * as SelectPrimitive from "./select";
export * as CheckboxPrimitive from "./checkbox";
export * from "./slider";
export * from "./toggle";
export * as FieldPrimitive from "./field";
export * from "./field";

// overlay
export * as PopoverPrimitive from "./popover";
export { PopoverProps } from "./popover";
export * from "./sheet";
export * from "./dialog";
export * from "./tooltip";
export * from "./toast";

export * from "./keep-alive-sub-views";
export * from "./sub-views";

// other
export * from "./theme";
export * from "./lazy";

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
