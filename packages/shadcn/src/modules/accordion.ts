import { ui, vm } from "@timeless/timeless";
import { computed, refobj, Show } from "@timeless/timeless";
import { For, ViewChildren, ViewProps } from "@timeless/timeless";

type AccordionItem = {
  title: ViewChildren;
  content: ViewChildren;
};

export function Accordion(
  props: ViewProps & {
    store: vm.AccordionCore;
    items: AccordionItem[];
  },
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.AccordionPrimitive.Root(
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
          return ui.AccordionPrimitive.Item(
            {
              store,
              index: i,
              class: "border-b border-zinc-200 dark:border-zinc-800",
            },
            [
              ui.AccordionPrimitive.Trigger(
                {
                  store,
                  index: i,
                  class:
                    "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline",
                },
                [
                  Show({
                    when: typeof item.title === "string",
                    ok() {
                      return item.title;
                    },
                    else() {
                      return item.title || [];
                    },
                  }),
                  ui.AccordionPrimitive.Chevron(
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
                    ["▾"],
                  ),
                ],
              ),
              ui.AccordionPrimitive.Content(
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
