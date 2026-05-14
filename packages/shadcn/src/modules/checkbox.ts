import { Icon, ListenerManager, View, ViewProps } from "@timeless/timeless";
import { ref, computed, classNames } from "@timeless/timeless";
import { CheckboxPrimitive } from "@timeless/ui-primitive";
import { CheckboxCore } from "@timeless/ui-vm";

export function Checkbox(
  props: ViewProps & { store: CheckboxCore; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = ref(store.state);
  const listener$ = ListenerManager([state_]);

  listener$.add(
    store.onStateChange(() => {
      state_.as(store.state);
    }),
  );

  return CheckboxPrimitive.Root(
    {
      store,
    },
    [
      CheckboxPrimitive.Input({ store, id }),
      CheckboxPrimitive.Box(
        {
          ...rest,
          store,
          class: classNames([
            "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none cursor-default focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            computed(state_, (s) => {
              return !!s.checked
                ? "border-primary bg-primary text-primary-foreground dark:bg-primary"
                : "border-input dark:bg-input/30";
            }),
            computed(state_, (s) => {
              return s.disabled ? "opacity-50 cursor-not-allowed" : "";
            }),
            rest.class,
          ]),
        },
        [
          View(
            {
              class: classNames([
                "grid place-content-center text-current transition-none [&>svg]:size-3.5",
                computed(state_, (s) => {
                  return !!s.checked ? "" : "invisible";
                }),
              ]),
            },
            [Icon({ name: "check", size: 16 })],
          ),
        ],
      ),
    ],
  );
}
