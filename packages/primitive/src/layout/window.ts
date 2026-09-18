import { computed, refobj, Ref } from "@timeless/inner-reactive";

import { ViewProps, View } from "@/content/view";
import { ViewChildren, isElement, destroyElement, resolve_children } from "@/content/type";
import { Text } from "@/content/text";
import { Box } from "@/content/box";
import { MountedEvent } from "@/event";

export type WindowViewProps = ViewProps & {
  width?: number | "100%";
  height?: number | "100%";
};

type WindowViewState = {
  width: number | "100%";
  height: number | "100%";
};

export function WindowView(props: WindowViewProps, children?: ViewChildren) {
  const { width = "100%", height = "100%", ...rest } = props;

  let $elm: any = null;
  const box$ = Box<WindowViewState>(rest, {
    width,
    height,
  } as WindowViewState);
  const state = box$.state;

  const methods = {
    // subscribe_props() {
    //   box$.methods.subscribe_props();
    //   state.width = width;
    //   state.height = height;
    // },
  };

  // methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "window",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    methods,
  };
}

/** Props for Window component */
export type WindowProps = ViewProps & {
  /** 标题（支持响应式） */
  title?: string | Ref<string | number>;
  /** 初始位置（px，fixed 定位），默认 24 */
  x?: number;
  y?: number;
  /** 默认 420 */
  width?: number | string;
  /** 默认 "auto" */
  height?: number | string;
  /** z-index（支持响应式，层级变化不重建窗口），默认 240 */
  zIndex?: number | Ref<number>;
  /** 头部是否可拖动，默认 true */
  draggable?: boolean;
  /** 提供时渲染关闭按钮 */
  onClose?: () => void;
  /** 位置变化回调 */
  onPositionChange?: (position: { x: number; y: number }) => void;
  /** 窗口内任意 pointerdown（冒泡到根）时回调，用于置顶聚焦 */
  onActivate?: () => void;
  /**
   * 拖动结束回调。命名与继承自 BoxEvents 的 `onDragEnd(e: DragEvent)` 区分，
   * 程序化 setPosition 不会触发本回调。
   */
  onDragFinish?: (position: { x: number; y: number }) => void;
  headerClass?: string;
  bodyClass?: string;
  closeClass?: string;
  /** 默认 "关闭" */
  closeLabel?: string;
  /** 默认 Text("×") */
  closeIcon?: ViewChildren;
};

/**
 * Window - 可拖动的浮动窗口。
 *
 * 根节点是 `t: "view"`（position: fixed），不是 `t: "window"`
 * ——后者是渲染器约定的视口容器类型。拖拽由头部 View 的指针事件驱动，
 * 位置状态由 `methods.beginDrag / dragTo / endDrag` 维护（纯数学，可单测）。
 *
 * @example
 * ```tsx
 * Window(
 *   { title: "执行日志", x: 120, y: 80, width: 420, onClose: () => close() },
 *   [View({}, ["content"])],
 * );
 * ```
 */
/**
 * 尺寸归一化为 CSS 值。宿主不会给纯数字补单位（数字会变成非法样式被丢弃），
 * 所以这里统一处理；`width: 420` → `"420px"`，字符串原样透传。
 */
function css_size(value: number | string | undefined, fallback: string): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value}px` : fallback;
  }
  const text = String(value ?? "").trim();
  return text === "" ? fallback : text;
}

export function Window(props: WindowProps, children?: ViewChildren) {
  const {
    title = "",
    x = 24,
    y = 24,
    width = 420,
    height = "auto",
    zIndex = 240,
    draggable = true,
    onClose,
    onPositionChange,
    onActivate,
    onDragFinish,
    headerClass,
    bodyClass,
    closeClass,
    closeLabel = "关闭",
    closeIcon,
    style: style_prop,
    ...rest
  } = props;

  let $elm: any = null;

  const position_ = refobj({
    x: Number.isFinite(Number(x)) ? Number(x) : 24,
    y: Number.isFinite(Number(y)) ? Number(y) : 24,
  });
  const drag_ = refobj({
    start_x: 0,
    start_y: 0,
    origin_x: 0,
    origin_y: 0,
    pressing: false,
  });

  function get_position() {
    const position = position_.value || { x: 0, y: 0 };
    return { x: position.x, y: position.y };
  }

  function set_position(next?: { x: number; y: number } | null) {
    if (!next || typeof next !== "object") return null;
    const next_x = Number(next.x);
    const next_y = Number(next.y);
    if (!Number.isFinite(next_x) || !Number.isFinite(next_y)) return null;
    position_.as({ x: next_x, y: next_y });
    const position = { x: next_x, y: next_y };
    onPositionChange?.(position);
    return position;
  }

  const methods = {
    /** 开始拖动：记录按下点与窗口原点 */
    beginDrag(client_x: number, client_y: number) {
      const origin = get_position();
      drag_.as({
        start_x: Number(client_x) || 0,
        start_y: Number(client_y) || 0,
        origin_x: origin.x,
        origin_y: origin.y,
        pressing: true,
      });
      return origin;
    },
    /** 拖动到指针位置（按相对按下点的位移平移） */
    dragTo(client_x: number, client_y: number) {
      const drag = drag_.value;
      if (!drag || !drag.pressing) return null;
      return set_position({
        x: drag.origin_x + (Number(client_x) || 0) - drag.start_x,
        y: drag.origin_y + (Number(client_y) || 0) - drag.start_y,
      });
    },
    /** 结束拖动 */
    endDrag() {
      const drag = drag_.value;
      if (!drag || !drag.pressing) return null;
      drag_.as({ ...drag, pressing: false });
      const position = get_position();
      onDragFinish?.(position);
      return position;
    },
    getPosition: get_position,
    setPosition: set_position,
  };

  const close_children = resolve_children(closeIcon ?? Text("×")) || [];

  const header$ = View(
    {
      class: ["timeless-window__header", headerClass].filter(Boolean).join(" "),
      onPointerDown(event) {
        if (!draggable) return;
        if (typeof event.button === "number" && event.button !== 0) return;
        methods.beginDrag(event.clientX, event.clientY);
      },
      // View 只在按下期间派发 onPointerMove，故直接按指针位移平移
      onPointerMove(event) {
        if (!draggable) return;
        methods.dragTo(event.clientX, event.clientY);
      },
      onPointerUp() {
        if (!draggable) return;
        methods.endDrag();
      },
    },
    [
      View({ class: "timeless-window__title" }, [Text(title)]),
      onClose
        ? View(
            {
              class: ["timeless-window__close", closeClass]
                .filter(Boolean)
                .join(" "),
              attributes: {
                role: "button",
                tabindex: "0",
                "aria-label": closeLabel,
              },
              // 关闭按钮在头部内，按下时不要冒泡给头部的拖拽处理
              onPointerDown(event) {
                event.stopPropagation();
              },
              onClick(event) {
                event.stopPropagation();
                onClose();
              },
              onKeyDown(event) {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onClose();
              },
            },
            close_children,
          )
        : null,
    ].filter(Boolean),
  );

  const body$ = View(
    {
      class: ["timeless-window__body", bodyClass].filter(Boolean).join(" "),
    },
    children,
  );

  const box$ = Box(
    {
      ...rest,
      style: {
        position: "fixed",
        left: computed(position_, (position) => `${position.x}px`),
        top: computed(position_, (position) => `${position.y}px`),
        width: css_size(width, "420px"),
        height: css_size(height, "auto"),
        "z-index": zIndex,
        ...((style_prop || {}) as Record<string, any>),
      },
    },
    {},
  );
  const state = box$.state;
  const events = box$.events;

  const _mount_cleanups: (() => void)[] = [];

  const _unmount = () => {
    _mount_cleanups.forEach((fn) => fn());
    _mount_cleanups.length = 0;
    box$.methods.set$elm(null);
    if (rest.onUnmounted) {
      rest.onUnmounted();
    }
    state.rendered = false;
    $elm = null;
  };

  box$.methods.subscribe_props();
  box$.methods.add_event();
  // 任意位置的 pointerdown 冒泡到根即视为激活；保留调用方自己的 onPointerDown
  const prev_pointer_down = events.onPointerDown;
  events.onPointerDown = (event) => {
    prev_pointer_down?.(event);
    onActivate?.();
  };
  box$.methods.build_children([header$, body$]);

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    methods,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (rest.onMounted) {
        const cleanup = rest.onMounted(event);
        if (typeof cleanup === "function") {
          _mount_cleanups.push(cleanup);
        }
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      _unmount();
    },
    destroy() {
      _unmount();
      box$.methods.destroy();
      for (let i = 0; i < state.children.length; i += 1) {
        destroyElement(state.children[i]);
      }
    },
  };
}

export type Window = ReturnType<typeof Window>;
