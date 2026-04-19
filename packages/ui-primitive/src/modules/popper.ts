import { refobj, computed, isRef, getPlatform } from "@timeless/timeless";
import {
  styleNames,
  classNames,
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  ListenerManager,
} from "@timeless/timeless";
import {
  PopperCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui-vm";

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
  return Fragment(
    {
      ...rest,
      onMounted(event) {
        const $anchor = event.target.get$children()[0];
        console.log("[primitive]popper Anchor mounted - ", $anchor);
        store.setReference({
          $el: $anchor,
          getRect() {
            return $anchor.getBoundingClientRect();
          },
        });
        if (rest.onMounted) {
          return rest.onMounted(event);
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
  const listener$ = ListenerManager();

  // 初始化全局监听器
  initGlobalPointerListener();

  return View(
    {
      ...rest,
      class: classNames(["t1-popper", rest.class]),
      style: styleNames([
        props.style,
        {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: computed(state_, (t) => {
            return t.isPlaced ? 1 : 0;
          }),
          "pointer-events": computed(state_, (t) => {
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
        const $elm = event.target;
        const layer_id = `popper-${++layer_id_counter}`;
        const layer$ = getGlobalLayerManager();
        const platform = getPlatform();
        // console.log("the floating mounted", $elm.getBoundingClientRect());
        store.setFloating({
          $el: $elm,
          getRect() {
            return $elm.getBoundingClientRect();
          },
        });
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        // 监听滚动：优先使用 ScrollViewCore，否则使用 window
        if (store.view$) {
          // 滚动监听
          function handleScroll() {
            if (
              !store.reference ||
              !store.floating ||
              store.state.isPlaced === false
            ) {
              return;
            }
            const ref_rect = store.reference.getRect();
            // 检查参考元素是否在视口内
            const viewport = platform.getViewportSize();
            const is_in_viewport =
              ref_rect.top < viewport.height &&
              ref_rect.bottom > 0 &&
              ref_rect.left < viewport.width &&
              ref_rect.right > 0;
            if (!is_in_viewport && onReferenceOutOfView) {
              onReferenceOutOfView();
              return;
            }
            store.place();
          }
          listener$.add(
            store.view$.onScroll(() => {
              handleScroll();
            }),
          );
        }
        // 注册到 LayerManager
        if (onDismiss) {
          const layer: Layer = {
            id: layer_id,
            containsPoint(x: number, y: number) {
              if (!$elm) {
                return false;
              }
              // const rect = host.getBoundingClientRect?.($element) as any;
              const rect = $elm.getBoundingClientRect();
              // 同时检查 anchor 元素
              const $anchor_el = store.reference?.$el as
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
          layer$.register(layer);
        }
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return () => {
          listener$.destroy();
          store.setFloating(null);
          layer$.unregister(layer_id);
        };
      },
    },
    children,
  );
}
