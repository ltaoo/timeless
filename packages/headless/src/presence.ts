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
  // const visible = computed(state, (t) => {
  //   return t.mounted && (t.visible || t.enter || t.exit);
  // });

  const unsubscribe = store.onStateChange((v) => {
    console.log("[]presence on stateChange callback", v.visible);
    state.as(v);
  });

  return Show(
    {
      when: computed(state, (t) => {
        return t.mounted || t.visible;
      }),
      onUnmounted() {
        // if (unsubscribe) {
        //   unsubscribe();
        // }
      },
    },
    [
      View(
        {
          ...rest,
          class: classNames([
            props.class,
            computed(state, (t) => {
              return [
                "presence",
                t.enter ? (animation?.in ?? "fade-in") : "",
                t.exit ? (animation?.out ?? "fade-out") : "",
              ]
                .filter(Boolean)
                .join(" ");
            }),
          ]),
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
