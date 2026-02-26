import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Txt } from "./text.js";
import { For } from "./for.js";
import { Show } from "./show.js";
import { Portal } from "./portal.js";
import { ref, computed } from "./core.js";

export function Select(props) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const open = ref(false);
  const pos = ref({ x: 0, y: 0, width: 0 });
  const events = [];
  const unsub = store.onStateChange(() => { state.value = store.state; });
  if (unsub) events.push(unsub);
  const options = computed({ state }, (d) => d.state.options);

  let handleClickOutside = null;

  return View({
    ...rest,
    ...merge(tp(t?.root), cn, st),
    onMounted($e) {
      handleClickOutside = (event) => {
        if ($e.contains(event.target)) return;
        if (event.target.closest && event.target.closest(".portal")) return;
        open.value = false;
      };
      document.addEventListener("click", handleClickOutside);
    },
    onUnmounted() {
      if (handleClickOutside) document.removeEventListener("click", handleClickOutside);
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    View({
      ...merge(tp(t?.trigger)),
      onClick(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        pos.value = { x: rect.left, y: rect.bottom + 4, width: rect.width };
        open.value = !open.value;
      },
    }, [
      View({
        type: "span",
        class: computed({ state }, (d) => merge(tp(t?.valueText, { hasValue: d.state.value != null })).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.valueText, { hasValue: d.state.value != null })).style || ""),
      }, [
        Txt(computed({ state }, (d) => {
          const opt = (d.state.options || []).find((o) => o.value === d.state.value);
          return opt ? opt.label : (d.state.placeholder || "Select...");
        })),
      ]),
      View({ ...merge(tp(t?.arrow)) }, [Txt("\u25BE")]),
    ]),
    Portal({}, [
      Show({ when: open }, [
        View({
          ...merge(tp(t?.dropdown)),
          style: computed({ pos }, (d) =>
            `${merge(tp(t?.dropdown)).style || ""}position:fixed;z-index:999;left:${d.pos.x}px;top:${d.pos.y}px;min-width:${d.pos.width}px;`
          ),
        }, [
          For({
            ...merge(tp(t?.list)),
            each: options,
            render(opt) {
              return View({
                class: computed({ state }, () => merge(tp(t?.option, { selected: opt.selected })).class || ""),
                style: computed({ state }, () => merge(tp(t?.option, { selected: opt.selected })).style || ""),
                onClick() { store.select(opt.value); open.value = false; },
              }, [Txt(opt.label)]);
            },
          }),
        ]),
      ]),
    ]),
  ]);
}
