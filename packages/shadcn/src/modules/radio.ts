import { ref, computed, cn } from "@timeless/reactive";
import { RadioPrimitive, View, For, ViewProps } from "@timeless/headless";
import { RadioGroupCore, RadioCore } from "@timeless/ui";

export function Radio(props: { store: RadioCore; id?: string }) {
  const { store, id } = props;
  const state = ref(store.state);
  const unsub = store.onStateChange(() => {
    state.as(store.state);
  });

  return RadioPrimitive.Root({ store }, [
    RadioPrimitive.Input({ store, id }),
    RadioPrimitive.Box(
      {
        store,
        class: cn([
          "peer relative flex items-center justify-center aspect-square size-4 shrink-0 rounded-full border outline-none cursor-pointer after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
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
        RadioPrimitive.Indicator({ store }, [
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
    store: RadioGroupCore<any>;
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

  return RadioPrimitive.Group(
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
        render(item: { label: string; value: any; core: RadioCore }) {
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
  store: RadioGroupCore<any>;
  item: { label: string; value: any; core: RadioCore };
  class?: string;
}) {
  const { item } = props;

  return View(
    {
      class: cn(["flex items-center gap-3", props.class]),
      onClick() {
        item.core.check();
      },
    },
    [
      Radio({ id: item.value, store: item.core }),
      View(
        {
          attributes: {
            for: item.value,
          },
          as: "label",
          class:
            "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        },
        [item.label],
      ),
    ],
  );
}
