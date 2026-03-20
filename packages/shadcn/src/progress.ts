import { Ref } from "@timeless/reactive";
import {
  ProgressPrimitive,
  ViewProps,
  ViewChildren,
} from "@timeless/headless";
import { ProgressCore } from "@timeless/ui";

export function Progress(
  props: ViewProps & {
    store?: ProgressCore;
    value?: Ref<number> | number;
    max?: number;
  },
  children?: ViewChildren,
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
        value,
        max,
        class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50",
      }),
    ],
  );
}
