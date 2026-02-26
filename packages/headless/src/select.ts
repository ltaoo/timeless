import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Txt } from "./text.js";
import { For } from "./for.js";
import { Show } from "./show.js";
import { Portal } from "./portal.js";
import { ref, computed } from "@timeless/reactive";

export function Select(props: any) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const open = ref(false);
  const pos = ref({ x: 0, y: 0, width: 0 });
  const events: any[] = [];
  const unsub = store.onStateChange(() => { state.value = store.state; });
  if (unsub) events.push(unsub);
  const options = computed({ state }, (d: any) => d.state.options);

  let handleClickOutside: any = null;

  return View({
    ...rest,
    ...merge(tp(t?.root), cn, st),
    onMounted($e: HTMLElement) {
      handleClickOutside = (event: Event) => {
        if ($e.contains(event.target as Node)) return;
        if ((event.target as Element).closest && (event.target as Element).closest(".portal")) return;
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
      onClick(event: Event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        pos.value = { x: rect.left, y: rect.bottom + 4, width: rect.width };
        open.value = !open.value;
      },
    }, [
      View({
        type: "span",
        class: computed({ state }, (d: any) => merge(tp(t?.valueText, { hasValue: d.state.value != null })).class || ""),
        style: computed({ state }, (d: any) => merge(tp(t?.valueText, { hasValue: d.state.value != null })).style || ""),
      }, [
        Txt(computed({ state }, (d: any) => {
          const opt = (d.state.options || []).find((o: any) => o.value === d.state.value);
          return opt ? opt.label : (d.state.placeholder || "Select...");
        })),
      ]),
      View({ ...merge(tp(t?.arrow)) }, [Txt("\u25BE")]),
    ]),
    Portal({}, [
      Show({ when: open }, [
        View({
          ...merge(tp(t?.dropdown)),
          style: computed({ pos }, (d: any) =>
            `${merge(tp(t?.dropdown)).style || ""}position:fixed;z-index:999;left:${d.pos.x}px;top:${d.pos.y}px;min-width:${d.pos.width}px;`
          ),
        }, [
          For({
            ...merge(tp(t?.list)),
            each: options,
            render(opt: any) {
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
