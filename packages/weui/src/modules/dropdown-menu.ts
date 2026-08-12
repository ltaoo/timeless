import { ui, vm } from "@timeless/timeless";
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

export function DropdownMenu(
  props: ViewProps & { store: vm.DropdownMenuCore },
  children?: ViewChildren,
): TimelessElement {
  const state_ = refobj(props.store.state);

  return Fragment({}, [
    Show({
      when: !!children,
      ok() {
        return ui.DropdownMenuPrimitive.Trigger(
          { store: props.store },
          children,
        );
      },
    }),
    ui.DropdownMenuPrimitive.Content(
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
            class: "weui-dropdown-menu",
          },
          [
            For({
              each: computed(state_, (t) => {
                return t.items;
              }),
              render(
                item: vm.MenuItemCore | vm.MenuSeparatorCore | vm.MenuGroupCore,
              ) {
                if (item instanceof vm.MenuSeparatorCore) {
                  return DropdownMenuSeparator({});
                }
                if (item instanceof vm.MenuGroupCore) {
                  return DropdownMenuGroup({ store: item });
                }
                return DropdownMenuItem({ store: item as vm.MenuItemCore });
              },
            }),
          ],
        ),
      ],
    ),
  ]);
}

function DropdownMenuSeparator(_props: ViewProps) {
  return ui.DropdownMenuPrimitive.Separator({
    class: "weui-dropdown-menu__separator",
  });
}

function DropdownMenuGroup(props: ViewProps & { store: vm.MenuGroupCore }) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (t) => !!t.label);

  return ui.DropdownMenuPrimitive.Group({ store: props.store }, [
    Show({
      when: has_label_,
      ok() {
        return [
          View(
            {
              class: "weui-dropdown-menu__group-label",
            },
            [computed(state_, (t) => t.label)],
          ),
        ];
      },
    }),
    For({
      each: computed(state_, (t) => t.items),
      render(item: vm.MenuItemCore | vm.MenuSeparatorCore | vm.MenuGroupCore) {
        if (item instanceof vm.MenuSeparatorCore) {
          return DropdownMenuSeparator({});
        }
        if (item instanceof vm.MenuGroupCore) {
          return DropdownMenuGroup({ store: item });
        }
        return DropdownMenuItem({ store: item as vm.MenuItemCore });
      },
    }),
  ]);
}

function DropdownMenuItem(props: ViewProps & { store: vm.MenuItemCore }) {
  const is_checkable =
    props.store instanceof vm.MenuCheckboxMenu ||
    props.store instanceof vm.MenuRadioItem ||
    props.store instanceof vm.MenuRadioGroupItem;

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
    props.store.menu ? props.store.menu.state : ({} as vm.MenuCore["state"]),
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
      ui.DropdownMenuPrimitive.Item(
        {
          store: props.store,
          class: computed(state_, (t) => {
            let cls = "weui-dropdown-menu__item";
            if (t.focused) cls += " weui-dropdown-menu__item--focused";
            if (t.disabled) cls += " weui-dropdown-menu__item--disabled";
            return cls;
          }),
        },
        [
          Show({
            when: has_icon_,
            ok() {
              return [
                View(
                  {
                    class: "weui-dropdown-menu__icon",
                  },
                  [props.store.icon as TimelessElement],
                ),
              ];
            },
          }),
          View({ class: "weui-dropdown-menu__label" }, [props.store.label]),
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
                  class: "weui-dropdown-menu__chevron",
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
                  ui.DropdownMenuPrimitive.SubMenuContent(
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
                          class:
                            "weui-dropdown-menu weui-dropdown-menu__submenu",
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
                                      | vm.MenuItemCore
                                      | vm.MenuSeparatorCore
                                      | vm.MenuGroupCore,
                                  ) {
                                    if (item instanceof vm.MenuSeparatorCore) {
                                      return DropdownMenuSeparator({});
                                    }
                                    if (item instanceof vm.MenuGroupCore) {
                                      return DropdownMenuGroup({
                                        store: item,
                                      });
                                    }
                                    return DropdownMenuItem({
                                      store: item as vm.MenuItemCore,
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
