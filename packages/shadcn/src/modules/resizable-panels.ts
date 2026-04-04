import { ref, computed, classNames } from "@timeless/primitive";
import {
  ResizablePanelsPrimitive,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/primitive";
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
  const direction_ = ref(store.state.direction);

  store.onStateChange((state) => {
    direction_.as(state.direction);
  });

  const isHorizontal = computed(direction_, (d) => d === "horizontal");

  return ResizablePanelsPrimitive.Handle(
    {
      ...rest,
      store,
      panelBefore,
      panelAfter,
      class: classNames([
        "relative flex items-center justify-center bg-border",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
        "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        computed(isHorizontal, (h) =>
          h
            ? "w-px cursor-col-resize"
            : "h-px w-full cursor-row-resize after:left-0 after:h-1 after:w-full after:translate-x-0 after:-translate-y-1/2 [&>div]:rotate-90",
        ),
        rest.class,
      ]),
    },
    children ||
      (withHandle
        ? [
            View({
              class: "z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border",
            }),
          ]
        : []),
  );
}
