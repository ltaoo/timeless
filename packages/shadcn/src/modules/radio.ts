import { ui, vm } from "@timeless/timeless";
import { ref, computed, classNames } from "@timeless/timeless";
import { View, For, ViewProps, Label as NativeLabel } from "@timeless/timeless";

export function Radio(props: { store: vm.RadioCore; id?: string }) {
  const { store, id } = props;
  const state = ref(store.state);
  const unsub = store.onStateChange(() => {
    state.as(store.state);
  });

  return ui.RadioPrimitive.Root({ store }, [
    ui.RadioPrimitive.Input({ store, id }),
    ui.RadioPrimitive.Box(
      {
        store,
        class: classNames([
          "peer relative flex items-center justify-center aspect-square size-4 shrink-0 rounded-full border outline-none cursor-default after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          computed(state, (s) =>
            s.checked
              ? "border-primary bg-primary text-primary-foreground dark:bg-primary"
              : "border-input dark:bg-input/30",
          ),
          computed(state, (s) =>
            s.disabled ? "opacity-50 cursor-not-allowed" : "",
          ),
        ]),
        onUnmounted() {
          unsub();
        },
      },
      [
        ui.RadioPrimitive.Indicator({ store }, [
          View(
            {
              class: "size-2 rounded-full bg-primary-foreground",
            },
            [],
          ),
        ]),
      ],
    ),
  ]);
}

export function RadioGroup(
  props: ViewProps & {
    store: vm.RadioGroupCore<any>;
    class?: string;
    itemClass?: string;
    direction?: "horizontal" | "vertical";
  },
) {
  const { store, direction = "vertical" } = props;
  const state = ref(store.state);
  const events: (() => void)[] = [];

  const container_class =
    direction === "horizontal"
      ? "flex flex-row flex-wrap gap-4"
      : "flex flex-col gap-2";

  return ui.RadioPrimitive.Group(
    {
      store,
      class: props.class || container_class,
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
        render(item: { label: string; value: any; core: vm.RadioCore }) {
          return RadioGroupItem({
            store,
            item,
            class: props.itemClass,
          });
        },
      }),
    ],
  );
}

export function RadioGroupItem(props: {
  store: vm.RadioGroupCore<any>;
  item: { label: string; value: any; core: vm.RadioCore };
  class?: string;
}) {
  const { item } = props;

  return View(
    {
      class: classNames(["flex items-center gap-3", props.class]),
      onClick() {
        item.core.check();
      },
    },
    [
      Radio({ id: item.value, store: item.core }),
      NativeLabel(
        {
          for: item.value,
          class:
            "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        },
        [item.label],
      ),
    ],
  );
}
