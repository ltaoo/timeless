import {
  classNames,
  combine,
  computed,
  Fragment,
  ListenerManager,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, ViewProps, Show, View, Icon } from "@timeless/timeless";
import { SelectPrimitive } from "@timeless/ui-primitive";
import { SelectCore, SelectItemCore, SelectGroupCore } from "@timeless/ui-vm";

const SelectOptionClassName =
  "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2";
const SelectGroupClassName = "scroll-my-1 p-1";
const SelectGroupLabelClassName =
  "px-1.5 py-1.5 text-xs font-medium text-muted-foreground select-none";

export function Select(
  props: ViewProps & { store: SelectCore<any>; id?: string },
) {
  const { store, id, class: cls, ...rest } = props;
  const state_ = refobj(store.state);
  const hovering_ = ref(false);
  const allow_clear_ = computed(state_, (d) => d.allowClear);
  const has_value_ = computed(state_, (d) => d.value != null);
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
    render_opt(option: SelectItemCore<any>) {
      const item_ = refobj(option.state);
      const cls_ = computed(item_, (t) => {
        const is_focused = t.focused;
        const is_selected = t.selected;
        const is_disabled = t.disabled;
        return [
          is_selected ? "font-medium" : "",
          !is_disabled && is_focused ? "bg-accent text-accent-foreground" : "",
          is_disabled ? "text-muted-foreground" : "",
        ]
          .filter(Boolean)
          .join(" ");
      });
      const listener$ = ListenerManager([item_, cls_]);
      listener$.add(
        option.onStateChange((v) => {
          item_.as(v);
        }),
      );
      return SelectPrimitive.Item(
        {
          select$: store,
          store: option,
          class: classNames([
            "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
            "focus:bg-accent focus:text-accent-foreground",
            "not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
            cls_,
          ]),
          onUnmounted() {
            listener$.destroy();
          },
        },
        [
          SelectPrimitive.ItemIndicator(
            {
              store: option,
              class:
                "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
            },
            [Icon({ name: "check", size: 12 })],
          ),
          SelectPrimitive.ItemText({}, [option.label]),
        ],
      );
    },
    render_entry(entry: SelectItemCore<any> | SelectGroupCore<any>) {
      if (entry && entry instanceof SelectGroupCore) {
        return Fragment({}, [
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
            key: "value",
            each: entry.options || [],
            render: methods.render_entry,
          }),
        ]);
      }
      return methods.render_opt(entry as SelectItemCore<any>);
    },
  };

  const filtered_entries_ = computed(state_, (t) => {
    return t.options;
    // return methods.filter_entries(t.entries || [], t.searchKeyword || "");
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
        return listener$.destroy;
      },
    },
    [
      SelectPrimitive.Trigger(
        {
          id,
          store,
          class: classNames([
            cls,
            "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            "data-placeholder:text-muted-foreground",
            "dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            // "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
            computed(state_, (t) => {
              return [
                // "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ",
                t.open && store.position !== "item-aligned"
                  ? "border-ring ring-3 ring-ring/50"
                  : "",
                // "disabled:cursor-not-allowed disabled:opacity-50 ",
                t.disabled ? "cursor-not-allowed opacity-50" : "",
                // "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 ",
                // todo
                // "data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] ",
                "h-8",
              ]
                .filter(Boolean)
                .join(" ");
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
            dataset: {
              slot: "select-value",
            },
            store,
            class: classNames([
              "flex items-center gap-1.5 line-clamp-1",
              computed(state_, (t) => {
                const has_selected =
                  t.value != null &&
                  (t.options || []).some((o) => {
                    return o instanceof SelectItemCore && o.value === t.value;
                  });
                return has_selected
                  ? "text-foreground"
                  : "text-muted-foreground";
              }),
            ]),
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
                  {
                    store,
                    class: "pointer-events-none size-4 text-muted-foreground",
                  },
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
          dataset: {
            slot: "select-content",
            "align-trigger": store.position === "item-aligned" ? "" : undefined,
          },
          attributes: {
            role: "listbox",
          },
          animation: {
            in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
          },
          store,
          class: classNames([
            "cn-menu-target cn-menu-translucent relative z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none flex flex-col",
            "max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) ",
            "max-h-[var(--radix-select-content-available-height)] origin-[var(--radix-select-content-transform-origin)] ",
            "data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            store.position === "item-aligned" ? "animate-none" : "",
            store.position === "popper"
              ? "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
              : "",
          ]),
          style: {
            "box-sizing": "border-box",
            "max-height": "100%",
            display: "flex",
            "flex-direction": "column",
            outline: "none",
            "pointer-events": "auto",
          },
        },
        () => [
          // SelectPrimitive.ScrollUpButton(
          //   {
          //     store: store,
          //     class:
          //       "z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
          //   },
          //   [Icon({ name: "chevron-up", size: 16 })],
          // ),
          // View({ class: "h-[10px]" }, []),
          SelectPrimitive.Viewport(
            {
              store,
              class: classNames([
                SelectGroupClassName,
                "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
              ]),
            },
            [
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
            ],
          ),
          // View({ class: "h-[10px]" }, []),
          // SelectPrimitive.ScrollDownButton(
          //   {
          //     store,
          //     class:
          //       "z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
          //   },
          //   [Icon({ name: "chevron-down", size: 16 })],
          // ),
        ],
      ),
    ],
  );
}
