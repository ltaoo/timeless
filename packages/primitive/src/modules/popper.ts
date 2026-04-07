import { refobj, computed, isRef } from "@timeless/reactive";
import {
  PopperCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui";

import { styleNames, classNames } from "@/style";
import { View, ViewProps } from "@/content/view";
import { isElement, TimelessElement, ViewChildren } from "@/content/type";
import { Fragment } from "@/content/fragment";
import { MountedEvent } from "@/event";
import { Txt } from "@/content/text";

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
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
        store.setReference({
          $el,
          getRect() {
            return $el.getBoundingClientRect();
            // return host.getBoundingClientRect?.($el) as any;
          },
        });
        if (rest.onMounted) {
          rest.onMounted(event);
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
  // const host = getHost();
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

  // const extraStyle =
  //   rest.style &&
  //   typeof rest.style === "object" &&
  //   !isRef(rest.style) &&
  //   !isStyleRef(rest.style)
  //     ? rest.style
  //     : {};

  return View(
    {
      ...rest,
      class: classNames(["t1-popper", rest.class]),
      style: styleNames([
        // @ts-ignore
        props.style,
        {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          // @ts-ignore
          opacity: computed(state_, (t) => {
            return t.isPlaced ? 1 : 0;
          }),
          // @ts-ignore
          "pointer-event": computed(state_, (t) => {
            return t.isPlaced ? "initial" : "none";
          }),
          transform: computed(state_, (t) => {
            return t.isPlaced
              ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
              : "translate3d(0, 0, 0)";
          }),
        },
      ]),
      onMounted(event) {
        const $e = (event as any).target as HTMLDivElement;
        const $element = $e;
        const layer_id = `popper-${++layer_id_counter}`;
        store.setFloating({
          $el: $e,
          getRect() {
            // return host.getBoundingClientRect?.($e) as any;
            return $e.getBoundingClientRect();
          },
        });

        // 滚动监听
        function handleScroll() {
          if (store.reference) {
            const ref_rect = store.reference.getRect();
            const $ref_el = (store.reference as any).$el;
            const is_virtual_element =
              !$ref_el ||
              typeof ($ref_el as any).getBoundingClientRect !== "function";
            // 虚拟元素（如右键菜单），滚动时关闭
            if (is_virtual_element && onReferenceOutOfView) {
              onReferenceOutOfView();
              return;
            }
            // 检查参考元素是否在视口内
            // const viewport = host.getViewportSize?.() ?? {
            //   width: 0,
            //   height: 0,
            // };
            const viewport = { width: 0, height: 0 };
            const is_in_viewport =
              ref_rect.top < viewport.height &&
              ref_rect.bottom > 0 &&
              ref_rect.left < viewport.width &&
              ref_rect.right > 0;
            if (!is_in_viewport && onReferenceOutOfView) {
              onReferenceOutOfView();
              return;
            }
          }
          store.place();
        }
        // host.addDocumentEventListener?.("scroll", handleScroll, true);
        // 注册到 LayerManager
        if (onDismiss) {
          const layer_manager = getGlobalLayerManager();
          const layer: Layer = {
            id: layer_id,
            containsPoint(x: number, y: number) {
              if (!$element) {
                return false;
              }
              // const rect = host.getBoundingClientRect?.($element) as any;
              const rect = $element.getBoundingClientRect();
              // 同时检查 anchor 元素
              const $anchor_el = (store.reference as any)?.$el as
                | HTMLElement
                | undefined;
              if ($anchor_el) {
                // const anchor_rect = host.getBoundingClientRect?.(
                //   $anchor_el,
                // ) as any;
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
          rest.onMounted(event);
        }
        const unlisten = store.onStateChange((v) => {
          state_.as(v);
        });
        return () => {
          unlisten();
          store.setFloating(null);
          // host.removeDocumentEventListener?.("scroll", handleScroll, true);
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
