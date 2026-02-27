import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { ref, computed, isRef } from "@timeless/reactive";

export function Progress(props: any) {
  const { store, value, max = 100, theme: t, class: cn, style: st } = props;

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
        ...merge(tp(t?.root), cn, st),
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

  return View({ ...merge(tp(t?.root), cn, st) }, [
    View({
      ...merge(tp(t?.fill)),
      style: computed(value, (d) => {
        const v = isRef(value) ? d : value;
        return `${merge(tp(t?.fill)).style || ""}width:${Math.min(Math.max((v / max) * 100, 0), 100)}%`;
      }),
    }),
  ]);
}
