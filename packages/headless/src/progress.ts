import { ref, computed, isRef, Ref } from "@timeless/reactive";
import { ProgressCore } from "@timeless/ui";

import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";

export function Progress(
  props: ViewProps & {
    store: ProgressCore;
    theme?: any;
    value: Ref<number>;
    max?: number;
  },
) {
  const { store, value, max = 100, theme: t, class: cls, style: st } = props;

  if (store) {
    const state = ref(store.state);
    const events: any[] = [];
    if (store.onStateChange)
      events.push(
        store.onStateChange(() => {
          state.as(store.state);
        }),
      );

    return View(
      {
        ...merge(tp(t?.root), cls, st),
        onUnmounted() {
          for (const fn of events) if (typeof fn === "function") fn();
          if (props.onUnmounted) props.onUnmounted();
        },
      },
      [
        View({
          ...merge(tp(t?.fill)),
          style: computed(state, (d) => {
            const v = d.value ?? 0;
            const m = d.max ?? 100;
            return `${merge(tp(t?.fill)).style || ""}width:${Math.min(Math.max((v / m) * 100, 0), 100)}%`;
          }),
        }),
      ],
    );
  }

  return View({ ...merge(tp(t?.root), cls, st) }, [
    View({
      ...merge(tp(t?.fill)),
      style: computed(value, (d) => {
        const v = isRef(value) ? d : value;
        return `${merge(tp(t?.fill)).style || ""}width:${Math.min(Math.max((v / max) * 100, 0), 100)}%`;
      }),
    }),
  ]);
}
