import { ui, vm } from "@timeless/timeless";
import { classNames, computed, ref } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ResizablePanels · Material 3
 *
 * 类名（`m3-resizable` 命名空间）：.m3-resizable / .m3-resizable__panel /
 * .m3-resizable__handle / .m3-resizable__grip。
 * 视觉：分割线用 --outline-variant，hover / dragging 用 --primary，
 * 焦点环沿用 M3 的 --ring-color。
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
        "m3-resizable",
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
      class: classNames(["m3-resizable__panel", cls]),
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
        "m3-resizable__handle",
        computed(is_horizontal_, (h) =>
          h ? "is-horizontal" : "is-vertical",
        ),
        cls,
      ]),
    },
    children ||
      (withHandle
        ? [View({ class: "m3-resizable__grip" }, [])]
        : []),
  );
}
