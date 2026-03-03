import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  DropdownMenuPrimitive,
  For,
  Fragment,
  Show,
  Txt,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import {
  DropdownMenuCore,
  MenuCore,
  MenuItemCore,
  PresenceCore,
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
  const presence_state_ = refobj(props.store.menu.presence.state);

  return Show({ when: !!children }, [
    DropdownMenuPrimitive.Trigger({ store: props.store }, children),
    DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
      DropdownMenuPrimitive.Content(
        {
          ...props,
          class: computed(presence_state_, (t) => {
            return [
              MENU_CONTENT_CLASS,
              t.enter ? "animate-in fade-in-0 zoom-in-95" : "",
              t.exit ? "animate-out fade-out-0 zoom-out-95" : "",
            ].join(" ");
          }),
        },
        [
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
  const presence_state_ = refobj(
    props.store.menu
      ? props.store.menu.presence.state
      : ({} as PresenceCore["state"]),
  );

  const unlisten = [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
    // props.store.menu.onStateChange((v) => {
    //   state_.as(v);
    // }),
  ];

  return Fragment({}, [
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
    Show({ when: has_submenu_ }, [
      (() => {
        if (!props.store.menu) {
          return null;
        }
        return DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
          DropdownMenuPrimitive.SubMenuContent(
            {
              store: props.store.menu,
              class: computed(presence_state_, (t) => {
                return [
                  MENU_CONTENT_CLASS,
                  t.enter ? "animate-in fade-in-0" : "",
                  t.exit ? "animate-out fade-out-0" : "",
                ].join(" ");
              }),
            },
            [
              For({
                each: computed(menu_state_, (t) => {
                  return t.items;
                }),
                render(item: MenuItemCore) {
                  return DropdownMenuItem({ store: item });
                },
              }),
            ],
          ),
        ]);
      })(),
    ]),
  ]);
}
