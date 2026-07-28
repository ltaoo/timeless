import { refobj, computed } from "@timeless/timeless";
import { Show, View, ViewProps, ViewChildren } from "@timeless/timeless";
import { PresenceCore } from "@timeless/inner-vm";

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
  let unsubscribe: (() => void) | null = null;

  const visible = computed(state, (s) => {
    return s.mounted && (s.visible || s.enter || s.exit);
  });

  // Setup subscription (called on initial render and re-mount)
  const setupSubscription = () => {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = store.onStateChange(() => {
      state.as(store.state);
    });
  };

  // Initial subscription
  setupSubscription();

  return Show({
    when: visible,
    ok() {
      return [
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
      ];
    },
    onMounted() {
      setupSubscription();
    },
    onUnmounted() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  });
}
