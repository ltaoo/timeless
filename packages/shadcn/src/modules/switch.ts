import { ui, vm } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function Switch(
  props: ViewProps & { store: vm.SwitchCore; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;

  return ui.SwitchPrimitive.Root(
    {
      ...rest,
      store,
      id,
      class: classNames([
        "group peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-zinc-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-zinc-900 dark:bg-zinc-800 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950 dark:data-[checked]:bg-zinc-50",
        cls,
      ]),
    },
    [
      ui.SwitchPrimitive.Thumb({
        store,
        class:
          "pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform group-data-[checked]:translate-x-5 dark:bg-zinc-950",
      }),
    ],
  );
}
