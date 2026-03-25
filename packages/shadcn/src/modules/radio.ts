import { ref, computed } from "@timeless/reactive";
import { RadioPrimitive, View, For } from "@timeless/headless";
import { RadioGroupCore, RadioCore } from "@timeless/ui";

export function Radio(props: { store: RadioCore; id?: string }) {
  const { store, id } = props;

  return RadioPrimitive.Box(
    {
      store,
      id,
      class:
        "aspect-square h-4 w-4 rounded-full border border-zinc-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-950 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
    },
    [
      RadioPrimitive.Indicator({ store }, [
        View(
          {
            class: "h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-50",
          },
          [],
        ),
      ]),
    ],
  );
}

export function RadioGroup(props: {
  store: RadioGroupCore<any>;
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

  return RadioPrimitive.Group(
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
      class:
        props.class || "flex items-center gap-2 cursor-pointer select-none",
      onClick() {
        item.core.check();
      },
    },
    [
      Radio({ store: item.core }),
      View(
        {
          class: "text-sm font-medium leading-none",
        },
        [item.label],
      ),
    ],
  );
}
