import { ui, vm } from "@timeless/timeless";
import { classNames, computed, ref } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ResizablePanels · Bootstrap 5.3
 *
 * Bootstrap 没有分割面板，这里用 .resizable-panels / .resizable-panel /
 * .resizable-handle 命名空间，视觉上沿用 Bootstrap 的 border / focus-ring。
 */

export function ResizablePanels(
  props: ViewProps & {
    store: vm.ResizablePanelsCore;
    direction?: "horizontal" | "vertical";
  },
  children?: ViewChildren,
) {
  const { store, direction = "horizontal", class: cls, ...rest } = props;

  return ui.ResizablePanelsPrimitive.Group(
    {
      ...rest,
      store,
      direction,
      class: classNames([
        "resizable-panels",
        direction === "horizontal" ? "is-horizontal" : "is-vertical",
        cls,
      ]),
    },
    children,
  );
}

export function ResizablePanel(
  props: ViewProps & {
    store: vm.ResizablePanelCore;
    group: vm.ResizablePanelsCore;
  },
  children?: ViewChildren,
) {
  const { store, group, class: cls, ...rest } = props;

  return ui.ResizablePanelsPrimitive.Panel(
    {
      ...rest,
      store,
      group,
      class: classNames(["resizable-panel", cls]),
    },
    children,
  );
}

export function ResizableHandle(
  props: ViewProps & {
    store: vm.ResizablePanelsCore;
    panelBefore: vm.ResizablePanelCore;
    panelAfter: vm.ResizablePanelCore;
    withHandle?: boolean;
  },
  children?: ViewChildren,
) {
  const {
    store,
    panelBefore,
    panelAfter,
    withHandle = false,
    class: cls,
    ...rest
  } = props;

  const direction_ = ref(store.state.direction);

  store.onStateChange((state) => {
    direction_.as(state.direction);
  });

  const is_horizontal_ = computed(direction_, (d) => d === "horizontal");

  return ui.ResizablePanelsPrimitive.Handle(
    {
      ...rest,
      store,
      panelBefore,
      panelAfter,
      class: classNames([
        "resizable-handle",
        computed(is_horizontal_, (h) =>
          h ? "is-horizontal" : "is-vertical",
        ),
        cls,
      ]),
    },
    children ||
      (withHandle
        ? [View({ class: "resizable-handle-grip" }, [])]
        : []),
  );
}
