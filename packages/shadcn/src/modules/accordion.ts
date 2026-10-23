import { ui, vm } from "@timeless/timeless";
import { computed, Icon, refobj, Show } from "@timeless/timeless";
import { For, ViewChildren, ViewProps } from "@timeless/timeless";

type AccordionItem = {
  title: ViewChildren;
  content: ViewChildren;
};
let accordionId = 0;

export function Accordion(
  props: ViewProps & {
    store: vm.AccordionCore;
    items: AccordionItem[];
  },
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);
  const name = rest.attributes?.n ?? `accordion-${++accordionId}`;

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
                  attributes: {
                    n: `${name}-trigger-${i}`,
                    "aria-controls": `${name}-content-${i}`,
                  },
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
                      class: "flex size-4 shrink-0 items-center justify-center",
                      attributes: {
                        n: `${name}-chevron-${i}`,
                        "aria-hidden": "true",
                      },
                    },
                    [
                      Icon({
                        name: computed(state_, (d) =>
                          d.openItems.includes(i) ? "chevron-up" : "chevron-down",
                        ),
                        size: 16,
                        attributes: {
                          n: `${name}-chevron-icon-${i}`,
                          "aria-hidden": "true",
                        },
                      }),
                    ],
                  ),
                ],
              ),
              ui.AccordionPrimitive.Content(
                {
                  store,
                  index: i,
                  id: `${name}-content-${i}`,
                  attributes: { n: `${name}-content-${i}` },
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
