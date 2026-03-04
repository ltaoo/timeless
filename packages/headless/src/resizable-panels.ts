import { refobj, computed, ref, classNames } from "@timeless/reactive";
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";
import { TimelessElement, View, ViewChildren, ViewProps } from "./view";

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
      onMounted($el) {
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
  const state_ = refobj(store.state);

  return View(
    {
      ...rest,
      style: computed(state_, (state) => {
        const flexBasis = state.size ? `${state.size}%` : "auto";
        const flexGrow = state.size ? 0 : 1;
        const flexShrink = 1;
        return [
          `flex-basis: ${flexBasis}`,
          `flex-grow: ${flexGrow}`,
          `flex-shrink: ${flexShrink}`,
          "overflow: hidden",
        ]
          .filter(Boolean)
          .join("; ");
      }),
      onMounted($el) {
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
      onPointerDown(e: PointerEvent) {
        e.preventDefault();
        isDragging_.as(true);
        store.startResize(panelBefore, panelAfter, e);
        rest.onPointerDown?.(e);
      },
      onMounted(el: TimelessElement) {
        // 监听全局 pointer 事件
        const handlePointerMove = (e: PointerEvent) => {
          if (isDragging_.value) {
            store.resize(e);
          }
        };

        const handlePointerUp = (e: PointerEvent) => {
          if (isDragging_.value) {
            isDragging_.as(false);
            store.endResize();
          }
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);

        // 保存清理函数到元素上
        const cleanup = () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp);
        };
        (el as any)._resizeCleanup = cleanup;

        rest.onMounted?.(el);
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
