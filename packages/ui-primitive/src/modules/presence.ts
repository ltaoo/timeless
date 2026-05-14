import { ref, refobj, computed } from "@timeless/timeless";
import { View, ViewProps, ViewChildren, Show } from "@timeless/timeless";
import { PresenceCore } from "@timeless/ui-vm";

export function Presence(
  props: ViewProps & {
    store: PresenceCore;
    animation?: { in: string; out: string };
  },
  children?: ViewChildren | (() => ViewChildren),
) {
  const { store, animation, ...rest } = props;
  const state = refobj(store.state);

  const unsubscribe = store.onStateChange((v) => {
    console.log("[]presence on stateChange callback", v.visible);
    state.as(v);
  });

  return Show({
    when: computed(state, (t) => {
      // Keep mounted during enter, visible, or exit animation
      return t.mounted || t.visible || t.exit;
    }),
    ok() {
      if (typeof children === "function") {
        return children();
      }
      return children || [];
    },
    onUnmounted() {
      // if (unsubscribe) {
      //   unsubscribe();
      // }
    },
  });
}
