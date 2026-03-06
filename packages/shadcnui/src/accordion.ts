import { computed, refobj } from "@timeless/reactive";
import {
  AccordionPrimitive,
  For,
  View,
  ViewChildren,
  ViewProps,
  Txt,
} from "@timeless/headless";
import { AccordionCore } from "@timeless/ui";

type AccordionItem = {
  title: string;
  content: ViewChildren;
};

export function Accordion(
  props: ViewProps & {
    store: AccordionCore;
    items: AccordionItem[];
  },
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return AccordionPrimitive.Root(
    {
      store,
      class: "w-full",
      ...rest,
    },
    [
      For({
        each: items,
        render(item: AccordionItem, index: number) {
          return AccordionPrimitive.Item(
            {
              store,
              index,
              class: "border-b border-zinc-200 dark:border-zinc-800",
            },
            [
              AccordionPrimitive.Trigger(
                {
                  store,
                  index,
                  class:
                    "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline",
                },
                [
                  Txt(item.title),
                  AccordionPrimitive.Chevron(
                    {
                      store,
                      index,
                      class: computed(state_, (d) => {
                        const isOpen = d.openItems.includes(index);
                        return [
                          "text-sm transition-transform duration-200",
                          isOpen ? "rotate-180" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                      }),
                    },
                    [Txt("▾")],
                  ),
                ],
              ),
              AccordionPrimitive.Content(
                {
                  store,
                  index,
                  class: computed(state_, (d) => {
                    const isOpen = d.openItems.includes(index);
                    return isOpen
                      ? "overflow-hidden pb-4 pt-0 text-sm"
                      : "hidden";
                  }),
                },
                item.content,
              ),
            ],
          );
        },
      }),
    ],
  );
}
