import { refobj, computed, ref, sn } from "@timeless/reactive";
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";

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

  return View(
    {
      ...rest,
      style: ["display: flex", "width: 100%", "height: 100%"]
        .filter(Boolean)
        .join("; "),
      onMounted($el: HTMLDivElement) {
        store.mount($el);
        rest.onMounted?.($el);
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

  // 监听 state 变化
  store.onStateChange((state) => {
    console.log("[ResizablePanel] state changed", state);
    size_.as(state.size);
  });

  return View(
    {
      ...rest,
      style: sn([
        computed(size_, (size) => {
          const flexBasis = size ? `${size}%` : "auto";
          const flexGrow = size ? 0 : 1;
          const flexShrink = 1;
          return [
            `flex-basis: ${flexBasis}`,
            `flex-grow: ${flexGrow}`,
            `flex-shrink: ${flexShrink}`,
            // "overflow: hidden",
          ]
            .filter(Boolean)
            .join("; ");
        }),
        props.style,
      ]),
      onMounted($el: HTMLDivElement) {
        store.mount($el);
        if (group) {
          group.registerPanel(store);
        }
        rest.onMounted?.($el);
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

  return View(
    {
      ...rest,
      style: computed(state_, (state) => {
        const cursor =
          state.direction === "horizontal" ? "col-resize" : "row-resize";
        return [`cursor: ${cursor}`, "flex-shrink: 0", "user-select: none"]
          .filter(Boolean)
          .join("; ");
      }),
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
        document.body.style.cursor = cursor;
        document.body.style.userSelect = "none";

        rest.onPointerDown?.(e);
      },
      onMounted($el: HTMLDivElement) {
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
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
          }
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);

        // 保存清理函数到元素上
        const cleanup = () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp);
        };
        ($el as any)._resizeCleanup = cleanup;

        rest.onMounted?.($el);
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
