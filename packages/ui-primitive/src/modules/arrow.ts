import { refobj, computed, isRef } from "@timeless/timeless";
import { View, ViewProps, ViewChildren, isStyleRef } from "@timeless/timeless";
import { PopperCore } from "@timeless/ui-vm";

// import { getHost } from "@/host";

export function Arrow(
  props: ViewProps & { store: PopperCore },
  children?: ViewChildren,
) {
  // const host = getHost();
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange(() => {
    state.as(store.state);
  });

  const extraStyle =
    rest.style &&
    typeof rest.style === "object" &&
    !isRef(rest.style) &&
    !isStyleRef(rest.style)
      ? rest.style
      : {};

  return View(
    {
      ...rest,
      style: {
        position: "absolute",
        left: computed(state, (s) => {
          const placementSide = (s.placement || "bottom").split("-")[0];
          if (placementSide === "right") {
            return "calc(-1 * var(--t1-popper-arrow-offset, 6px))";
          }
          // const x = s.middleware_data?.arrow?.x;
          // return x != null ? `${x}px` : undefined;
          return undefined;
        }),
        top: computed(state, (s) => {
          const placementSide = (s.placement || "bottom").split("-")[0];
          if (placementSide === "bottom") {
            return "calc(-1 * var(--t1-popper-arrow-offset, 6px))";
          }
          // const y = s.middlewareData?.arrow?.y;
          // return y != null ? `${y}px` : undefined;
          return undefined;
        }),
        right: computed(state, (s) => {
          const placementSide = (s.placement || "bottom").split("-")[0];
          return placementSide === "left"
            ? "calc(-1 * var(--t1-popper-arrow-offset, 6px))"
            : undefined;
        }),
        bottom: computed(state, (s) => {
          const placementSide = (s.placement || "bottom").split("-")[0];
          return placementSide === "top"
            ? "calc(-1 * var(--t1-popper-arrow-offset, 6px))"
            : undefined;
        }),
        ...extraStyle,
      },
      onMounted(event) {
        const $el = event.target;
        const rect = $el.getBoundingClientRect();
        const width = rect?.width ?? 0;
        const height = rect?.height ?? 0;
        $el.setStyleValue(
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
