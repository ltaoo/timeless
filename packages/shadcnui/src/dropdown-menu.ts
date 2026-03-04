import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  DropdownMenuPrimitive,
  For,
  View,
  Portal,
  Fragment,
  Show,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { DropdownMenuCore, MenuCore, MenuItemCore } from "@timeless/ui";
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

  return Show({ when: !!children }, [
    DropdownMenuPrimitive.Trigger({ store: props.store }, children),
    DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
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
                console.log(
                  "[DropdownMenu For] items count:",
                  t.items.length,
                  t.items.map((i) => i.label),
                );
                return t.items;
              }),
              render(item: MenuItemCore) {
                return DropdownMenuItem({ store: item });
              },
            }),
          ]),
        ],
      ),
    ]),
  ]);
}

function DropdownMenuItem(props: ViewProps & { store: MenuItemCore }) {
  const state_ = refobj(props.store.state);
  const has_submenu_ = ref(!!props.store.menu);
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
          computed(has_submenu_, (t) => {
            return [MENU_ITEM_CLASS, t ? "flex justify-between" : ""].join(" ");
          }),
        ]),
      },
      [
        props.store.label,
        Show({ when: has_submenu_ }, [
          ChevronRightOutlined({ class: "w-4 h-4" }),
        ]),
      ],
    ),
    (() => {
      console.log("DropdownMenuItem render", props.store.label);
      const inner$ = props.store.menu
        ? DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
            DropdownMenuPrimitive.SubMenuContent(
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
                    render(item: MenuItemCore) {
                      return DropdownMenuItem({ store: item });
                    },
                  }),
                ]),
              ],
            ),
          ])
        : null;
      return View({}, [inner$]);
    })(),
  ]);
}
