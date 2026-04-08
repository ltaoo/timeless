import { refobj, computed, ref, isRef } from "@timeless/reactive";
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { isStyleRef } from "@/style/index";
// import { getHost } from "@/host";

// ResizablePanels Group - 容器组件
export function Group(
  props: ViewProps & {
    store: ResizablePanelsCore;
    direction?: "horizontal" | "vertical";
  },
  children?: ViewChildren,
) {
  const { store, direction = "horizontal", ...rest } = props;
  const state_ = refobj(store.state);
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
        ...extraStyle,
        display: "flex",
        width: "100%",
        height: "100%",
        "flex-direction": direction === "horizontal" ? "row" : "column",
      },
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
        store.mount($el);
        rest.onMounted?.(event);
      },
      onUnmounted() {
        store.unmount();
        rest.onUnmounted?.();
      },
    },
    children,
  );
}

// ResizablePanel - 面板组件
export function Panel(
  props: ViewProps & {
    store: ResizablePanelCore;
    group?: ResizablePanelsCore;
  },
  children?: ViewChildren,
) {
  const { store, group, ...rest } = props;
  const size_ = ref(store.state.size);
  const extraStyle =
    rest.style &&
    typeof rest.style === "object" &&
    !isRef(rest.style) &&
    !isStyleRef(rest.style)
      ? rest.style
      : {};

  // 监听 state 变化
  store.onStateChange((state) => {
    console.log("[ResizablePanel] state changed", state);
    size_.as(state.size);
  });

  return View(
    {
      ...rest,
      style: {
        ...extraStyle,
        "flex-basis": computed(size_, (size) => (size ? `${size}%` : "auto")),
        "flex-grow": computed(size_, (size) => (size ? 0 : 1)),
        "flex-shrink": 1,
      },
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
        store.mount($el);
        if (group) {
          group.registerPanel(store);
        }
        rest.onMounted?.(event);
      },
      onUnmounted() {
        store.unmount();
        rest.onUnmounted?.();
      },
    },
    children,
  );
}

// ResizableHandle - 拖拽手柄组件
export function Handle(
  props: ViewProps & {
    store: ResizablePanelsCore;
    panelBefore: ResizablePanelCore;
    panelAfter: ResizablePanelCore;
  },
  children?: ViewChildren,
) {
  const { store, panelBefore, panelAfter, ...rest } = props;

  const state_ = refobj(store.state);
  const isDragging_ = ref(false);
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
        ...extraStyle,
        cursor: computed(state_, (state) =>
          state.direction === "horizontal" ? "col-resize" : "row-resize",
        ),
        "flex-shrink": 0,
        "user-select": "none",
      },
      onMouseEnter(e: MouseEvent) {
        rest.onMouseEnter?.(e);
      },
      onMouseLeave(e: MouseEvent) {
        rest.onMouseLeave?.(e);
      },
      onPointerDown(e: PointerEvent) {
        // console.log("[ResizableHandle] onPointerDown triggered", e);
        e.preventDefault();
        isDragging_.as(true);
        store.startResize(panelBefore, panelAfter, e);
        // console.log("[ResizableHandle] startResize called, isDragging:", isDragging_.value);

        // 设置全局光标样式
        const state = store.state;
        const cursor =
          state.direction === "horizontal" ? "col-resize" : "row-resize";
        // host.patchBodyStyle?.({ cursor, userSelect: "none" });

        rest.onPointerDown?.(e);
      },
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
        // console.log("[ResizableHandle] mounted", el);
        const state = store.state;
        const cursorClass =
          state.direction === "horizontal" ? "col-resize" : "row-resize";

        // 监听全局 pointer 事件
        const handlePointerMove = (e: PointerEvent) => {
          if (isDragging_.value) {
            // console.log("[ResizableHandle] pointermove", e.clientX, e.clientY);
            store.resize(e);
          }
        };

        const handlePointerUp = (e: PointerEvent) => {
          if (isDragging_.value) {
            // console.log("[ResizableHandle] pointerup");
            isDragging_.as(false);
            store.endResize();
            // 恢复光标
            // host.patchBodyStyle?.({ cursor: "", userSelect: "" });
          }
        };

        // host.addDocumentEventListener?.("pointermove", handlePointerMove);
        // host.addDocumentEventListener?.("pointerup", handlePointerUp);

        // 保存清理函数到元素上
        // const cleanup = () => {
        //   host.removeDocumentEventListener?.("pointermove", handlePointerMove);
        //   host.removeDocumentEventListener?.("pointerup", handlePointerUp);
        // };
        // ($el as any)._resizeCleanup = cleanup;

        rest.onMounted?.(event);
      },
      beforeUnmounted() {
        rest.beforeUnmounted?.();
      },
      onUnmounted() {
        rest.onUnmounted?.();
      },
    },
    children,
  );
}
