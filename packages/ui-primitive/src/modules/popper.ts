import { refobj, computed, Logger } from "../core";
import {
  styleNames,
  classNames,
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Show,
  ListenerManager,
} from "../core";
import {
  PopperCore,
  DismissableLayerCore,
  initGlobalPointerListener,
  getGlobalLayerManager,
} from "@timeless/inner-vm";

const POPOVER_BASE_Z = 300;
const Z_INDEX_NEST_GAP = 50;

import * as ScrollViewPrimitive from "@/modules/scroll-view";

const logger = Logger({ prefix: "ui-primitive", scope: "popper" });

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
    zIndex: manualZIndex,
    onDismiss,
    onReferenceOutOfView,
    ...rest
  } = props;

  const zIndex =
    manualZIndex ??
    POPOVER_BASE_Z + getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

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
            const next_style = {
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
            logger.log("Content item-aligned style computed", {
              state: {
                x: t.x,
                y: t.y,
                top: t.top,
                bottom: t.bottom,
                height: t.height,
                minWidth: t.minWidth,
                margin: t.margin,
                isPlaced: t.isPlaced,
                placement: t.placement,
                maxHeight: t.maxHeight,
              },
              style: next_style,
            });
            return next_style;
          }
          const anchor_y = t.anchorY;
          const use_bottom_anchor =
            t.placement.split("-")[0] === "top" && typeof anchor_y === "number";
          const translate_y = use_bottom_anchor ? anchor_y : t.y;

          return {
            "z-index": zIndex,
            position: t.strategy,
            left: 0,
            top: 0,
            opacity: t.isPlaced ? 1 : 0,
            "pointer-events": t.isPlaced ? "initial" : "none",
            transform: t.isPlaced
              ? `translate3d(${Math.round(t.x)}px, ${Math.round(translate_y)}px, 0)${use_bottom_anchor ? " translateY(-100%)" : ""}`
              : "translate3d(0, 0, 0)",
            height: t.height !== undefined ? `${t.height}px` : undefined,
          };
        }),
      ]),
      onMounted(event) {
        console.log("[DEBUG] PopperPrimitive.Content onMounted", store.mode);
        const $elm = event.target;
        const dismissableLayer$ = new DismissableLayerCore();
        // logger.log("the floating mounted", $elm.getBoundingClientRect());
        store.setFloating({
          $el: $elm,
          getRect() {
            return $elm.getBoundingClientRect();
          },
        });
        listener$.add(
          store.onStateChange((v) => {
            logger.log("Content received StateChange", {
              mode: store.mode,
              height: v.height,
              top: v.top,
              bottom: v.bottom,
              x: v.x,
              y: v.y,
              anchorY: v.anchorY,
              minWidth: v.minWidth,
              margin: v.margin,
              isPlaced: v.isPlaced,
              placement: v.placement,
            });
            state_.as(v);
          }),
        );
        listener$.add(
          store.onReferenceOutOfView(() => {
            onReferenceOutOfView?.();
          }),
        );
        // 注册到 LayerManager
        if (onDismiss) {
          dismissableLayer$.setRect(() => {
            if (store.mode === "item-aligned") {
              const children = $elm.get$children();
              if (children && children[0]) {
                return children[0].getBoundingClientRect();
              }
            }
            return $elm.getBoundingClientRect();
          });
          dismissableLayer$.addBranch(() => store.reference?.getRect());
          listener$.add(
            dismissableLayer$.onDismiss(() => {
              logger.log("dismiss popper with layer click");
              dismissableLayer$.unregister();
              onDismiss();
            }),
          );
          dismissableLayer$.register();
        }
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return () => {
          store.reset();
          listener$.destroy();
          dismissableLayer$.unregister();
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
        // if (store.state.viewportOffsetTop !== undefined) {
        //   store.viewport$.setScrollTop(store.state.viewportOffsetTop);
        // }
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

  return Show({
    when: computed(state_, (s) => s.canScrollUp),
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
    ok() {
      return [
        View(
          {
            ...rest,
            style: styleNames([
              rest.style,
              {
                opacity: computed(state_, (s) => (s.hideScrollUp ? 0 : 1)),
              },
            ]),
          },
          children,
        ),
      ];
    },
  });
}

export function ScrollDownButton(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  const listener$ = ListenerManager([state_]);

  return Show({
    when: computed(state_, (s) => s.canScrollDown),
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
    ok() {
      return View(
        {
          ...rest,
          style: styleNames([
            rest.style,
            {
              opacity: computed(state_, (s) => (s.hideScrollDown ? 0 : 1)),
            },
          ]),
        },
        children,
      );
    },
  });
}
