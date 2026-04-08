import { CheckboxPrimitive, ViewProps } from "@timeless/timeless";
import { CheckOutlined } from "@timeless/icons";
import { ref, computed, classNames } from "@timeless/timeless";
import { CheckboxCore } from "@timeless/ui";

export function Checkbox(
  props: ViewProps & { store: CheckboxCore; id?: string },
) {
  const { store, id } = props;
  const state = ref(store.state);
  const unsub = store.onStateChange(() => {
    state.as(store.state);
  });

  return CheckboxPrimitive.Root({ store }, [
    CheckboxPrimitive.Input({ store, id }),
    CheckboxPrimitive.Box(
      {
        store,
        class: classNames([
          "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          computed(state, (s) =>
            s.checked
              ? "border-primary bg-primary text-primary-foreground dark:bg-primary"
              : "border-input dark:bg-input/30",
          ),
          computed(state, (s) =>
            s.disabled ? "opacity-50 cursor-not-allowed" : "",
          ),
          props.class,
        ]),
        style: props.style,
        onUnmounted() {
          unsub();
        },
      },
      [CheckboxPrimitive.Indicator({ store }, [CheckOutlined()])],
    ),
  ]);
}
