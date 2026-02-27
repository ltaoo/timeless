import { tp, merge } from "./theme.js";
import { View, ViewProps } from "./view.js";
import { ref, computed } from "@timeless/reactive";

export function Checkbox(props: ViewProps & { store?: any; theme?: any }) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
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

  const m = (d?: any) => merge(tp(t?.root), cn, st);

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
          class: computed(
            { state },
            (d: any) =>
              merge(
                tp(t?.box, {
                  checked: d.state.checked,
                  disabled: d.state.disabled,
                }),
              ).class || "",
          ),
          style: computed(
            { state },
            (d: any) =>
              merge(
                tp(t?.box, {
                  checked: d.state.checked,
                  disabled: d.state.disabled,
                }),
              ).style || "",
          ),
        },
        [
          View(
            {
              type: "span",
              class: computed(
                { state },
                (d: any) =>
                  merge(tp(t?.check, { checked: d.state.checked })).class || "",
              ),
              style: computed(
                { state },
                (d: any) =>
                  merge(tp(t?.check, { checked: d.state.checked })).style || "",
              ),
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
