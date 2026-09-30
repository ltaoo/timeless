import { ui, vm } from "@timeless/timeless";
import {
  ListenerManager,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

export function Toggle(
  props: ViewProps & { store: vm.SwitchCore; id?: string },
) {
  const {
    store,
    id,
    class: cls,
    onMounted: onMountedProp,
    onUnmounted: onUnmountedProp,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  return ui.TogglePrimitive.Root(
    {
      ...rest,
      store,
      id,
      class: classNames([
        "animal-toggle",
        computed(state_, (s) => (s.checked ? "is-checked" : "")),
        computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
        cls,
      ]),
      dataset: {
        checked: computed(state_, (s) => (s.checked ? "" : undefined)),
        disabled: computed(state_, (s) => (s.disabled ? "" : undefined)),
      },
      onMounted(event: any) {
        listener$.add(store.onStateChange((v) => state_.as(v)));
        if (onMountedProp) {
          onMountedProp(event);
        }
      },
      onUnmounted() {
        listener$.destroy();
        if (onUnmountedProp) {
          onUnmountedProp();
        }
      },
    },
    [ui.TogglePrimitive.Thumb({ store, class: "animal-toggle__thumb" })],
  );
}
