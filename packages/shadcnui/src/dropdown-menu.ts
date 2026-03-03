import { computed, refobj } from "@timeless/reactive";
import {
  DropdownMenuPrimitive,
  For,
  Show,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { DropdownMenuCore, MenuItemCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";

const MENU_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-50";

export function DropdownMenu(
  props: ViewProps & { store: DropdownMenuCore },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);
  const presence_state_ = refobj(props.store.menu.presence.state);

  return Show(
    {
      when: !!children,
    },
    [
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
                return t.items;
              }),
              render(item: MenuItemCore, idx) {
                if (!item.menu) {
                  return DropdownMenuPrimitive.Item(
                    {
                      store: item,
                      class: MENU_ITEM_CLASS,
                    },
                    [item.label],
                  );
                }
                return ItemWithSubMenu({ store: item });
              },
            }),
          ],
        ),
      ]),
    ],
  );
}

function ItemWithSubMenu(props: ViewProps & { store: MenuItemCore }) {
  const item_state_ = refobj(props.store.state);
  const menu_state_ = refobj(
    props.store.menu
      ? props.store.menu.state
      : ({ items: [] } as {
          enter?: string;
          exit?: string;
          items: MenuItemCore[];
        }),
  );
  const presence_state_ = refobj(
    props.store.menu
      ? props.store.menu.presence
      : ({} as {
          enter?: string;
          exit?: string;
        }),
  );

  props.store.onStateChange(() => {
    item_state_.as(props.store.state);
  });
  if (props.store.menu) {
    props.store.menu.onStateChange(() => {
      menu_state_.as(props.store.menu.state);
    });
  }

  return DropdownMenuPrimitive.SubMenu({ store: props.store.menu }, [
    DropdownMenuPrimitive.SubMenuTrigger(
      {
        store: props.store,
        class: MENU_ITEM_CLASS,
      },
      [
        computed(item_state_, (t) => {
          return t.label;
        }),
        View(
          { class: "ml-auto pl-2 text-xs text-gray-400 dark:text-gray-500" },
          [ChevronRightOutlined({ class: "w-4 h-4" })],
        ),
      ],
    ),
    DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
      DropdownMenuPrimitive.SubMenuContent({ store: props.store.menu }, [
        View(
          {
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
              render(item: MenuItemCore, idx) {
                if (!item.menu) {
                  return DropdownMenuPrimitive.Item(
                    {
                      store: item,
                      class: MENU_ITEM_CLASS,
                    },
                    [item.label],
                  );
                }
                return ItemWithSubMenu({ store: item });
              },
            }),
          ],
        ),
      ]),
    ]),
  ]);
}
