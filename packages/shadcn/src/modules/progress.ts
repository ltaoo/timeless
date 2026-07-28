import { Ref } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { ProgressPrimitive } from "@timeless/ui-primitive";
import { ProgressCore } from "@timeless/inner-vm";

export function Progress(
  props: ViewProps & {
    store?: ProgressCore;
    value?: Ref<number> | number;
    max?: number;
  },
) {
  const { store, value, max, ...rest } = props;

  return ProgressPrimitive.Root(
    {
      store,
      value,
      max,
      class:
        "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
      ...rest,
    },
    [
      ProgressPrimitive.Indicator({
        store,
        // @ts-ignore
        value,
        max,
        class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50",
      }),
    ],
  );
}
