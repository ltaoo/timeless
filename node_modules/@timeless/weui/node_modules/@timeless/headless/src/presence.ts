import { ref, refobj, computed, classNames } from "@timeless/reactive";
import { PresenceCore } from "@timeless/ui";

import { Show } from "./show";
import { View, ViewChildren, ViewProps } from "./view";

export function Presence(
  props: ViewProps & {
    store: PresenceCore;
    animation?: { in: string; out: string };
  },
  children?: ViewChildren,
) {
  const { store, animation, ...rest } = props;
  const state = refobj(store.state);

  const unsubscribe = store.onStateChange((v) => {
    console.log("[]presence on stateChange callback", v.visible);
    state.as(v);
  });

  return Show(
    {
      when: computed(state, (t) => {
        // Keep mounted during enter, visible, or exit animation
        return t.mounted || t.visible || t.exit;
      }),
      onUnmounted() {
        // if (unsubscribe) {
        //   unsubscribe();
        // }
      },
    },
    children,
  );
}
