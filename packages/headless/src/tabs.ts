import { ref, refarr, computed } from "@timeless/reactive";
import { TabHeaderCore } from "@timeless/ui";

import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";
import { For } from "./for";
import { Show } from "./show";
import { Txt } from "./text";

export function Tabs<T>(
  props: ViewProps & {
    store: TabHeaderCore<T>;
    theme?: { root: any; tab: any; list: any; indicator: any; content: any };
  },
) {
  const { store, theme: t, class: cls, style: st } = props;

  const state = ref(store.state);
  const items = refarr(store.state.tabs);
  const events: any[] = [];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
      items.as(store.state.tabs);
    }),
  );

  return View(
    {
      ...merge(tp(t?.root), cls, st),
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
      },
    },
    [
      View({}, [
        For({
          each: items,
          render(item: { value: string; label: string }, idx) {
            return View(
              {
                type: "button",
                class: computed(state, (d) => {
                  return (
                    merge(tp(t?.tab, { active: d.curId === item.value }))
                      .class || ""
                  );
                }),
                style: computed(state, (d) => {
                  return (
                    merge(tp(t?.tab, { active: d.curId === item.value }))
                      .style || ""
                  );
                }),
                onMounted($el) {
                  store.updateTabClient(idx, {
                    rect() {
                      return $el.getBoundingClientRect();
                    },
                  });
                },
                onClick() {
                  store.selectById(item.value);
                },
              },
              [
                Txt(item.label),
                View({
                  class: computed(state, (d) => {
                    return (
                      merge(
                        tp(t?.indicator, {
                          active: d.curId === item.value,
                        }),
                      ).class || ""
                    );
                  }),
                  style: computed(state, (d) => {
                    return (
                      merge(
                        tp(t?.indicator, {
                          active: d.curId === item.value,
                        }),
                      ).style || ""
                    );
                  }),
                }),
              ],
            );
          },
        }),
      ]),
      View({ ...merge(tp(t?.content)) }, [
        For({
          each: computed(state, (s) => s.tabs),
          render(item: any) {
            return Show(
              {
                when: computed(state, (d) => d.curId === item.value),
              },
              [item.content],
            );
          },
        }),
      ]),
    ],
  );
}
