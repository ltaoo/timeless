import { ref, computed } from "./core.js";
import { Show } from "./show.js";
import { View } from "./view.js";

export function Presence(props, children) {
  const { store, animation, ...rest } = props;
  const state = ref(store.state);
  const visible = computed({ state }, (draft) => {
    // console.log(
    //   "[baseui]Presence - before ",
    //   draft.state.mounted,
    //   draft.state.visible,
    // );
    return draft.state.mounted && draft.state.visible;
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
    class: computed({ state }, (draft) => {
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
