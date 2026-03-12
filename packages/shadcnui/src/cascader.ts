import { computed, refobj } from "@timeless/reactive";
import {
  CascaderPrimitive,
  For,
  View,
  ViewProps,
} from "@timeless/headless";
import { CascaderCore, CascaderOption } from "@timeless/ui";
import { ChevronDownOutlined, ChevronRightOutlined } from "@timeless/icons";

export function Cascader(
  props: ViewProps & { store: CascaderCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return CascaderPrimitive.Root({ store }, [
    CascaderPrimitive.Trigger(
      {
        store,
        id,
        class: computed(state_, (d) => {
          const baseClass =
            "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300";
          const focusedClass = d.open
            ? "border-zinc-950 bg-zinc-50 dark:border-zinc-300 dark:bg-zinc-900"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
          return `${baseClass} ${focusedClass}`;
        }),
        onMounted(el: HTMLElement) {
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
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400";
          }),
        }),
        CascaderPrimitive.Icon({ class: "h-4 w-4 opacity-50" }, [
          ChevronDownOutlined({}),
        ]),
      ],
    ),
    CascaderPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 slide-in-from-top-2",
          out: "animate-out fade-out-0 slide-out-to-top-2",
        },
        store,
        class:
          "cascader__content relative z-50 flex overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0 ? `min-width: ${width}px;` : "";
        }),
      },
      [
        // 搜索框
        CascaderPrimitive.Search({
          store,
          class:
            "w-full border-b border-zinc-200 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:placeholder:text-zinc-400",
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
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
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
              render(
                panel: {
                  options: (CascaderOption<any> & {
                    selected: boolean;
                    focused: boolean;
                  })[];
                  selectedValue: any;
                },
                panelIndex: number,
              ) {
                return View(
                  {
                    class:
                      "cascader__panel min-w-[140px] max-h-72 overflow-auto p-1 border-r border-zinc-200 last:border-r-0 dark:border-zinc-800",
                  },
                  [
                    For({
                      each: panel.options,
                      render(
                        option: CascaderOption<any> & {
                          selected: boolean;
                          focused: boolean;
                        },
                      ) {
                        return CascaderPrimitive.Item(
                          {
                            store,
                            panelIndex,
                            option,
                            class: computed(state_, () => {
                              const isSelected = option.selected;
                              const isFocused = option.focused;
                              return [
                                "relative flex w-full cursor-default select-none items-center justify-between rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",
                                option.disabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "",
                                isSelected
                                  ? "bg-zinc-200/70 text-zinc-900 font-medium dark:bg-zinc-700/70 dark:text-zinc-50"
                                  : "",
                                !isSelected && isFocused
                                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
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
                                class: "h-4 w-4 opacity-50",
                              },
                              [ChevronRightOutlined({})],
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
