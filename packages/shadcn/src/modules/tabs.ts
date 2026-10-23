import { ui, vm } from "@timeless/timeless";
import { computed, refobj } from "@timeless/timeless";
import { For, Show, ViewChildren, ViewProps } from "@timeless/timeless";

type TabItem = {
  value: string;
  label: string;
  content?: ViewChildren;
};

export function Tabs(
  props: ViewProps & {
    store: vm.TabHeaderCore<any>;
    items?: TabItem[];
  },
  children?: ViewChildren,
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);
  const name = rest.attributes?.n ?? `tabs-${store.uid()}`;
  const tabHosts = new Map<string, any>();

  store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.TabsPrimitive.Root(
    {
      store,
      class: "w-full",
      ...rest,
    },
    [
      ui.TabsPrimitive.List(
        {
          store,
          class:
            "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
          attributes: { n: `${name}-list`, role: "tablist" },
        },
        [
          For({
            each: items || computed(state_, (d) => d.tabs),
            render(item: TabItem, index) {
              const i = index.value;
              return ui.TabsPrimitive.Tab(
                {
                  store,
                  value: item.value,
                  index: i,
                  attributes: {
                    id: `${name}-tab-${item.value}`,
                    n: `${name}-tab-${item.value}`,
                    role: "tab",
                    "aria-selected": computed(state_, (state) =>
                      String(state.curId === item.value),
                    ),
                    "aria-controls": children
                      ? undefined
                      : `${name}-content-${item.value}`,
                    tabindex: computed(state_, (state) =>
                      state.curId === item.value ? "0" : "-1",
                    ),
                  },
                  onMounted(event) {
                    tabHosts.set(item.value, event.target);
                    return () => {
                      tabHosts.delete(item.value);
                    };
                  },
                  onKeyDown(event) {
                    const options = items ?? store.tabs;
                    const count = options.length;
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? count - 1
                          : event.key === "ArrowRight"
                            ? (i + 1) % count
                            : event.key === "ArrowLeft"
                              ? (i - 1 + count) % count
                              : undefined;
                    if (next === undefined) return;
                    event.preventDefault();
                    store.selectById(options[next].value);
                    tabHosts.get(options[next].value)?.focus();
                  },
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
                  item.label,
                  ui.TabsPrimitive.Indicator({
                    store,
                    value: item.value,
                    style: {
                      display: "none",
                    },
                  }),
                ],
              );
            },
          }),
        ],
      ),
      Show({
        when: !!children,
        ok() {
          return children || [];
        },
        else() {
          return [
            For({
              each: items || computed(state_, (d) => d.tabs),
              render(item: TabItem) {
                return Show({
                  when: computed(state_, (d) => d.curId === item.value),
                  ok() {
                    return [
                      ui.TabsPrimitive.Content(
                        {
                          store,
                          value: item.value,
                          id: `${name}-content-${item.value}`,
                          attributes: {
                            n: `${name}-content-${item.value}`,
                            role: "tabpanel",
                            "aria-labelledby": `${name}-tab-${item.value}`,
                          },
                          class: "mt-2",
                        },
                        item.content,
                      ),
                    ];
                  },
                });
              },
            }),
          ];
        },
      }),
    ],
  );
}
