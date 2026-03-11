import { refobj, computed, cn, sn } from "@timeless/reactive";
import {
  PopperCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Fragment } from "./fragment";

let layer_id_counter = 0;

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
  return View(
    {
      ...rest,
      onMounted($el: HTMLDivElement) {
        store.setReference({
          $el,
          getRect() {
            return $el.getBoundingClientRect();
          },
        });
        if (rest.onMounted) {
          rest.onMounted($el);
        }
      },
      onUnmounted() {
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
    /** 点击外部时的回调 */
    onDismiss?: () => void;
    /** 参考元素离开视口时的回调 */
    onReferenceOutOfView?: () => void;
  },
  children: ViewChildren = [],
) {
  const {
    store,
    zIndex = 99,
    onDismiss,
    onReferenceOutOfView,
    ...rest
  } = props;

  const state_ = refobj(store.state);

  // 初始化全局监听器
  initGlobalPointerListener();

  return View(
    {
      ...rest,
      class: cn(["t1-popper", rest.class]),
      style: sn([
        rest.style,
        computed(state_, (t) => {
          console.log("[Popper Content] computed style", {
            placed: t.isPlaced,
            x: t.x,
            y: t.y,
          });
          const ss: Record<string, any> = {
            "z-index": zIndex,
            position: "fixed",
            left: 0,
            top: 0,
            opacity: t.isPlaced ? 1 : 0,
            "pointer-event": t.isPlaced ? "initial" : "none",
            transform: t.isPlaced
              ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
              : "translate3d(0, 0, 0)",
          };
          return Object.keys(ss)
            .map((k) => `${k}: ${ss[k]}`)
            .join("; ");
        }),
      ]),
      onMounted($e: HTMLDivElement) {
        const $element = $e;
        const layer_id = `popper-${++layer_id_counter}`;
        store.setFloating({
          $el: $e,
          getRect() {
            return $e.getBoundingClientRect();
          },
        });

        // 滚动监听
        function handleScroll() {
          if (store.reference) {
            const ref_rect = store.reference.getRect();
            const $ref_el = (store.reference as any).$el;
            const is_virtual_element =
              !$ref_el || !($ref_el instanceof Element);
            // 虚拟元素（如右键菜单），滚动时关闭
            if (is_virtual_element && onReferenceOutOfView) {
              onReferenceOutOfView();
              return;
            }
            // 检查参考元素是否在视口内
            const is_in_viewport =
              ref_rect.top < window.innerHeight &&
              ref_rect.bottom > 0 &&
              ref_rect.left < window.innerWidth &&
              ref_rect.right > 0;
            if (!is_in_viewport && onReferenceOutOfView) {
              onReferenceOutOfView();
              return;
            }
          }
          store.place();
        }
        window.addEventListener("scroll", handleScroll, true);
        // 注册到 LayerManager
        if (onDismiss) {
          const layer_manager = getGlobalLayerManager();
          const layer: Layer = {
            id: layer_id,
            containsPoint(x: number, y: number) {
              if (!$element) {
                return false;
              }
              const rect = $element.getBoundingClientRect();
              // 同时检查 anchor 元素
              const $anchor_el = (store.reference as any)?.$el as
                | HTMLElement
                | undefined;
              if ($anchor_el) {
                const anchor_rect = $anchor_el.getBoundingClientRect();
                const in_anchor =
                  x >= anchor_rect.left &&
                  x <= anchor_rect.right &&
                  y >= anchor_rect.top &&
                  y <= anchor_rect.bottom;
                if (in_anchor) {
                  return true;
                }
              }
              return (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
              );
            },
            dismiss() {
              onDismiss();
            },
          };
          layer_manager.register(layer);
        }
        if (rest.onMounted) {
          rest.onMounted($e);
        }
        const unlisten = store.onStateChange((v) => {
          state_.as(v);
        });
        return () => {
          unlisten();
          store.setFloating(null);
          if (handleScroll) {
            window.removeEventListener("scroll", handleScroll, true);
          }
          // 从 LayerManager 注销
          if (layer_id) {
            const layerManager = getGlobalLayerManager();
            layerManager.unregister(layer_id);
          }
        };
      },
      onUnmounted() {
        // 清理监听器
        // for (const unlisten of unlisteners) {
        //   unlisten();
        // }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
