import { ref, refarr, computed } from "@timeless/reactive";

import { tp, merge } from "./theme";
import { View } from "./view";
import { Txt } from "./text";

export function Accordion(props: any) {
  const { items, type = "single", theme: t, class: cn, style: st } = props;
  const openItems = refarr(type === "single" ? [0] : []);

  return View({ ...merge(tp(t?.root), cn, st) }, [
    ...items.map((item: any, index: number) => {
      const isOpen = computed(openItems, (d) => d.includes(index));
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
                class: computed(isOpen, (d) => {
                  return merge(tp(t?.chevron, { isOpen: d })).class || "";
                }),
                style: computed(isOpen, (d) => {
                  return merge(tp(t?.chevron, { isOpen: d })).style || "";
                }),
              },
              [Txt("\u25BE")],
            ),
          ],
        ),
        View(
          {
            class: computed(isOpen, (d) => {
              return merge(tp(t?.content, { isOpen: d })).class || "";
            }),
            style: computed(isOpen, (d) => {
              return merge(tp(t?.content, { isOpen: d })).style || "";
            }),
          },
          [typeof item.content === "string" ? Txt(item.content) : item.content],
        ),
      ]);
    }),
  ]);
}
