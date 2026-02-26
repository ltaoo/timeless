import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Txt } from "./text.js";
import { ref, computed } from "@timeless/reactive";

export function Accordion(props: any) {
  const { items, type = "single", theme: t, class: cn, style: st } = props;
  const openItems = ref(type === "single" ? [0] : []);

  return View({ ...merge(tp(t?.root), cn, st) }, [
    ...items.map((item: any, index: number) => {
      const isOpen = computed({ openItems }, (d: any) => d.openItems.includes(index));
      const toggle = () => {
        if (type === "single") {
          openItems.value = openItems.value.includes(index) ? [] : [index];
        } else {
          openItems.value = openItems.value.includes(index)
            ? openItems.value.filter((i: number) => i !== index)
            : [...openItems.value, index];
        }
      };

      return View({ ...merge(tp(t?.item)) }, [
        View({
          ...merge(tp(t?.trigger)),
          onClick: toggle,
        }, [
          Txt(item.title),
          View({
            class: computed({ isOpen }, (d: any) => merge(tp(t?.chevron, { isOpen: d.isOpen })).class || ""),
            style: computed({ isOpen }, (d: any) => merge(tp(t?.chevron, { isOpen: d.isOpen })).style || ""),
          }, [Txt("\u25BE")]),
        ]),
        View({
          class: computed({ isOpen }, (d: any) => merge(tp(t?.content, { isOpen: d.isOpen })).class || ""),
          style: computed({ isOpen }, (d: any) => merge(tp(t?.content, { isOpen: d.isOpen })).style || ""),
        }, [typeof item.content === "string" ? Txt(item.content) : item.content]),
      ]);
    }),
  ]);
}
