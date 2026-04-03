import { computed, refobj } from "@timeless/primitive";
import {
  TabsPrimitive,
  For,
  Show,
  ViewChildren,
  ViewProps,
  Txt,
  h,
} from "@timeless/primitive";
import { TabHeaderCore } from "@timeless/ui";

type TabItem = {
  value: string;
  label: string;
  content?: ViewChildren;
};

export function Tabs(
  props: ViewProps & {
    store: TabHeaderCore<any>;
    items?: TabItem[];
  },
  children?: ViewChildren,
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return TabsPrimitive.Root(
    {
      store,
      class: "w-full",
      ...rest,
    },
    [
      TabsPrimitive.List(
        {
          store,
          class:
            "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        },
        [
          For({
            each: items || computed(state_, (d) => d.tabs),
            render(item: TabItem, index) {
              const i = index.value;
              return TabsPrimitive.Tab(
                {
                  store,
                  value: item.value,
                  index: i,
                  class: computed(state_, (d) => {
                    const isActive = d.curId === item.value;
                    const baseClass =
                      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2";
                    const activeClass = isActive
                      ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                      : "hover:text-zinc-950 dark:hover:text-zinc-50";
                    return `${baseClass} ${activeClass}`;
                  }),
                },
                [
                  Txt(item.label),
                  TabsPrimitive.Indicator({
                    store,
                    value: item.value,
                    style: "display:none;",
                  }),
                ],
              );
            },
          }),
        ],
      ),
      Show(
        {
          when: !!children,
          fallback: [
            h(
              For as any,
              {
                each: items || computed(state_, (d) => d.tabs),
                render(item: TabItem) {
                  return Show(
                    {
                      when: computed(state_, (d) => d.curId === item.value),
                    },
                    [
                      h(
                        TabsPrimitive.Content,
                        {
                          store,
                          value: item.value,
                          class: "mt-2",
                        },
                        item.content,
                      ),
                    ],
                  );
                },
              },
              [],
            ),
          ],
        },
        children,
      ),
    ],
  );
}
