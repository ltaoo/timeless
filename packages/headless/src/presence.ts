import { ref, refobj, computed } from "@timeless/reactive";
import { ui } from "@timeless/domains";

import { Show } from "./show.js";
import { ViewChildren, ViewProps } from "./view.js";

export function Presence(
  props: ViewProps & {
    store: ui.PresenceCore;
    animation?: { in: boolean; out: boolean };
  },
  children?: ViewChildren,
) {
  const { store, animation, ...rest } = props;
  const state = refobj(store.state);
  const visible = computed(state, (s) => {
    return s.mounted && (s.visible || s.enter || s.exit);
  });

  const unsubscribe = store.onStateChange(() => {
    state.as(store.state);
  });

  return Show(
    {
      ...rest,
      when: visible,
      dataset: {
        // "state": ,
      },
      class: computed(state, (s) => {
        return [
          "presence",
          rest.class,
          s.enter ? (animation?.in ?? "fade-in") : "",
          s.exit ? (animation?.out ?? "fade-out") : "",
        ]
          .filter(Boolean)
          .join(" ");
      }),
      onUnmounted() {
        if (unsubscribe) {
          unsubscribe();
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
