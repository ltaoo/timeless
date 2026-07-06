import {
  ref,
  computed,
  refobj,
  Icon,
  ListenerManager,
} from "@timeless/timeless";
import {
  For,
  View,
  Show,
  ViewChildren,
  ViewProps,
  Fragment,
  TimelessElement,
} from "@timeless/timeless";
import { DropdownMenuPrimitive } from "@timeless/ui-primitive";
import {
  DropdownMenuCore,
  MenuCore,
  MenuItemCore,
  MenuSeparatorCore,
  MenuGroupCore,
  MenuCheckboxMenu,
  MenuRadioItem,
  MenuRadioGroupItem,
} from "@timeless/ui-vm";

export function DropdownMenu(
  props: ViewProps & { store: DropdownMenuCore },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  return Fragment({}, [
    Show({
      when: !!children,
      ok() {
        return DropdownMenuPrimitive.Trigger({ store: props.store }, children);
      },
    }),
    DropdownMenuPrimitive.Content(
      {
        ...props,
        animation: {
          in: "weui-animate-menu-in",
          out: "weui-animate-menu-out",
        },
      },
      () => [
        View(
          {
            style: {
              position: "relative",
              "z-index": "50",
              "min-width": "140px",
              overflow: "hidden",
              background: "#1b1b1b",
              border: "1px solid var(--weui-BG-4)",
              "border-radius": "8px",
              "box-shadow": "0 6px 30px rgba(0, 0, 0, 0.15)",
              padding: "6px",
            },
          },
          [
            For({
              each: computed(state_, (t) => {
                return t.items;
              }),
              render(item: MenuItemCore | MenuSeparatorCore | MenuGroupCore) {
                if (item instanceof MenuSeparatorCore) {
                  return DropdownMenuSeparator({});
                }
                if (item instanceof MenuGroupCore) {
                  return DropdownMenuGroup({ store: item });
                }
                return DropdownMenuItem({ store: item as MenuItemCore });
              },
            }),
          ],
        ),
      ],
    ),
  ]);
}

function DropdownMenuSeparator(_props: ViewProps) {
  return DropdownMenuPrimitive.Separator({
    style: {
      height: "1px",
      margin: "4px 8px",
      background: "rgba(255, 255, 255, 0.1)",
    },
  });
}

function DropdownMenuGroup(props: ViewProps & { store: MenuGroupCore }) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (t) => !!t.label);

  return DropdownMenuPrimitive.Group({ store: props.store }, [
    Show({
      when: has_label_,
      ok() {
        return [
          View(
            {
              style: {
                padding: "6px 10px",
                "font-size": "12px",
                color: "rgba(255, 255, 255, 0.5)",
              },
            },
            [computed(state_, (t) => t.label)],
          ),
        ];
      },
    }),
    For({
      each: computed(state_, (t) => t.items),
      render(item: MenuItemCore | MenuSeparatorCore | MenuGroupCore) {
        if (item instanceof MenuSeparatorCore) {
          return DropdownMenuSeparator({});
        }
        if (item instanceof MenuGroupCore) {
          return DropdownMenuGroup({ store: item });
        }
        return DropdownMenuItem({ store: item as MenuItemCore });
      },
    }),
  ]);
}

function DropdownMenuItem(props: ViewProps & { store: MenuItemCore }) {
  const is_checkable =
    props.store instanceof MenuCheckboxMenu ||
    props.store instanceof MenuRadioItem ||
    props.store instanceof MenuRadioGroupItem;

  const state_ = refobj(props.store.state);
  const show_chevron_ = ref(!!props.store.menu);
  const is_checked_ = computed(state_, (t) => {
    if (!is_checkable) {
      return false;
    }
    // @ts-ignore
    const checked = t.checked;
    return checked === true || checked === "indeterminate";
  });
  const has_icon_ = computed(state_, (t) => !!t.icon);
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as MenuCore["state"]),
  );
  const listener$ = ListenerManager([
    state_,
    show_chevron_,
    is_checked_,
    has_icon_,
    menu_state_,
  ]);

  return View(
    {
      onMounted(event) {
        listener$.add(
          props.store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (props.store.menu) {
          listener$.add(
            props.store.menu.onStateChange((v) => {
              menu_state_.as(v);
            }),
          );
        }
        if (props.onMounted) {
          listener$.add(props.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    [
      DropdownMenuPrimitive.Item(
        {
          store: props.store,
          style: computed(state_, (t) => {
            const result: Record<string, string> = {
              padding: "6px",
              "font-size": "14px",
              "line-height": "1.4",
              color: "rgba(255, 255, 255, 0.9)",
              cursor: "pointer",
              display: "flex",
              "align-items": "center",
              gap: "8px",
              "border-radius": "6px",
              transition: "background .15s",
            };
            if (t.focused) {
              result.background = "var(--weui-BRAND)";
              result.color = "#fff";
            }
            if (t.disabled) {
              result.opacity = "0.3";
              result["pointer-events"] = "none";
            }
            return result;
          }),
        },
        [
          Show({
            when: has_icon_,
            ok() {
              return [
                View(
                  {
                    style: {
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      "flex-shrink": "0",
                    },
                  },
                  [props.store.icon as TimelessElement],
                ),
              ];
            },
          }),
          View({ style: { flex: "1" } }, [props.store.label]),
          Show({
            when: is_checked_,
            ok() {
              return [
                Icon({
                  name: "check",
                  size: 16,
                  style: { "flex-shrink": "0" },
                }),
              ];
            },
          }),
          Show({
            when: show_chevron_,
            ok() {
              return [
                Icon({
                  name: "chevron-right",
                  size: 14,
                  style: { "flex-shrink": "0", opacity: "0.6" },
                }),
              ];
            },
          }),
        ],
      ),
      Show({
        when: !!props.store.menu,
        ok() {
          const menu = props.store.menu;
          return [
            Show({
              when: computed(menu_state_, (t) => t.open),
              ok() {
                return [
                  DropdownMenuPrimitive.SubMenuContent(
                    {
                      store: menu,
                      animation: {
                        in: "weui-animate-menu-in",
                        out: "weui-animate-menu-out",
                      },
                    },
                    [
                      View(
                        {
                          style: {
                            position: "relative",
                            "z-index": "50",
                            "min-width": "120px",
                            overflow: "hidden",
                            background: "#1b1b1b",
                            border: "1px solid var(--weui-BG-4)",
                            "border-radius": "8px",
                            "box-shadow": "0 6px 30px rgba(0, 0, 0, 0.15)",
                            padding: "6px",
                          },
                        },
                        [
                          Show({
                            when: !menu.content,
                            ok() {
                              return [
                                For({
                                  each: computed(menu_state_, (t) => {
                                    return t.items;
                                  }),
                                  render(
                                    item:
                                      | MenuItemCore
                                      | MenuSeparatorCore
                                      | MenuGroupCore,
                                  ) {
                                    if (item instanceof MenuSeparatorCore) {
                                      return DropdownMenuSeparator({});
                                    }
                                    if (item instanceof MenuGroupCore) {
                                      return DropdownMenuGroup({
                                        store: item,
                                      });
                                    }
                                    return DropdownMenuItem({
                                      store: item as MenuItemCore,
                                    });
                                  },
                                }),
                              ];
                            },
                            else() {
                              return [menu.content as TimelessElement];
                            },
                          }),
                        ],
                      ),
                    ],
                  ),
                ];
              },
            }),
          ];
        },
      }),
    ],
  );
}
