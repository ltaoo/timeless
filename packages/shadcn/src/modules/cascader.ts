import { combine, computed, Icon, ref, refobj } from "@timeless/timeless";
import {
  CascaderPrimitive,
  For,
  Show,
  View,
  ViewProps,
} from "@timeless/timeless";
import { CascaderCore, CascaderOption } from "@timeless/ui";

export function Cascader(
  props: ViewProps & { store: CascaderCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const allowClear = computed(state_, (d) => d.allowClear);
  const hasValue = computed(
    state_,
    (d) => d.value != null && d.value.length > 0,
  );
  const hovering = ref(false);
  const showClear = combine(
    { hovering, allowClear, hasValue },
    (t) => t.hovering && t.allowClear && t.hasValue,
  );

  return CascaderPrimitive.Root({ store }, [
    CascaderPrimitive.Trigger(
      {
        store,
        id,
        class: computed(state_, (d) => {
          const baseClass =
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
          const openClass = d.open
            ? "border-ring ring-3 ring-ring/50"
            : "dark:hover:bg-input/50";
          return `${baseClass} ${openClass}`;
        }),
        onMouseEnter() {
          hovering.as(true);
        },
        onMouseLeave() {
          hovering.as(false);
        },
        onMounted(event) {
          const el = (event as any).target as HTMLElement;
          el.addEventListener("mousedown", (e) => {
            e.stopPropagation();
          });
        },
      },
      [
        CascaderPrimitive.Value({
          store,
          class: computed(state_, (d) => {
            return d.value != null && d.value.length > 0
              ? "text-foreground"
              : "text-muted-foreground";
          }),
        }),
        Show({
          when: showClear,
          ok() {
            return [
              CascaderPrimitive.Clear(
                {
                  store,
                  class:
                    "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                },
                [Icon({ name: "circle-x" })],
              ),
            ];
          },
          else() {
            return [
              CascaderPrimitive.Icon(
                { class: "size-4 text-muted-foreground" },
                [Icon({ name: "chevron-down" })],
              ),
            ];
          },
        }),
      ],
    ),
    CascaderPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        store,
        class:
          "cn-menu-target cn-menu-translucent cascader__content relative z-50 flex flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0
            ? {
                "min-width": `${width}px;`,
              }
            : {};
        }),
      },
      [
        // 搜索框
        CascaderPrimitive.Search({
          store,
          class:
            "w-full border-b border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground",
        }),
        // 搜索结果
        CascaderPrimitive.SearchResults(
          {
            store,
            class: "max-h-72 overflow-auto p-1",
          },
          [
            For({
              each: computed(state_, (d) => d.searchResults),
              render(result: { path: CascaderOption<any>[]; value: any[] }) {
                return CascaderPrimitive.SearchResultItem(
                  {
                    store,
                    result,
                    class:
                      "relative flex w-full cursor-default select-none items-center rounded-md py-1 px-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground",
                  },
                  [
                    View({ as: "span" }, [
                      result.path.map((o) => o.label).join(" / "),
                    ]),
                  ],
                );
              },
            }),
          ],
        ),
        // 面板区域 - 在搜索模式下隐藏
        View(
          {
            class: computed(state_, (d) =>
              d.search && d.searchKeyword ? "hidden" : "flex",
            ),
          },
          [
            For({
              each: computed(state_, (d) => d.panels),
              key: "key",
              render(
                _panel: {
                  key: string;
                  options: (CascaderOption<any> & {
                    selected: boolean;
                    focused: boolean;
                  })[];
                  selectedValue: any;
                },
                panelIndex,
              ) {
                const panelIdx = panelIndex.value;
                return View(
                  {
                    class:
                      "cascader__panel min-w-36 max-h-72 overflow-auto p-1 border-r border-border last:border-r-0",
                  },
                  [
                    For({
                      each: computed(
                        state_,
                        (d) => d.panels[panelIdx]?.options || [],
                      ),
                      key: "value",
                      render(
                        option: CascaderOption<any> & {
                          selected: boolean;
                          focused: boolean;
                        },
                      ) {
                        return CascaderPrimitive.Item(
                          {
                            store,
                            panelIndex: panelIdx,
                            option,
                            class: computed(state_, (d) => {
                              const currentPanel = d.panels[panelIdx];
                              const opt = currentPanel?.options.find(
                                (o: any) => o.value === option.value,
                              );
                              const isSelected = Boolean(opt?.selected);
                              const isFocused = Boolean(opt?.focused);
                              return [
                                "relative flex w-full cursor-default select-none items-center justify-between gap-1.5 rounded-md py-1 px-1.5 text-sm outline-hidden transition-colors",
                                option.disabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "",
                                isSelected ? "font-medium" : "",
                                isFocused
                                  ? "bg-accent text-accent-foreground"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ");
                            }),
                          },
                          [
                            CascaderPrimitive.ItemText({}, [option.label]),
                            CascaderPrimitive.ItemIndicator(
                              {
                                store,
                                hasChildren: Boolean(
                                  option.children && option.children.length > 0,
                                ),
                                class: "size-4 text-muted-foreground",
                              },
                              [Icon({ name: "chevron-right" })],
                            ),
                          ],
                        );
                      },
                    }),
                  ],
                );
              },
            }),
          ],
        ),
      ],
    ),
  ]);
}
