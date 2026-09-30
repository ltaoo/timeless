import { ui, vm } from "@timeless/timeless";
import {
  For,
  Label as NativeLabel,
  ListenerManager,
  View,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

import { Checkbox } from "./checkbox";

export function CheckboxGroup(props: {
  store: vm.CheckboxGroupCore<any>;
  class?: string;
  itemClass?: string;
  direction?: "horizontal" | "vertical";
}) {
  const { store, direction = "vertical" } = props;
  const state = refobj(store.state);
  const listener$ = ListenerManager([state]);

  return ui.CheckboxPrimitive.Group(
    {
      store,
      class: classNames([
        "m3-checkbox-group",
        direction === "horizontal" ? "m3-checkbox-group--horizontal" : "",
        props.class,
      ]),
      onMounted() {
        listener$.add(store.onStateChange((v) => state.as(v)));
        return listener$.destroy;
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
      class: classNames([
        "m3-checkbox-field",
        "m3-checkbox-group__item",
        props.class,
      ]),
    },
    [
      Checkbox({ store: item.core, id: item.value }),
      NativeLabel({ for: item.value, class: "m3-checkbox-label" }, [item.label]),
    ],
  );
}
