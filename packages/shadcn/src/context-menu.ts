import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  ContextMenuPrimitive,
  For,
  Fragment,
  Show,
  Txt,
  View,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "@timeless/headless";
import {
  ContextMenuCore,
  MenuCore,
  MenuItemCore,
  MenuSeparatorCore,
  PresenceCore,
} from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";

const MENU_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";

export function ContextMenu(
  props: ViewProps & { store: ContextMenuCore },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);
  // const presence_state_ = refobj(props.store.menu.presence.state);

  return Fragment({}, [
    ContextMenuPrimitive.Trigger({ store: props.store }, children),
    ContextMenuPrimitive.Content(
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
            render(item: MenuItemCore | MenuSeparatorCore) {
              if (item instanceof MenuSeparatorCore) {
                return ContextMenuSeparator({});
              }
              return ContextMenuItem({ store: item as MenuItemCore });
            },
          }),
        ]),
      ],
    ),
  ]);
}

function ContextMenuSeparator(_props: ViewProps) {
  return ContextMenuPrimitive.Separator(
    {
      class: "-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-800",
    },
    [],
  );
}

function ContextMenuItem(props: ViewProps & { store: MenuItemCore }) {
  const state_ = refobj(props.store.state);
  const has_submenu_ = ref(!!props.store.menu);
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

  return View({ class: "t-context-menu-item-wrap" }, [
    ContextMenuPrimitive.Item(
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
          computed(has_submenu_, (t) => {
            return [MENU_ITEM_CLASS, t ? "flex justify-between" : ""].join(" ");
          }),
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
        Show({ when: has_submenu_ }, [
          ChevronRightOutlined({ class: "w-4 h-4" }),
        ]),
      ],
    ),
    (() => {
      const inner$ = props.store.menu
        ? ContextMenuPrimitive.SubMenuContent(
            {
              store: props.store.menu,
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
                  render(item: MenuItemCore | MenuSeparatorCore) {
                    if (item instanceof MenuSeparatorCore) {
                      return ContextMenuSeparator({});
                    }
                    return ContextMenuItem({ store: item as MenuItemCore });
                  },
                }),
              ]),
            ],
          )
        : null;
      return View({}, [inner$]);
    })(),
  ]);
}
