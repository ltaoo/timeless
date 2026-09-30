import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  classNames,
  computed,
  ref,
  refobj,
} from "@timeless/timeless";
import {
  For,
  Show,
  TimelessElement,
  View,
  ViewProps,
} from "@timeless/timeless";

// side-effect：安装 vm.MenuCore.listen_item 的子菜单监听器补丁
import { t } from "./menu-shared";

/**
 * Menu · Bootstrap 5.3
 *
 * 常驻（非浮层）菜单，类名沿用上游：.dropdown-menu / .dropdown-item /
 * .dropdown-divider / .dropdown-header。
 *
 * 子菜单（item.menu）通过 .dropdown-submenu 浮层渲染，箭头用 Icon 指示。
 */

export function Menu(props: ViewProps & { store: vm.MenuCore }) {
  const state_ = refobj(props.store.state);

  const listener$ = ListenerManager([state_]);

  vm.initGlobalPointerListener();

  return View(
    {
      class: "dropdown-menu menu-static",
      onMounted(event) {
        listener$.add(
          props.store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        const $element = event.target;
        const layer_id = `menu-${menu_id_counter++}`;
        const layer$ = vm.getGlobalLayerManager();

        const layer: vm.Layer = {
          id: layer_id,
          containsPoint(x: number, y: number) {
            if (!$element) return false;
            const rect = $element.getBoundingClientRect();
            return (
              x >= rect.left &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom
            );
          },
          dismiss() {
            // 常驻根菜单只关闭已展开的子菜单
            if (
              props.store.cur_item &&
              props.store.cur_item.menu &&
              props.store.cur_item.menu.state.open
            ) {
              props.store.cur_item.menu.hide({ reason: "dismis" });
            }
          },
        };
        layer$.register(layer);
        if (props.onMounted) {
          listener$.add(props.onMounted(event));
        }
        return function () {
          listener$.destroy();
          layer$.unregister(layer_id);
        };
      },
    },
    [
      For({
        each: computed(state_, (s) => s.items),
        render(item: MenuEntry) {
          return renderMenuEntry(item, MenuSeparator, MenuGroup, MenuItem);
        },
      }),
    ],
  );
}

let menu_id_counter = 0;

export type MenuEntry =
  | vm.MenuItemCore
  | vm.MenuSeparatorCore
  | vm.MenuGroupCore;

export function renderMenuEntry(
  item: MenuEntry,
  Sep: (props: ViewProps) => TimelessElement,
  Grp: (props: ViewProps & { store: vm.MenuGroupCore }) => TimelessElement,
  Itm: (props: ViewProps & { store: vm.MenuItemCore }) => TimelessElement,
): TimelessElement {
  if (item instanceof vm.MenuSeparatorCore) {
    return Sep({});
  }
  if (item instanceof vm.MenuGroupCore) {
    return Grp({ store: item });
  }
  return Itm({ store: item as vm.MenuItemCore });
}

export function MenuSeparator(_props: ViewProps) {
  return ui.MenuPrimitive.Separator({ class: t.separator.class });
}

export function MenuGroup(
  props: ViewProps & { store: vm.MenuGroupCore },
  renderEntry: (
    item: MenuEntry,
    Sep: (p: ViewProps) => TimelessElement,
    Grp: (p: ViewProps & { store: vm.MenuGroupCore }) => TimelessElement,
    Itm: (p: ViewProps & { store: vm.MenuItemCore }) => TimelessElement,
  ) => TimelessElement = renderMenuEntry,
) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (s) => !!s.label);

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.MenuPrimitive.Group({ store: props.store }, [
    Show({
      when: has_label_,
      ok() {
        return [
          ui.MenuPrimitive.GroupLabel(
            { class: t.label.class },
            [computed(state_, (s) => s.label)],
          ),
        ];
      },
    }),
    For({
      each: computed(state_, (s) => s.items),
      render(item: MenuEntry) {
        return renderEntry(item, MenuSeparator, MenuGroup, MenuItem);
      },
    }),
  ]);
}

export function MenuItem(
  props: ViewProps & { store: vm.MenuItemCore },
  renderEntry: (
    item: MenuEntry,
    Sep: (p: ViewProps) => TimelessElement,
    Grp: (p: ViewProps & { store: vm.MenuGroupCore }) => TimelessElement,
    Itm: (p: ViewProps & { store: vm.MenuItemCore }) => TimelessElement,
  ) => TimelessElement = renderMenuEntry,
) {
  const state_ = refobj(props.store.state);
  const has_submenu_ = ref(!!props.store.menu);
  const has_icon_ = computed(state_, (s) => !!s.icon);
  const has_shortcut_ = computed(state_, (s) => !!s.shortcut);
  const is_checkable_ = isCheckable(props.store);
  const is_checked_ = computed(state_, (s: any) => {
    if (!isCheckable(props.store)) return false;
    return s.checked === true || s.checked === "indeterminate";
  });
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as vm.MenuCore["state"]),
  );

  const listener$ = ListenerManager([
    state_,
    has_submenu_,
    has_icon_,
    has_shortcut_,
    is_checked_,
    menu_state_,
  ]);

  return View(
    {
      class: "menu-item-wrap",
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
      ui.MenuPrimitive.Item(
        {
          store: props.store,
          class: classNames([
            t.item.class,
            computed(state_, (s) => (s.focused ? t.itemHover.class : "")),
            computed(state_, (s) => (s.disabled ? t.itemDisabled.class : "")),
          ]),
        },
        [
          Show({
            when: is_checkable_,
            ok() {
              return [
                View({ class: t.check.class }, [
                  Show({
                    when: is_checked_,
                    ok() {
                      return [Icon({ name: "check", size: 14 })];
                    },
                  }),
                ]),
              ];
            },
          }),
          Show({
            when: has_icon_,
            ok() {
              return [
                View({ class: t.icon.class }, [
                  props.store.icon as TimelessElement,
                ]),
              ];
            },
          }),
          props.store.label,
          Show({
            when: has_shortcut_,
            ok() {
              return [
                View({ class: t.shortcut.class }, [
                  computed(state_, (s) => s.shortcut),
                ]),
              ];
            },
          }),
          Show({
            when: has_submenu_,
            ok() {
              return [
                Icon({ class: t.submenuArrow.class, name: "chevron-right" }),
              ];
            },
          }),
        ],
      ),
      Show({
        when: has_submenu_,
        ok() {
          const menu = props.store.menu;
          return Show({
            when: computed(menu_state_, (s) => s.open),
            ok() {
              return ui.MenuPrimitive.Portal({}, [
                ui.MenuPrimitive.SubMenuContent(
                  {
                    store: menu!,
                    animation: {
                      in: "is-enter",
                      out: "is-exit",
                    },
                  },
                  [
                    View({ class: t.submenu.class }, [
                      For({
                        each: computed(menu_state_, (s) => s.items),
                        render(item: MenuEntry) {
                          return renderEntry(
                            item,
                            MenuSeparator,
                            MenuGroup,
                            MenuItem,
                          );
                        },
                      }),
                    ]),
                  ],
                ),
              ]);
            },
          });
        },
      }),
    ],
  );
}

export function isCheckable(store: vm.MenuItemCore): boolean {
  return (
    store instanceof vm.MenuCheckboxMenu ||
    store instanceof vm.MenuRadioItem ||
    store instanceof vm.MenuRadioGroupItem
  );
}
