import { refobj, computed, isRef } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui";

import { ClassNameRef, classNames, isClassName } from "@/vnode/class-names";
import { isStyleRef, styleNames } from "@/vnode/style-names";
import { View, ViewChildren, ViewProps } from "@/content/view";
import { getHost } from "@/host";

export function Arrow(
  props: ViewProps & { store: PopperCore },
  children?: ViewChildren,
) {
  const host = getHost();
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
          const x = s.middlewareData?.arrow?.x;
          return x != null ? `${x}px` : undefined;
        }),
        top: computed(state, (s) => {
          const placementSide = (s.placement || "bottom").split("-")[0];
          if (placementSide === "bottom") {
            return "calc(-1 * var(--t1-popper-arrow-offset, 6px))";
          }
          const y = s.middlewareData?.arrow?.y;
          return y != null ? `${y}px` : undefined;
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
        const $el = (event as any).target as HTMLDivElement;
        const rect = host.getBoundingClientRect?.($el) as any;
        const width = rect?.width ?? 0;
        const height = rect?.height ?? 0;
        host.patchStyle?.($el, {
          "--t1-popper-arrow-offset": `${Math.ceil(Math.max(width, height) / 2)}px`,
        });
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
