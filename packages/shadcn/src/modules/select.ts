import {
  classNames,
  combine,
  computed,
  ListenerManager,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, ViewProps, Show, View, Icon } from "@timeless/timeless";
import { SelectPrimitive } from "@timeless/ui-primitive";
import { SelectCore } from "@timeless/ui-vm";

export function Select(
  props: ViewProps & { store: SelectCore<any>; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;
  const state_ = refobj(store.state);
  const hovering_ = ref(false);
  const allow_clear_ = computed(state_, (d) => d.allowClear);
  const has_value_ = computed(state_, (d) => d.value2 != null);
  const is_loading_ = computed(state_, (d) => d.loading || false);
  const is_disabled_ = computed(state_, (d) => d.disabled || false);
  const show_clear_ = combine(
    {
      allow_clear: allow_clear_,
      has_value: has_value_,
      is_loading: is_loading_,
      is_disabled: is_disabled_,
      hovering: hovering_,
    },
    (t) => {
      return (
        t.hovering &&
        t.allow_clear &&
        t.has_value &&
        !t.is_loading &&
        !t.is_disabled
      );
    },
  );
  const listener$ = ListenerManager([
    state_,
    show_clear_,
    hovering_,
    allow_clear_,
    has_value_,
    is_loading_,
    is_disabled_,
  ]);

  const SelectOptionClassName =
    "relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2";
  const SelectGroupClassName = "py-1";
  const SelectGroupLabelClassName =
    "px-1.5 py-1.5 text-xs font-medium text-muted-foreground select-none";

  const methods = {
    filter_entries(entries: any[], keyword: string): any[] {
      const q = (keyword || "").trim().toLowerCase();
      if (!q) {
        return entries;
      }
      const result: any[] = [];
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (!entry) continue;
        if (entry.type === "group") {
          const next_options = methods.filter_entries(entry.items || [], q);
          if (next_options.length > 0) {
            result.push({ ...entry, items: next_options });
          }
          continue;
        }
        const label = String(entry.label || "");
        if (label.toLowerCase().includes(q)) {
          result.push(entry);
        }
      }
      return result;
    },
    render_opt(option: {
      type: "group" | "option";
      value: any;
      label?: string;
      focused?: boolean;
      selected?: boolean;
      disabled?: boolean;
      items?: {}[];
    }) {
      return SelectPrimitive.Item(
        {
          store,
          value: option.value,
          disabled: !!option.disabled,
          class: classNames([
            SelectOptionClassName,
            computed(state_, (t) => {
              const matched = t.options.find((o) => o.value === option.value);
              const is_focused = Boolean(matched.focused);
              const is_selected = Boolean(matched.selected);
              const is_disabled = Boolean(matched.disabled);
              return [
                is_selected ? "font-medium" : "",
                !is_disabled && is_focused
                  ? "bg-accent text-accent-foreground"
                  : "",
                is_disabled ? "text-muted-foreground" : "",
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
            [Icon({ name: "check", size: 16 })],
          ),
          SelectPrimitive.ItemText({}, [option.label]),
        ],
      );
    },
    render_entry(entry: {
      type: "group";
      value: any;
      label?: string;
      items?: {}[];
    }) {
      if (entry && entry.type === "group") {
        return View({ class: SelectGroupClassName }, [
          Show({
            when: !!entry.label,
            ok() {
              return [
                View({ class: SelectGroupLabelClassName }, [
                  entry.label ?? null,
                ]),
              ];
            },
          }),
          For({
            key: "key",
            each: entry.items || [],
            render: methods.render_entry,
          }),
        ]);
      }
      return methods.render_opt(entry);
    },
  };

  const filtered_entries_ = computed(state_, (t) => {
    return methods.filter_entries(t.entries || [], t.searchKeyword || "");
  });
  listener$.add(filtered_entries_);

  return SelectPrimitive.Root(
    {
      store,
      onMounted() {
        // console.log("[shadcn]Select - root mounted");
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        return listener$.clean;
      },
    },
    [
      SelectPrimitive.Trigger(
        {
          id,
          store,
          class: classNames([
            cls,
            "flex h-8 min-w-[120px] items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            computed(state_, (t) => {
              return t.open
                ? "border-ring ring-3 ring-ring/50"
                : "dark:hover:bg-input/50";
            }),
          ]),
          onMouseEnter() {
            hovering_.as(true);
          },
          onMouseLeave() {
            hovering_.as(false);
          },
          onMouseDown(e) {
            e.stopPropagation();
          },
        },
        [
          SelectPrimitive.Value({
            store,
            class: computed(state_, (t) => {
              const has_selected =
                t.value != null &&
                (t.options || []).some((o) => o.value === t.value);
              return has_selected ? "text-foreground" : "text-muted-foreground";
            }),
          }),
          Show({
            when: show_clear_,
            ok() {
              return [
                SelectPrimitive.Clear(
                  {
                    store,
                    class:
                      "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                  },
                  [Icon({ name: "circle-x", size: 16 })],
                ),
              ];
            },
            else() {
              return [
                SelectPrimitive.Icon(
                  { store, class: "size-4 text-muted-foreground" },
                  [
                    Icon({
                      name: "chevron-up",
                      class: classNames([
                        computed(state_, (t) => {
                          return t.open ? "" : "rotate-180";
                        }),
                      ]),
                    }),
                  ],
                ),
              ];
            },
          }),
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
            Show({
              when: computed(state_, (t) => t.search),
              ok() {
                return [
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
                ];
              },
            }),
            Show({
              when: computed(filtered_entries_, (list) => list.length > 0),
              ok() {
                console.log("render options", filtered_entries_.value);
                return [
                  For({
                    key: "value",
                    each: filtered_entries_,
                    render: methods.render_entry,
                  }),
                ];
              },
              else() {
                return [
                  View(
                    {
                      class:
                        "py-6 text-center text-sm text-muted-foreground select-none",
                    },
                    [
                      computed(state_, (t) => {
                        return t.loading ? "加载中..." : "暂无数据";
                      }),
                    ],
                  ),
                ];
              },
            }),
          ]),
        ],
      ),
    ],
  );
}
