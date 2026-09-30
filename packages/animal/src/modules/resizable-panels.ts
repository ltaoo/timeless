import { ui, vm } from "@timeless/timeless";
import { classNames, computed, ref } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ResizablePanels · Animal Island
 *
 * Animal Island 的 2px 描边 + 大圆角 + 柔和阴影：
 *   .animal-resizable / .animal-resizable__panel / .animal-resizable__handle / .animal-resizable__grip
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
        "animal-resizable",
        direction === "horizontal"
          ? "animal-resizable--horizontal"
          : "animal-resizable--vertical",
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
      class: classNames(["animal-resizable__panel", cls]),
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
        "animal-resizable__handle",
        computed(is_horizontal_, (h) =>
          h ? "animal-resizable__handle--horizontal" : "animal-resizable__handle--vertical",
        ),
        cls,
      ]),
    },
    children ||
      (withHandle ? [View({ class: "animal-resizable__grip" }, [])] : []),
  );
}
