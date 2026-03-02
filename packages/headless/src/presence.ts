import { ref, refobj, computed } from "@timeless/reactive";
import { PresenceCore } from "@timeless/ui";

import { Show } from "./show";
import { View, ViewChildren, ViewProps } from "./view";

export function Presence(
  props: ViewProps & {
    store: PresenceCore;
    animation?: { in: boolean; out: boolean };
  },
  children?: ViewChildren,
) {
  const { store, animation, ...rest } = props;
  const state = refobj(store.state);
  const visible = computed(state, (s) => {
    console.log(
      "[]presence state changed",
      s.mounted,
      s.visible,
      s.enter,
      s.exit,
    );
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
      },
    },
    [
      View(
        {
          ...rest,
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
            if (rest.onUnmounted) {
              rest.onUnmounted();
            }
          },
        },
        children,
      ),
    ],
  );
}
