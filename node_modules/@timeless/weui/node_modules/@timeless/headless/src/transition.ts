import { ref, refobj, computed } from "@timeless/reactive";
import { PresenceCore } from "@timeless/ui";

import { Show } from "./show";
import { View, ViewChildren, ViewProps } from "./view";

export function Transition(
  props: ViewProps & {
    store: PresenceCore;
    animation?: { in: string; out: string };
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
      when: visible,

      onUnmounted() {
        if (unsubscribe) {
          unsubscribe();
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      View(
        {
          ...rest,
          class: computed(state, (s) => {
            return [
              rest.class,
              s.enter ? (animation?.in ?? "fade-in") : "",
              s.exit ? (animation?.out ?? "fade-out") : "",
            ]
              .filter(Boolean)
              .join(" ");
          }),
        },
        children,
      ),
    ],
  );
}
