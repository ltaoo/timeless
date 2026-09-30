import { ui, vm } from "@timeless/timeless";
import { classNames, computed, ref } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ResizablePanels · Fluent 2
 *
 * Fluent 2 的 1px stroke + 4px 圆角 + 分级阴影：
 *   .fl-resizable / .fl-resizable__panel / .fl-resizable__handle / .fl-resizable__grip
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
        "fl-resizable",
        direction === "horizontal"
          ? "fl-resizable--horizontal"
          : "fl-resizable--vertical",
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
      class: classNames(["fl-resizable__panel", cls]),
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
        "fl-resizable__handle",
        computed(is_horizontal_, (h) =>
          h ? "fl-resizable__handle--horizontal" : "fl-resizable__handle--vertical",
        ),
        cls,
      ]),
    },
    children ||
      (withHandle ? [View({ class: "fl-resizable__grip" }, [])] : []),
  );
}
