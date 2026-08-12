import { ui, vm } from "@timeless/timeless";
import { Ref } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";

export function Progress(
  props: ViewProps & {
    store?: vm.ProgressCore;
    value?: Ref<number> | number;
    max?: number;
  },
) {
  const { store, value, max, ...rest } = props;

  return ui.ProgressPrimitive.Root(
    {
      store,
      value,
      max,
      class:
        "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
      ...rest,
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        // @ts-ignore
        value,
        max,
        class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50",
      }),
    ],
  );
}
