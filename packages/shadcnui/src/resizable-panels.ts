import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  ResizablePanelsPrimitive,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";

// ResizablePanels Group 组件
export function ResizablePanels(
  props: ViewProps & {
    store: ResizablePanelsCore;
    direction?: "horizontal" | "vertical";
  },
  children?: ViewChildren,
) {
  const { store, direction = "horizontal", ...rest } = props;

  return ResizablePanelsPrimitive.Group(
    {
      ...rest,
      store,
      direction,
      class: classNames([
        "flex h-full w-full",
        direction === "horizontal" ? "flex-row" : "flex-col",
        rest.class,
      ]),
    },
    children,
  );
}

// ResizablePanel 组件
export function ResizablePanel(
  props: ViewProps & {
    store: ResizablePanelCore;
    group: ResizablePanelsCore;
  },
  children?: ViewChildren,
) {
  const { store, group, ...rest } = props;

  return ResizablePanelsPrimitive.Panel(
    {
      ...rest,
      store,
      group,
      class: classNames([
        "relative overflow-hidden",
        rest.class,
      ]),
    },
    children,
  );
}

// ResizableHandle 组件
export function ResizableHandle(
  props: ViewProps & {
    store: ResizablePanelsCore;
    panelBefore: ResizablePanelCore;
    panelAfter: ResizablePanelCore;
    withHandle?: boolean;
  },
  children?: ViewChildren,
) {
  const { store, panelBefore, panelAfter, withHandle = false, ...rest } = props;
  const isHovered_ = ref(false);
  const isResizing_ = ref(store.state.isResizing);
  const direction_ = ref(store.state.direction);

  // 监听 store 状态变化
  store.onStateChange((state) => {
    console.log("[ResizableHandle] store state changed", state);
    isResizing_.as(state.isResizing);
    direction_.as(state.direction);
  });

  const isHorizontal = computed(direction_, (d) => d === "horizontal");

  return ResizablePanelsPrimitive.Handle(
    {
      ...rest,
      store,
      panelBefore,
      panelAfter,
      onMouseEnter() {
        console.log("[ResizableHandle] onMouseEnter");
        isHovered_.as(true);
      },
      onMouseLeave() {
        console.log("[ResizableHandle] onMouseLeave");
        isHovered_.as(false);
      },
      class: classNames([
        "relative flex items-center justify-center group",
        "after:absolute after:inset-0 after:pointer-events-none after:transition-all",
        combine({ isResizing: isResizing_, isHovered: isHovered_ }, (t) => {
          console.log("[ResizableHandle] computed bg color", { active: t.isResizing, hovered: t.isHovered });
          return t.isResizing || t.isHovered
            ? "after:bg-gray-300 dark:after:bg-gray-700"
            : "after:bg-gray-200 dark:after:bg-gray-800";
        }),
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400",
        combine({ isHorizontal, isResizing: isResizing_, isHovered: isHovered_ }, (t) => {
          console.log("[ResizableHandle] computed size", { h: t.isHorizontal, active: t.isResizing, hovered: t.isHovered });
          return t.isHorizontal
            ? `w-1 cursor-col-resize after:w-px after:left-1/2 after:-translate-x-1/2 ${t.isResizing || t.isHovered ? 'after:w-1 after:translate-x-0 after:left-0' : ''}`
            : `h-1 cursor-row-resize after:h-px after:top-1/2 after:-translate-y-1/2 ${t.isResizing || t.isHovered ? 'after:h-1 after:translate-y-0 after:top-0' : ''}`;
        }),
        rest.class,
      ]),
    },
    children || (withHandle ? [
      View(
        {
          class: classNames([
            "z-10 flex items-center justify-center rounded-sm border border-gray-200 bg-gray-200",
            "dark:border-gray-800 dark:bg-gray-800",
            computed(isHorizontal, (h) =>
              h ? "h-4 w-3" : "h-3 w-4"
            ),
          ]),
        },
        [
          View({
            class: classNames([
              "rounded-full bg-gray-400 dark:bg-gray-600",
              computed(isHorizontal, (h) =>
                h ? "h-2.5 w-0.5" : "h-0.5 w-2.5"
              ),
            ]),
          }),
        ],
      ),
    ] : []),
  );
}
