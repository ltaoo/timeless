import {
  CheckboxPrimitive,
  Icon,
  ListenerManager,
  ViewProps,
} from "@timeless/timeless";
import { ref, computed, classNames } from "@timeless/timeless";
import { CheckboxCore } from "@timeless/ui";

export function Checkbox(
  props: ViewProps & { store: CheckboxCore; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = ref(store.state);
  const listener$ = ListenerManager([state_]);

  return CheckboxPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.add(
          store.onStateChange(() => {
            state_.as(store.state);
          }),
        );
      },
    },
    [
      CheckboxPrimitive.Input({ store, id }),
      CheckboxPrimitive.Box(
        {
          ...rest,
          store,
          class: classNames([
            "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            computed(state_, (s) => {
              return s.checked
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
          CheckboxPrimitive.Indicator({ store }, [
            Icon({ name: "check", size: 16 }),
          ]),
        ],
      ),
    ],
  );
}
