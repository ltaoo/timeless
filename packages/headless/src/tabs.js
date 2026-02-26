import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { For } from "./for.js";
import { Show } from "./show.js";
import { ref, computed } from "./core.js";
import { Txt } from "./text.js";

export function Tabs(props) {
  const { store, value, items, theme: t, class: cn, style: st } = props;

  const activeRef = store ? ref(store.state) : value;
  const events = [];
  if (store) events.push(store.onStateChange(() => { activeRef.value = store.state; }));

  const getActive = (d) => store ? d.state.curValue : d.active;
  const deps = store ? { state: activeRef } : { active: activeRef };

  return View({
    ...merge(tp(t?.root), cn, st),
    onUnmounted() { for (const fn of events) if (typeof fn === "function") fn(); },
  }, [
    View({ ...merge(tp(t?.list)) }, [
      For({
        each: items,
        render(item) {
          return View({
            type: "button",
            class: computed(deps, (d) => merge(tp(t?.tab, { active: getActive(d) === item.value })).class || ""),
            style: computed(deps, (d) => merge(tp(t?.tab, { active: getActive(d) === item.value })).style || ""),
            onClick() { store ? store.selectTab(item.value) : (activeRef.value = item.value); },
          }, [
            Txt(item.label),
            View({
              class: computed(deps, (d) => merge(tp(t?.indicator, { active: getActive(d) === item.value })).class || ""),
              style: computed(deps, (d) => merge(tp(t?.indicator, { active: getActive(d) === item.value })).style || ""),
            }),
          ]);
        },
      }),
    ]),
    View({ ...merge(tp(t?.content)) }, [
      For({
        each: items,
        render(item) {
          return Show({
            when: computed(deps, (d) => getActive(d) === item.value),
          }, [item.content]);
        },
      }),
    ]),
  ]);
}
