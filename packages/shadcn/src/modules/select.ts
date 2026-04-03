import { cn, combine, computed, ref, refobj } from "@timeless/primitive";
import {
  SelectPrimitive,
  For,
  ViewProps,
  Show,
  View,
} from "@timeless/primitive";
import { SelectCore } from "@timeless/ui";
import {
  CheckOutlined,
  ChevronDownOutlined,
  ChevronUpOutlined,
  CircleXOutlined,
} from "@timeless/icons";

export function Select(
  props: ViewProps & { store: SelectCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const allowClear = computed(state_, (d) => d.allowClear);
  const hasValue = computed(state_, (d) => d.value2 != null);
  const isLoading = computed(state_, (d) => d.loading || false);
  const isDisabled = computed(state_, (d) => d.disabled || false);
  const hovering = ref(false);
  const showClear = combine(
    { allowClear, hasValue, isLoading, isDisabled, hovering },
    (t) =>
      t.hovering && t.allowClear && t.hasValue && !t.isLoading && !t.isDisabled,
  );

  const ITEM_CLASS =
    "relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2";
  const GROUP_CLASS = "py-1";
  const GROUP_LABEL_CLASS =
    "px-1.5 py-1.5 text-xs font-medium text-muted-foreground select-none";

  function filterEntries(entries: any[], keyword: string): any[] {
    const q = (keyword || "").trim().toLowerCase();
    if (!q) {
      return entries;
    }
    const result: any[] = [];
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry) continue;
      if (entry.type === "group") {
        const nextItems = filterEntries(entry.items || [], q);
        if (nextItems.length > 0) {
          result.push({ ...entry, items: nextItems });
        }
        continue;
      }
      const label = String(entry.label || "");
      if (label.toLowerCase().includes(q)) {
        result.push(entry);
      }
    }
    return result;
  }

  const filteredEntries_ = computed(state_, (t: any) => {
    return filterEntries(t.entries || [], t.searchKeyword || "");
  });

  function renderOption(option: any) {
    return SelectPrimitive.Item(
      {
        store,
        value: option.value,
        disabled: !!option.disabled,
        class: cn([
          ITEM_CLASS,
          computed(state_, (d: any) => {
            const opt = (d.options || []).find(
              (o: any) => o.value === option.value,
            );
            const isFocused = Boolean(opt?.focused);
            const isSelected = Boolean(opt?.selected);
            const isDisabled = Boolean(opt?.disabled);
            return [
              isSelected ? "font-medium" : "",
              !isDisabled && isFocused
                ? "bg-accent text-accent-foreground"
                : "",
              isDisabled ? "text-muted-foreground" : "",
            ]
              .filter(Boolean)
              .join(" ");
          }),
        ]),
      },
      [
        SelectPrimitive.ItemIndicator(
          {
            store,
            value: option.value,
            class:
              "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
          },
          [CheckOutlined({})],
        ),
        SelectPrimitive.ItemText({}, [option.label]),
      ],
    );
  }

  function renderEntry(entry: any) {
    if (entry && entry.type === "group") {
      return View({ class: GROUP_CLASS }, [
        Show({ when: !!entry.label }, [
          View({ class: GROUP_LABEL_CLASS }, [() => entry.label ?? null]),
        ]),
        For({
          key: "key",
          each: entry.items || [],
          render: renderEntry,
        }),
      ]);
    }
    return renderOption(entry);
  }

  return SelectPrimitive.Root({ store }, [
    SelectPrimitive.Trigger(
      {
        id,
        store,
        class: cn([
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          computed(state_, (t) => {
            return t.open
              ? "border-ring ring-3 ring-ring/50"
              : "dark:hover:bg-input/50";
          }),
        ]),
        onMouseEnter() {
          hovering.as(true);
        },
        onMouseLeave() {
          hovering.as(false);
        },
        onMounted(event) {
          event.target.addEventListener("mousedown", (e) => {
            e.stopPropagation();
          });
        },
      },
      [
        SelectPrimitive.Value({
          store,
          class: computed(state_, (t) => {
            const hasSelection =
              t.value != null &&
              (t.options || []).some((o) => o.value === t.value);
            return hasSelection ? "text-foreground" : "text-muted-foreground";
          }),
        }),
        View({ class: "flex items-center gap-1.5" }, [
          Show(
            {
              when: showClear,
              fallback: [
                SelectPrimitive.Icon(
                  { store, class: "size-4 text-muted-foreground" },
                  [
                    Show(
                      {
                        when: computed(state_, (t) => t.open),
                        fallback: [ChevronDownOutlined({})],
                      },
                      [ChevronUpOutlined({})],
                    ),
                  ],
                ),
              ],
            },
            [
              SelectPrimitive.Clear(
                {
                  store,
                  class:
                    "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                },
                [CircleXOutlined({ class: "size-4" })],
              ),
            ],
          ),
        ]),
      ],
    ),
    SelectPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        store,
        class:
          "cn-menu-target cn-menu-translucent select__content relative z-50 max-h-96 min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0
            ? {
                "min-width": `${width}px`,
              }
            : {};
        }),
      },
      [
        SelectPrimitive.Viewport({ store, class: "p-1" }, [
          Show({ when: computed(state_, (t) => t.search) }, [
            View(
              {
                class:
                  "sticky top-0 z-10 -mx-1 mb-1 bg-popover px-1 pb-1 pt-0.5",
              },
              [
                SelectPrimitive.Search({
                  store,
                  class:
                    "h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                }),
              ],
            ),
          ]),
          Show(
            {
              when: computed(filteredEntries_, (list) => list.length > 0),
              fallback: [
                View(
                  {
                    class:
                      "py-6 text-center text-sm text-muted-foreground select-none",
                  },
                  [
                    computed(state_, (t) =>
                      t.loading ? "加载中..." : "暂无数据",
                    ),
                  ],
                ),
              ],
            },
            [
              For({
                key: "key",
                each: filteredEntries_,
                render: renderEntry,
              }),
            ],
          ),
        ]),
      ],
    ),
  ]);
}
