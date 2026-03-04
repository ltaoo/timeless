import {
  refobj,
  computed,
  cn,
  sn,
  isRef,
  classNames,
} from "@timeless/reactive";
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
    onReferenceOutOfView?: () => void;
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
    onReferenceOutOfView,
    ...rest
  } = props;

  const state_ = refobj(store.state);

  const unsliten = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
  ];

  let handlePointerDown: any;
  let handleScroll: any;

  return View(
    {
      ...rest,
      class: cn(["t1-popper", rest.class]),
      style: sn([
        rest.style,
        computed(state_, (t) => {
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
          const r = Object.keys(ss)
            .map((k) => {
              return `${k}: ${ss[k]}`;
            })
            .join("; ");
          console.log("rrrr", r);
          return r;
        }),
      ]),
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

        // Add scroll listener to update position on scroll
        handleScroll = () => {
          console.log("[PopperPrimitive.Content] scroll event triggered");
          // Check if reference element is in viewport
          if (store.reference) {
            const refRect = store.reference.getRect();
            console.log("[PopperPrimitive.Content] refRect:", refRect);

            // Check if this is a virtual element (no real DOM element)
            const refEl = (store.reference as any).$el;
            const isVirtualElement = !refEl || !(refEl instanceof Element);
            console.log(
              "[PopperPrimitive.Content] isVirtualElement:",
              isVirtualElement,
              "refEl:",
              refEl,
            );

            // For virtual elements (like context menu), close on scroll
            if (isVirtualElement && onReferenceOutOfView) {
              console.log(
                "[PopperPrimitive.Content] virtual element detected, closing on scroll",
              );
              onReferenceOutOfView();
              return;
            }

            const isInViewport =
              refRect.top < window.innerHeight &&
              refRect.bottom > 0 &&
              refRect.left < window.innerWidth &&
              refRect.right > 0;

            console.log(
              "[PopperPrimitive.Content] isInViewport:",
              isInViewport,
            );

            if (!isInViewport && onReferenceOutOfView) {
              console.log(
                "[PopperPrimitive.Content] calling onReferenceOutOfView",
              );
              onReferenceOutOfView();
              return;
            }
          }
          console.log("[PopperPrimitive.Content] calling store.place()");
          store.place();
        };
        window.addEventListener("scroll", handleScroll, true);

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
        if (rest.onMounted) {
          rest.onMounted($e);
        }
      },
      onUnmounted() {
        console.log(
          "[PopperPrimitive.Content] unmounted, removing listeners, isRoot:",
          isRootLayer,
        );
        store.setFloating(null);

        // Remove scroll listener
        if (handleScroll) {
          window.removeEventListener("scroll", handleScroll, true);
          handleScroll = null;
        }

        if (layer && handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
          handlePointerDown = null;
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
