import { ref, computed } from "@timeless/reactive";

import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";

export function Checkbox(props: ViewProps & { store?: any; theme?: any }) {
  const { store, theme: t, class: cls, style: st, ...rest } = props;
  const state = ref(store.state);
  const events: any[] = [];
  const unsub = store.onStateChange
    ? store.onStateChange(() => {
        state.as(store.state);
      })
    : null;
  if (unsub) events.push(unsub);
  if (store.onChange)
    events.push(
      store.onChange(() => {
        state.as(store.state);
      }),
    );

  const m = (d?: any) => merge(tp(t?.root), cls, st);

  return View(
    {
      ...rest,
      ...m(),
      onClick() {
        store.toggle();
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    [
      View(
        {
          class: computed(state, (d) => {
            return (
              merge(
                tp(t?.box, {
                  checked: d.checked,
                  disabled: d.disabled,
                }),
              ).class || ""
            );
          }),
          style: computed(state, (d) => {
            return (
              merge(
                tp(t?.box, {
                  checked: d.checked,
                  disabled: d.disabled,
                }),
              ).style || ""
            );
          }),
        },
        [
          View(
            {
              type: "span",
              class: computed(state, (d) => {
                return merge(tp(t?.check, { checked: d.checked })).class || "";
              }),
              style: computed(state, (d) => {
                return merge(tp(t?.check, { checked: d.checked })).style || "";
              }),
            },
            [
              {
                t: "text",
                $elm: document.createTextNode("\u2713"),
                render() {
                  return this.$elm;
                },
                onMounted() {},
                beforeUnmounted() {},
                onUnmounted() {},
              },
            ],
          ),
        ],
      ),
    ],
  );
}
