import {
  computed,
  Fragment,
  ListenerManager,
  refobj,
} from "@timeless/timeless";
import { For, ViewProps, Show, View, Icon } from "@timeless/timeless";
import { SelectPrimitive } from "@timeless/ui-primitive";
import { SelectCore, SelectItemCore, SelectGroupCore } from "@timeless/ui-vm";

export function Select(
  props: ViewProps & { store: SelectCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  const methods = {
    render_opt(option: SelectItemCore<any>) {
      const item_ = refobj(option.state);
      const listener$ = ListenerManager([item_]);
      listener$.add(
        option.onStateChange((v) => {
          item_.as(v);
        }),
      );
      return SelectPrimitive.Item(
        {
          select$: store,
          item$: option,
          style: computed(item_, (t) => {
            const result: Record<string, string> = {
              padding: "12px var(--weui-CELL-GAP)",
              "font-size": "var(--weui-FONT-SIZE)",
              color: "var(--weui-FG-0)",
              cursor: "pointer",
              transition: "background .2s",
            };
            if (t.selected) {
              result.background = "var(--weui-STATELAYER-PRESSED)";
            }
            if (t.focused && !t.selected) {
              result.background = "var(--weui-STATELAYER-HOVERED)";
            }
            if (t.disabled) {
              result.opacity = "0.3";
              result["pointer-events"] = "none";
            }
            return result;
          }),
          onUnmounted() {
            listener$.destroy();
          },
        },
        [
          SelectPrimitive.ItemIndicator(
            {
              store: option,
              style: {
                position: "absolute",
                right: "var(--weui-CELL-GAP)",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--weui-BRAND)",
              },
            },
            [Icon({ name: "check", size: 14 })],
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
              const label_content =
                typeof entry.label === "function" ? entry.label() : entry.label;
              return [
                View(
                  {
                    style: {
                      padding: "8px var(--weui-CELL-GAP)",
                      "font-size": "var(--weui-FONT-SIZE-XS)",
                      color: "var(--weui-FG-1)",
                    },
                  },
                  [label_content as any],
                ),
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
  });
  listener$.add(filtered_entries_);

  return SelectPrimitive.Root(
    {
      store,
      onMounted() {
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
          style: computed(state_, (t) => {
            const result: Record<string, string> = {
              display: "flex",
              "align-items": "center",
              "justify-content": "space-between",
              height: "100%",
              padding: "0",
              background: "transparent",
              cursor: "pointer",
              "font-size": "var(--weui-FONT-SIZE)",
              color: "var(--weui-FG-0)",
            };
            if (t.disabled) {
              result.opacity = "0.3";
              result.cursor = "not-allowed";
            }
            return result;
          }),
        },
        [
          Show({
            when: computed(state_, (t) => t.search),
            ok() {
              return [
                SelectPrimitive.Search({
                  store,
                  style: {
                    width: "100%",
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    color: "var(--weui-FG-0)",
                    "font-size": "var(--weui-FONT-SIZE)",
                  },
                }),
              ];
            },
            else() {
              return SelectPrimitive.Value({
                store,
                style: computed(state_, (t) => {
                  if (t.value != null) {
                    return {
                      color: "var(--weui-FG-0)",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                    };
                  }
                  return { color: "var(--weui-FG-2)" };
                }),
              });
            },
          }),
          SelectPrimitive.Icon(
            {
              store,
              style: {
                "margin-left": "auto",
                "padding-left": "8px",
                color: "var(--weui-FG-2)",
              },
            },
            [Icon({ name: "chevron-down", size: 16 })],
          ),
        ],
      ),
      SelectPrimitive.Content(
        {
          ...rest,
          store,
          animation: {
            in: "weui-animate-menu-in",
            out: "weui-animate-menu-out",
          },
          style: {
            position: "relative",
            "min-width": "120px",
            "overflow-x": "hidden",
            "overflow-y": "auto",
            background: "var(--weui-BG-2)",
            color: "var(--weui-FG-0)",
            "border-radius": "8px",
            "box-shadow": "0 4px 12px rgba(0,0,0,.12)",
          },
        },
        () => [
          SelectPrimitive.Viewport(
            {
              store,
              style: { padding: "4px 0" },
            },
            [
              Show({
                when: computed(state_, (t) => t.loading),
                ok() {
                  return View(
                    {
                      style: {
                        padding: "24px 0",
                        "text-align": "center",
                        "font-size": "var(--weui-FONT-SIZE-SM)",
                        color: "var(--weui-FG-1)",
                      },
                    },
                    ["加载中..."],
                  );
                },
                else() {
                  return Show({
                    when: computed(
                      filtered_entries_,
                      (list) => list.length > 0,
                    ),
                    ok() {
                      return [
                        For({
                          each: filtered_entries_,
                          render: methods.render_entry,
                        }),
                      ];
                    },
                    else() {
                      return [
                        View(
                          {
                            style: {
                              padding: "24px 0",
                              "text-align": "center",
                              "font-size": "var(--weui-FONT-SIZE-SM)",
                              color: "var(--weui-FG-1)",
                            },
                          },
                          ["暂无数据"],
                        ),
                      ];
                    },
                  });
                },
              }),
            ],
          ),
        ],
      ),
    ],
  );
}
