import { ui, vm } from "@timeless/timeless";
import {
  ListenerManager,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

export function Checkbox(
  props: ViewProps & { store: vm.CheckboxCore; id?: string },
) {
  const { store, id, class: cls, onUnmounted, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  return ui.CheckboxPrimitive.Root({ store }, [
    ui.CheckboxPrimitive.Input({ store, id }),
    ui.CheckboxPrimitive.Box(
      {
        ...rest,
        store,
        class: classNames([
          "fl-checkbox",
          computed(state_, (s) => (s.checked ? "is-checked" : "")),
          computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
          computed(state_, (s) => (s.status === "error" ? "is-invalid" : "")),
          cls,
        ]),
        onUnmounted() {
          listener$.destroy();
          if (onUnmounted) {
            onUnmounted();
          }
        },
      },
      [],
    ),
  ]);
}
