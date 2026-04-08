import { computed, refobj } from "@timeless/timeless";
import {
  AccordionPrimitive,
  For,
  ViewChildren,
  ViewProps,
  Txt,
} from "@timeless/timeless";
import { AccordionCore } from "@timeless/ui";

type AccordionItem = {
  title: string | ViewChildren;
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
        render(item: AccordionItem, index) {
          const i = index.value;
          return AccordionPrimitive.Item(
            {
              store,
              index: i,
              class: "border-b border-zinc-200 dark:border-zinc-800",
            },
            [
              AccordionPrimitive.Trigger(
                {
                  store,
                  index: i,
                  class:
                    "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline",
                },
                [
                  ...(typeof item.title === "string"
                    ? [Txt(item.title)]
                    : item.title),
                  AccordionPrimitive.Chevron(
                    {
                      store,
                      index: i,
                      class: computed(state_, (d) => {
                        const isOpen = d.openItems.includes(i);
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
                  index: i,
                  class: computed(state_, (d) => {
                    const isOpen = d.openItems.includes(i);
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
