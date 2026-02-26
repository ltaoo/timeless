import { ref, computed } from "@timeless/reactive";
import { Show } from "./show.js";
import { View } from "./view.js";

export function Presence(props: any, children?: any) {
  const { store, animation, ...rest } = props;
  const state = ref(store.state);
  const visible = computed({ state }, (draft: any) => {
    const s = draft.state;
    return s.mounted && (s.visible || s.enter || s.exit);
  });

  const unsubscribe = store.onStateChange(() => {
    state.value = store.state;
  });

  return Show({
    ...rest,
    onUnmounted() {
      if (unsubscribe) {
        unsubscribe();
      }
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
    when: visible,
    dataset: {
      // "state": ,
    },
    class: computed({ state }, (draft: any) => {
      return [
        "presence",
        rest.class,
        draft.state.enter ? (animation?.in ?? "fade-in") : "",
        draft.state.exit ? (animation?.out ?? "fade-out") : "",
      ]
        .filter(Boolean)
        .join(" ");
    }),
  }, children);
}
