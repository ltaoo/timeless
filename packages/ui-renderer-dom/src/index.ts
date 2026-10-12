import { build } from "@timeless/timeless-dom";
import {
  createUiRenderer,
  type SlotRegistry,
  type UiRenderer,
} from "@timeless/ui-renderer";

/** Bind the portable UI renderer to the existing DOM host. */
export function createDOMRenderer(
  slots?: SlotRegistry,
): UiRenderer<HTMLElement> {
  return createUiRenderer(
    {
      mount(element, container: HTMLElement) {
        const node: Node = build(element).render();
        container.appendChild(node);
        return () => {
          if (node.parentNode === container) container.removeChild(node);
        };
      },
    },
    slots,
  );
}
