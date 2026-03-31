import { refobj, computed } from "@timeless/reactive";
import { PresenceCore } from "@timeless/ui";

import { Show } from "@/primitive/show";
import { View, ViewChildren, ViewProps } from "@/primitive/view";

export function Transition(
  props: ViewProps & {
    store: PresenceCore;
    animation?: { in: string; out: string };
  },
  children?: ViewChildren,
) {
  const { store, animation, ...rest } = props;
  const state = refobj(store.state);
  let _was_exiting = false;

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
            if (s.exit) {
              _was_exiting = true;
            }
            if (!s.mounted && _was_exiting) {
              _was_exiting = false;
              return animation?.out ?? "fade-out";
            }
            if (s.mounted) {
              _was_exiting = false;
            }
            return [
              rest.class,
              s.enter ? (animation?.in ?? "fade-in") : "",
              s.exit ? (animation?.out ?? "fade-out") : "",
            ]
              .filter(Boolean)
              .join(" ");
          }),
          onAnimationEnd(e: AnimationEvent) {
            if (e.target === e.currentTarget) {
              store.handleAnimationEnd();
            }
            if (rest.onAnimationEnd) {
              rest.onAnimationEnd(e);
            }
          },
        },
        children,
      ),
    ],
  );
}
