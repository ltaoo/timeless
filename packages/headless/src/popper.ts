import { refobj, computed, cn } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
// import { Arrow } from "./arrow";
import { Fragment } from "./fragment";

export function Root(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren = [],
) {
  return Fragment(props, children);
}

export function Anchor(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  console.log("[Popper Anchor] created");
  return View(
    {
      ...rest,
      onMounted($el) {
        console.log("[Popper Anchor] mounted");
        store.setReference({
          getRect() {
            const rect = $el.getBoundingClientRect();
            return rect;
          },
        });
        if (rest.onMounted) {
          rest.onMounted($el);
        }
      },
      onUnmounted() {
        console.log("[Popper Anchor] unmounted");
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & {
    zIndex?: number;
    store: PopperCore;
    layer?: any;
    getParentLayer?: () => any;
    getAllParentLayers?: () => any[];
    isRootLayer?: boolean;
  },
  children: ViewChildren = [],
) {
  const {
    store,
    zIndex = 99,
    layer,
    getParentLayer,
    getAllParentLayers,
    isRootLayer = true,
    ...rest
  } = props;

  const state_ = refobj(store.state);

  const unsliten = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
  ];

  let handlePointerDown: any;

  return View(
    {
      ...rest,
      class: cn(["t1-popper", rest.class]),
      style: computed(state_, (t) => {
        const ss: Record<string, any> = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: t.isPlaced ? 100 : 0,
          transform: t.isPlaced
            ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        };
        return Object.keys(ss)
          .map((k) => {
            return `${k}: ${ss[k]}`;
          })
          .join("; ");
      }),
      onMounted($e: HTMLElement) {
        console.log(
          "[PopperPrimitive.Content] mounted, has layer:",
          !!layer,
          "isRootLayer:",
          isRootLayer,
        );
        store.setFloating({
          $el: $e,
          getRect() {
            return $e.getBoundingClientRect();
          },
        });
        if (layer) {
          // Only register document listener for root layer
          if (isRootLayer) {
            handlePointerDown = () => {
              console.log(
                "[PopperPrimitive.Content] handlePointerDownOnTop called on ROOT",
              );
              layer.handlePointerDownOnTop();
            };
            document.addEventListener("pointerdown", handlePointerDown);
            console.log(
              "[PopperPrimitive.Content] registered document listener for ROOT",
            );
          }
          $e.addEventListener("pointerdown", () => {
            console.log(
              "[PopperPrimitive.Content] element pointerdown, marking layer, isRoot:",
              isRootLayer,
            );
            layer.pointerDown();
            // Mark all parent layers as pointer inside
            if (getAllParentLayers) {
              const parentLayers = getAllParentLayers();
              console.log(
                "[PopperPrimitive.Content] marking parent layers, count:",
                parentLayers.length,
              );
              for (const parentLayer of parentLayers) {
                if (parentLayer) {
                  parentLayer.pointerDown();
                }
              }
            } else if (getParentLayer) {
              // Fallback to old recursive method for backward compatibility
              let currentLayer = getParentLayer();
              while (currentLayer) {
                currentLayer.pointerDown();
                currentLayer = currentLayer.getParentLayer
                  ? currentLayer.getParentLayer()
                  : null;
              }
            }
          });
        }
      },
      onUnmounted() {
        console.log(
          "[PopperPrimitive.Content] unmounted, removing listeners, isRoot:",
          isRootLayer,
        );
        store.setFloating(null);
        if (layer && handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
          handlePointerDown = null;
        }
      },
    },
    children,
  );
}
