import { ref, refarr, computed } from "@timeless/reactive";

import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Txt } from "./text.js";

export function Accordion(props: any) {
  const { items, type = "single", theme: t, class: cn, style: st } = props;
  const openItems = refarr(type === "single" ? [0] : []);

  return View({ ...merge(tp(t?.root), cn, st) }, [
    ...items.map((item: any, index: number) => {
      const isOpen = computed({ openItems }, (d: any) =>
        d.openItems.includes(index),
      );
      const toggle = () => {
        if (type === "single") {
          openItems.as(openItems.includes(index) ? [] : [index]);
        } else {
          const nextopenItems = openItems.includes(index)
            ? openItems.filter((i: number) => i !== index)
            : [...openItems.value, index];
          openItems.as(nextopenItems);
        }
      };

      return View({ ...merge(tp(t?.item)) }, [
        View(
          {
            ...merge(tp(t?.trigger)),
            onClick: toggle,
          },
          [
            Txt(item.title),
            View(
              {
                class: computed(
                  { isOpen },
                  (d: any) =>
                    merge(tp(t?.chevron, { isOpen: d.isOpen })).class || "",
                ),
                style: computed(
                  { isOpen },
                  (d: any) =>
                    merge(tp(t?.chevron, { isOpen: d.isOpen })).style || "",
                ),
              },
              [Txt("\u25BE")],
            ),
          ],
        ),
        View(
          {
            class: computed(
              { isOpen },
              (d: any) =>
                merge(tp(t?.content, { isOpen: d.isOpen })).class || "",
            ),
            style: computed(
              { isOpen },
              (d: any) =>
                merge(tp(t?.content, { isOpen: d.isOpen })).style || "",
            ),
          },
          [typeof item.content === "string" ? Txt(item.content) : item.content],
        ),
      ]);
    }),
  ]);
}
