import { ref, computed } from "@timeless/reactive";
import { CheckboxPrimitive, View, For, Txt } from "@timeless/headless";
import { CheckboxGroupCore, CheckboxCore } from "@timeless/ui";

import { Checkbox } from "./checkbox";

export function CheckboxGroup(props: {
  store: CheckboxGroupCore<any>;
  class?: string;
  itemClass?: string;
  direction?: "horizontal" | "vertical";
}) {
  const { store, direction = "vertical" } = props;
  const state = ref(store.state);
  const events: (() => void)[] = [];

  const containerClass =
    direction === "horizontal"
      ? "flex flex-row flex-wrap gap-4"
      : "flex flex-col gap-2";

  return CheckboxPrimitive.Group(
    {
      store,
      class: props.class || containerClass,
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
        render(item: { label: string; value: any; core: CheckboxCore }) {
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
  store: CheckboxGroupCore<any>;
  item: { label: string; value: any; core: CheckboxCore };
  class?: string;
}) {
  const { item } = props;

  return View(
    {
      class:
        props.class || "flex items-center gap-2 cursor-pointer select-none group/field",
    },
    [
      Checkbox({ store: item.core, id: item.value }),
      View(
        {
          as: "label",
          for: item.value,
          class:
            "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        },
        [Txt(item.label)],
      ),
    ],
  );
}
