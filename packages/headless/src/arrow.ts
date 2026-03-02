import { refobj, computed } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";

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
          style[staticSide] = "-4px";
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
      onMounted($el) {
        if (store.setArrow) {
          store.setArrow($el);
        }
      },
      onUnmounted() {
        if (store.setArrow) {
          store.setArrow(null);
        }
      },
    },
    children,
  );
}
