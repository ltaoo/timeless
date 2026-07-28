import { computed, refobj } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { TogglePrimitive } from "@timeless/ui-primitive";
import { SwitchCore } from "@timeless/inner-vm";

export function Toggle(props: ViewProps & { store: SwitchCore; id?: string }) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return TogglePrimitive.Root(
    {
      store,
      id,
      class: computed(state_, (d) => {
        const baseClass =
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50";
        const onClass = d.checked
          ? "bg-zinc-900 dark:bg-zinc-50"
          : "bg-zinc-200 dark:bg-zinc-800";
        const disabledClass = d.disabled ? "opacity-50 cursor-not-allowed" : "";
        return [baseClass, onClass, disabledClass].filter(Boolean).join(" ");
      }),
      ...rest,
    },
    [
      TogglePrimitive.Thumb({
        store,
        class: computed(state_, (d) => {
          const baseClass =
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform dark:bg-zinc-950";
          const translateClass = d.checked ? "translate-x-5" : "translate-x-0";
          return [baseClass, translateClass].join(" ");
        }),
      }),
    ],
  );
}
