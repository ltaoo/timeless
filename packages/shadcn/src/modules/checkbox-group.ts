import { ui, vm } from "@timeless/timeless";
import { ref, computed } from "@timeless/timeless";
import { View, For, Label as NativeLabel } from "@timeless/timeless";

import { Checkbox } from "./checkbox";

export function CheckboxGroup(props: {
  store: vm.CheckboxGroupCore<any>;
  class?: string;
  itemClass?: string;
  direction?: "horizontal" | "vertical";
}) {
  const { store, direction = "vertical" } = props;
  const state = ref(store.state);
  const events: (() => void)[] = [];

  const container_classname =
    direction === "horizontal"
      ? "flex flex-row flex-wrap gap-4"
      : "flex flex-col gap-2";

  return ui.CheckboxPrimitive.Group(
    {
      store,
      class: props.class || container_classname,
      onMounted() {
        events.push(
          store.onStateChange((v) => {
            state.as(v);
          }),
        );
      },
      onUnmounted() {
        for (const fn of events) fn();
      },
    },
    [
      For({
        each: computed(state, (s) => s.options),
        render(item: { label: string; value: any; core: vm.CheckboxCore }) {
          return CheckboxGroupItem({
            store,
            item,
            class: props.itemClass,
          });
        },
      }),
    ],
  );
}

export function CheckboxGroupItem(props: {
  store: vm.CheckboxGroupCore<any>;
  item: { label: string; value: any; core: vm.CheckboxCore };
  class?: string;
}) {
  const { item } = props;

  return View(
    {
      class:
        props.class ||
        "flex items-center gap-2 cursor-pointer select-none group/field",
    },
    [
      Checkbox({ store: item.core, id: item.value }),
      NativeLabel(
        {
          for: item.value,
          class:
            "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        },
        [item.label],
      ),
    ],
  );
}
