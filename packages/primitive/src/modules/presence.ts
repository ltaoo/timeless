import { ref, refobj, computed } from "@timeless/reactive";
import { PresenceCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Show } from "@/reactive/show";

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

  return Show({
    when: computed(state, (t) => {
      // Keep mounted during enter, visible, or exit animation
      return t.mounted || t.visible || t.exit;
    }),
    ok() {
      return children || [];
    },
    onUnmounted() {
      // if (unsubscribe) {
      //   unsubscribe();
      // }
    },
  });
}
