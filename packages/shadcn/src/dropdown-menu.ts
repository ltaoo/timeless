import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  DropdownMenuPrimitive,
  For,
  View,
  Show,
  ViewChildren,
  ViewProps,
  Fragment,
  h,
  TimelessElement,
} from "@timeless/headless";
import {
  DropdownMenuCore,
  MenuCore,
  MenuItemCore,
  MenuSeparatorCore,
  MenuGroupCore,
} from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";
const MENU_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";

export function DropdownMenu(
  props: ViewProps & { store: DropdownMenuCore },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  return Fragment({}, [
    h(Show, { when: !!children }, [
      DropdownMenuPrimitive.Trigger({ store: props.store }, children),
    ]),
    DropdownMenuPrimitive.Content(
      {
        ...props,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95",
          out: "animate-out fade-out-0 zoom-out-95",
        },
      },
      [
        View({ class: MENU_CONTENT_CLASS }, [
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
        ]),
      ],
    ),
  ]);
}

function DropdownMenuSeparator(_props: ViewProps) {
  return DropdownMenuPrimitive.Separator(
    {
      class: "-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800",
    },
    [],
  );
}

function DropdownMenuGroup(props: ViewProps & { store: MenuGroupCore }) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (t) => !!t.label);

  return DropdownMenuPrimitive.Group({ store: props.store }, [
    Show({ when: has_label_ }, [
      DropdownMenuPrimitive.Label(
        {
          class:
            "px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400",
        },
        [computed(state_, (t) => t.label)],
      ),
    ]),
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
  const state_ = refobj(props.store.state);
  const show_chevron_ = ref(!!props.store.menu);
  const has_icon_ = computed(state_, (t) => !!t.icon);
  const has_shortcut_ = computed(state_, (t) => !!t.shortcut);
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as MenuCore["state"]),
  );

  [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
    (() => {
      if (props.store.menu) {
        return props.store.menu.onStateChange((v) => {
          menu_state_.as(v);
        });
      }
      return () => {};
    })(),
  ];

  return View({ class: "t-dropdown-menu-item-wrap" }, [
    DropdownMenuPrimitive.Item(
      {
        store: props.store,
        class: classNames([
          computed(state_, (t) => {
            return t.focused
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              : "";
          }),
          computed(state_, (t) => {
            return t.disabled ? "pointer-events-none opacity-50" : "";
          }),
          MENU_ITEM_CLASS,
        ]),
      },
      [
        Show({ when: has_icon_ }, [
          View(
            {
              class: "mr-2 h-4 w-4 flex-shrink-0",
            },
            [props.store.icon as TimelessElement],
          ),
        ]),
        props.store.label,
        Show({ when: has_shortcut_ }, [
          View(
            {
              class:
                "ml-auto pl-4 text-xs tracking-widest text-gray-400 dark:text-gray-500",
            },
            [computed(state_, (t) => t.shortcut)],
          ),
        ]),
        Show({ when: show_chevron_ }, [
          ChevronRightOutlined({ class: "ml-auto w-4 h-4" }),
        ]),
      ],
    ),
    (() => {
      if (!props.store.menu) {
        return View({}, [null]);
      }
      const menu = props.store.menu;
      if (menu.content) {
        const inner$ = DropdownMenuPrimitive.SubMenuContent(
          {
            store: menu,
            animation: {
              in: "animate-in fade-in-0 zoom-in-95",
              out: "animate-out fade-out-0 zoom-out-95",
            },
          },
          [
            View(
              {
                class:
                  "overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-950",
              },
              [menu.content as TimelessElement],
            ),
          ],
        );
        return View({}, [inner$]);
      }
      const inner$ = DropdownMenuPrimitive.SubMenuContent(
        {
          store: menu,
          animation: {
            in: "animate-in fade-in-0 zoom-in-95",
            out: "animate-out fade-out-0 zoom-out-95",
          },
        },
        [
          View({ class: MENU_CONTENT_CLASS }, [
            For({
              each: computed(menu_state_, (t) => {
                return t.items;
              }),
              render(
                item: MenuItemCore | MenuSeparatorCore | MenuGroupCore,
              ) {
                if (item instanceof MenuSeparatorCore) {
                  return DropdownMenuSeparator({});
                }
                if (item instanceof MenuGroupCore) {
                  return DropdownMenuGroup({ store: item });
                }
                return DropdownMenuItem({ store: item as MenuItemCore });
              },
            }),
          ]),
        ],
      );
      return View({}, [inner$]);
    })(),
  ]);
}
