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
  const state_ = refobj(store.state);

  const isHorizontal = computed(state_, (s) => s.direction === "horizontal");

  return ResizablePanelsPrimitive.Handle(
    {
      ...rest,
      store,
      panelBefore,
      panelAfter,
      class: classNames([
        "relative flex items-center justify-center bg-gray-200 dark:bg-gray-800",
        "transition-colors hover:bg-gray-300 dark:hover:bg-gray-700",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400",
        computed(isHorizontal, (h) =>
          h
            ? "w-px cursor-col-resize hover:w-1"
            : "h-px cursor-row-resize hover:h-1"
        ),
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
