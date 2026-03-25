import { refobj, computed } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";

export function Arrow(
  props: ViewProps & { store: PopperCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange(() => {
    state.as(store.state);
  });

  return View(
    {
      ...rest,
      style: computed(state, (s) => {
        const { arrow } = s.middlewareData || {};
        const { x, y } = arrow || {};

        const placement = s.placement || "bottom";
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0] as string];

        const style: any = {
          position: "absolute",
          left: x != null ? `${x}px` : "",
          top: y != null ? `${y}px` : "",
        };
        if (staticSide) {
          // style[staticSide] = "calc(-1 * var(--t1-popper-arrow-offset, 4px))";
          style[staticSide] = "calc(-1 * var(--t1-popper-arrow-offset, 6px))";
        }

        // Merge with user provided style
        if (typeof rest.style === "string") {
          return (
            Object.entries(style)
              .map(([k, v]) => `${k}:${v}`)
              .join(";") +
            ";" +
            rest.style
          );
        } else if (typeof rest.style === "object") {
          return { ...style, ...rest.style };
        }

        return Object.entries(style)
          .map(([k, v]) => `${k}:${v}`)
          .join(";");
      }),
      onMounted($el: HTMLDivElement) {
        const { width, height } = $el.getBoundingClientRect();
        $el.style.setProperty(
          "--t1-popper-arrow-offset",
          `${Math.ceil(Math.max(width, height) / 2)}px`,
        );
        if ((store as any).setArrowElement) {
          (store as any).setArrowElement($el);
        }
        if (store.setArrow) {
          store.setArrow({ width, height });
        }
      },
      onUnmounted() {
        if ((store as any).setArrowElement) {
          (store as any).setArrowElement(null);
        }
        if (store.setArrow) {
          store.setArrow(null);
        }
      },
    },
    children,
  );
}
