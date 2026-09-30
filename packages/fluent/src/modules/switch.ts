import { ui, vm } from "@timeless/timeless";
import {
  ListenerManager,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

export function Switch(
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

  return ui.SwitchPrimitive.Root(
    {
      ...rest,
      store,
      id,
      class: classNames([
        "fl-switch",
        computed(state_, (s) => (s.checked ? "is-checked" : "")),
        computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
        cls,
      ]),
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
    [ui.SwitchPrimitive.Thumb({ store, class: "fl-switch__thumb" })],
  );
}
