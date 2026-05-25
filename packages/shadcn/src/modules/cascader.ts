import {
  classNames,
  combine,
  computed,
  Icon,
  ListenerManager,
  ref,
  refobj,
} from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";
import { CascaderPrimitive } from "@timeless/ui-primitive";
import { CascaderCore, CascaderOption } from "@timeless/ui-vm";

export function Cascader(
  props: ViewProps & { store: CascaderCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;

  const state_ = refobj(store.state);
  const hovering_ = ref(false);
  const allow_clear_ = computed(state_, (d) => d.allowClear);
  const has_value_ = computed(
    state_,
    (d) => d.value != null && d.value.length > 0,
  );
  const show_clear_ = combine(
    { hovering: hovering_, allow_clear: allow_clear_, has_value: has_value_ },
    (t) => t.hovering && t.allow_clear && t.has_value,
  );

  const listener$ = ListenerManager([
    state_,
    hovering_,
    allow_clear_,
    has_value_,
    show_clear_,
  ]);

  return CascaderPrimitive.Root(
    {
      store,
      onMounted() {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
      },
    },
    [
      CascaderPrimitive.Trigger(
        {
          store,
          id,
          class: classNames([
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            computed(state_, (d) => {
              return d.open
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
          onMounted(event) {
            const el = event.target;
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
            when: show_clear_,
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
          // style: computed(state_, () => {
          //   const width = store.reference?.width || 0;
          //   return width > 0
          //     ? {
          //         "min-width": `${width}px;`,
          //       }
          //     : {};
          // }),
        },
        () => [
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
              class: computed(state_, (d) => {
                return d.search && d.searchKeyword ? "hidden" : "flex";
              }),
            },
            [
              For({
                key: "key",
                each: computed(state_, (d) => d.panels),
                render(_, idx) {
                  const cur_panel = combine({ state: state_, idx }, (t) => {
                    return t.state.panels[t.idx] ?? null;
                  });
                  const options = computed(cur_panel, (t) => {
                    // console.log("the state change, find new options", t);
                    return t ? t.options : [];
                  });
                  return View(
                    {
                      class:
                        "cascader__panel min-w-36 max-h-72 overflow-auto p-1 border-r border-border last:border-r-transparent",
                    },
                    [
                      For({
                        key: "value",
                        each: options,
                        render(
                          option: CascaderOption<any> & {
                            selected: boolean;
                            focused: boolean;
                          },
                        ) {
                          const matched_opt = computed(cur_panel, (t) => {
                            return t
                              ? t.options.find(
                                  (o: any) => o.value === option.value,
                                )
                              : null;
                          });
                          return CascaderPrimitive.Item(
                            {
                              store,
                              panelIndex: idx.value,
                              option,
                              class: classNames([
                                "relative flex w-full cursor-default select-none items-center justify-between gap-1.5 rounded-md py-1 px-1.5 text-sm outline-hidden transition-colors",
                                computed(matched_opt, (d) => {
                                  const opt = d;
                                  const is_selected = opt
                                    ? Boolean(opt.selected)
                                    : false;
                                  const is_focused = opt
                                    ? Boolean(opt.focused)
                                    : false;
                                  const disabled = opt
                                    ? Boolean(opt.disabled)
                                    : false;
                                  return [
                                    disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : "",
                                    is_selected ? "font-medium" : "",
                                    is_focused
                                      ? "bg-accent text-accent-foreground"
                                      : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ");
                                }),
                              ]),
                            },
                            [
                              CascaderPrimitive.ItemText({}, [option.label]),
                              CascaderPrimitive.ItemIndicator(
                                {
                                  store,
                                  hasChildren: Boolean(
                                    option.children &&
                                    option.children.length > 0,
                                  ),
                                  class: "size-4 text-muted-foreground",
                                },
                                [Icon({ name: "chevron-right", size: 16 })],
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
    ],
  );
}
