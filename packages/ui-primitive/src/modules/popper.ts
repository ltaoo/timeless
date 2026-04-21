import { refobj, computed, getPlatform } from "@timeless/timeless";
import {
  styleNames,
  classNames,
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Show,
  ListenerManager,
} from "@timeless/timeless";
import {
  PopperCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui-vm";

import * as ScrollViewPrimitive from "@/modules/scroll-view";

const platform = getPlatform();
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
        computed(state_, (t) => {
          if (store.mode === "item-aligned") {
            return {
              "z-index": zIndex,
              display: "flex",
              "flex-direction": "column",
              position: "fixed",
              "box-sizing": "border-box",
              opacity: t.isPlaced ? 1 : 0,
              "pointer-events": t.isPlaced ? "initial" : "none",
              // transform: t.isPlaced
              //   ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
              //   : "translate3d(0, 0, 0)",
              left: t.x !== undefined ? `${t.x}px` : undefined,
              // right: pos.right !== undefined ? `${pos.right}px` : undefined,
              top: t.top !== undefined ? `${t.top}px` : undefined,
              // bottom:
              //   pos.bottom !== undefined ? `${pos.bottom}px` : undefined,
              bottom: t.bottom !== undefined ? `${t.bottom}px` : undefined,
              height: t.height !== undefined ? `${t.height}px` : undefined,
              "min-width":
                t.minWidth !== undefined ? `${t.minWidth}px` : undefined,
              // "max-height":
              //   pos.maxHeight !== undefined
              //     ? `${pos.maxHeight}px`
              //     : undefined,
              // "min-height":
              //   pos.minHeight !== undefined
              //     ? `${pos.minHeight}px`
              //     : undefined,
              margin: t.margin !== undefined ? `${t.margin}px 0` : undefined,
            };
          }
          return {
            "z-index": zIndex,
            position: "fixed",
            left: 0,
            top: 0,
            opacity: t.isPlaced ? 1 : 0,
            "pointer-events": t.isPlaced ? "initial" : "none",
            transform: t.isPlaced
              ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
              : "translate3d(0, 0, 0)",
          };
        }),
      ]),
      onMounted(event) {
        console.log("-------- POPPER content mounted -------------");

        const $elm = event.target;
        const layer_id = `popper-${++layer_id_counter}`;
        const layer$ = getGlobalLayerManager();
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

export function Viewport(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);

  const listener$ = ListenerManager([state_]);

  return ScrollViewPrimitive.Root(
    {
      ...rest,
      store: store.viewport$,
      onMounted(event) {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    children,
  );
}

export function ScrollUpButton(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  const listener$ = ListenerManager([state_]);
  listener$.add(
    store.onStateChange((v) => {
      state_.as(v);
    }),
  );

  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          display: computed(state_, (s) =>
            s.canScrollUp ? undefined : "none",
          ),
        },
      ]),
      onMounted(event) {
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    children,
  );
}

export function ScrollDownButton(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  const listener$ = ListenerManager();
  listener$.add(
    store.onStateChange((v) => {
      state_.as(v);
    }),
  );

  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          display: computed(state_, (s) =>
            s.canScrollDown ? undefined : "none",
          ),
        },
      ]),
      onMounted(event) {
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    children,
  );
}
