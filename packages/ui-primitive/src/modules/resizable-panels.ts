import { refobj, computed, ref, isRef } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  styleNames,
  getPlatform,
} from "@timeless/timeless";
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/inner-vm";

// ResizablePanels Group - 容器组件
export function Group(
  props: ViewProps & {
    store: ResizablePanelsCore;
    direction?: "horizontal" | "vertical";
  },
  children?: ViewChildren,
) {
  const { store, direction = "horizontal", ...rest } = props;
  // const state_ = refobj(store.state);

  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          display: "flex",
          width: "100%",
          height: "100%",
          "flex-direction": direction === "horizontal" ? "row" : "column",
        },
      ]),
      onMounted(event) {
        const $el = event.target;
        store.mount($el.get$elm());
        if (rest.onMounted) {
          rest.onMounted(event);
        }
      },
      onUnmounted() {
        store.unmount();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
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
      style: styleNames([
        rest.style,
        {
          "flex-basis": computed(size_, (size) => (size ? `${size}%` : "auto")),
          "flex-grow": computed(size_, (size) => (size ? 0 : 1)),
          "flex-shrink": 1,
        },
      ]),
      onMounted(event) {
        const $el = event.target;
        store.mount($el.get$elm());
        if (group) {
          group.registerPanel(store);
        }
        if (rest.onMounted) {
          rest.onMounted(event);
        }
      },
      onUnmounted() {
        store.unmount();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
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
  const is_dragging_ = ref(false);
  let cleanupMove = () => {};
  let cleanupUp = () => {};
  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          cursor: computed(state_, (state) =>
            state.direction === "horizontal" ? "col-resize" : "row-resize",
          ),
          "flex-shrink": 0,
          "user-select": "none",
        },
      ]),
      onMouseEnter(e: MouseEvent) {
        if (rest.onMouseEnter) {
          rest.onMouseEnter(e);
        }
      },
      onMouseLeave(e: MouseEvent) {
        if (rest.onMouseLeave) {
          rest.onMouseLeave(e);
        }
      },
      onPointerDown(e: PointerEvent) {
        // console.log("[ResizableHandle] onPointerDown triggered", e);
        e.preventDefault();
        is_dragging_.as(true);
        store.startResize(panelBefore, panelAfter, e);
        // console.log("[ResizableHandle] startResize called, isDragging:", isDragging_.value);

        // 设置全局光标样式
        const state = store.state;
        const cursor =
          state.direction === "horizontal" ? "col-resize" : "row-resize";
        getPlatform().patchBodyStyle({ cursor, userSelect: "none" });

        rest.onPointerDown?.(e);
      },
      onMounted(event) {
        const $el = event.target;
        // console.log("[ResizableHandle] mounted", el);
        const state = store.state;
        const cursor_classname =
          state.direction === "horizontal" ? "col-resize" : "row-resize";

        // 监听全局 pointer 事件
        const handlePointerMove = (e: PointerEvent) => {
          if (is_dragging_.value) {
            // console.log("[ResizableHandle] pointermove", e.clientX, e.clientY);
            store.resize(e);
          }
        };

        const handlePointerUp = (e: PointerEvent) => {
          if (is_dragging_.value) {
            // console.log("[ResizableHandle] pointerup");
            is_dragging_.as(false);
            store.endResize();
            // 恢复光标
            getPlatform().patchBodyStyle({ cursor: "", userSelect: "" });
          }
        };

        cleanupMove = getPlatform().addEventListener(
          "pointermove",
          handlePointerMove as EventListener,
        );
        cleanupUp = getPlatform().addEventListener(
          "pointerup",
          handlePointerUp as EventListener,
        );

        if (rest.onMounted) {
          rest.onMounted(event);
        }
      },
      beforeUnmounted() {
        if (rest.beforeUnmounted) {
          rest.beforeUnmounted();
        }
      },
      onUnmounted() {
        cleanupMove();
        cleanupUp();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
