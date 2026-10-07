import { ui, vm } from "@timeless/timeless";
import { classNames, computed, ref } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ResizablePanels · Lucky
 *
 * Lucky 的 1px stroke + 4px 圆角 + 分级阴影：
 *   .lucky-resizable / .lucky-resizable__panel / .lucky-resizable__handle / .lucky-resizable__grip
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
        "lucky-resizable",
        direction === "horizontal"
          ? "lucky-resizable--horizontal"
          : "lucky-resizable--vertical",
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
      class: classNames(["lucky-resizable__panel", cls]),
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
        "lucky-resizable__handle",
        computed(is_horizontal_, (h) =>
          h ? "lucky-resizable__handle--horizontal" : "lucky-resizable__handle--vertical",
        ),
        cls,
      ]),
    },
    children ||
      (withHandle ? [View({ class: "lucky-resizable__grip" }, [])] : []),
  );
}
