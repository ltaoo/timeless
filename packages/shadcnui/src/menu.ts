import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  MenuPrimitive,
  For,
  View,
  Show,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { MenuCore, MenuItemCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";

const MENU_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";

export function Menu(props: ViewProps & { store: MenuCore }) {
  const state_ = refobj(props.store.state);

  // Create a function that returns all parent layers as an array
  const getAllParentLayers = () => {
    const layers: any[] = [];
    let currentMenu = props.store.parent_menu;
    while (currentMenu) {
      if (currentMenu.layer) {
        layers.push(currentMenu.layer);
      }
      currentMenu = currentMenu.parent_menu;
    }
    return layers;
  };

  // Determine if this is a root layer (no parent menu)
  const isRootLayer = !props.store.parent_menu;

  let handlePointerDown: any;

  return View(
    {
      class: MENU_CONTENT_CLASS,
      onMounted($el) {
        // For root menu that's always visible, override layer.onDismiss to only close submenus
        if (isRootLayer && props.store.layer) {
          // Remove the default onDismiss handler that calls hide()
          // and add a custom one that only closes submenus
          props.store.layer.onDismiss(() => {
            console.log(
              "[Menu layer.onDismiss] closing submenus for always-visible root menu",
            );
            // Close current submenu if open
            if (
              props.store.cur_item &&
              props.store.cur_item.menu &&
              props.store.cur_item.menu.state.open
            ) {
              props.store.cur_item.menu.hide();
            }
          });
        }

        // Register click outside handler for root menu
        if (props.store.layer) {
          // Only register document listener for root layer
          if (isRootLayer) {
            handlePointerDown = () => {
              console.log(
                "[Menu] handlePointerDownOnTop called on ROOT, store:",
                props.store._name,
              );
              props.store.layer.handlePointerDownOnTop();
            };
            document.addEventListener("pointerdown", handlePointerDown);
            console.log(
              "[Menu] registered document listener for ROOT, store:",
              props.store._name,
            );
          }

          $el.addEventListener("pointerdown", (e) => {
            console.log(
              "[Menu] element pointerdown, store:",
              props.store._name,
              "isRoot:",
              isRootLayer,
              "target:",
              e.target,
            );
            props.store.layer.pointerDown();
            // Mark all parent layers as pointer inside
            const parentLayers = getAllParentLayers();
            console.log(
              "[Menu] marking parent layers, count:",
              parentLayers.length,
            );
            for (const parentLayer of parentLayers) {
              if (parentLayer) {
                console.log("[Menu] marking parent layer");
                parentLayer.pointerDown();
              }
            }
          });
        } else {
          console.warn(
            "[Menu onMounted] NO LAYER for store:",
            props.store._name,
          );
        }
        if (props.onMounted) {
          props.onMounted($el);
        }
      },
      onUnmounted() {
        if (props.store.layer && handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
          handlePointerDown = null;
        }
        if (props.onUnmounted) {
          props.onUnmounted();
        }
      },
    },
    [
      For({
        each: computed(state_, (t) => {
          console.log(
            "[Menu For] items count:",
            t.items.length,
            t.items.map((i) => i.label),
          );
          return t.items;
        }),
        render(item: MenuItemCore) {
          return MenuItem({ store: item });
        },
      }),
    ],
  );
}

function MenuItem(props: ViewProps & { store: MenuItemCore }) {
  const state_ = refobj(props.store.state);
  const has_submenu_ = ref(!!props.store.menu);
  const has_icon_ = computed(state_, (t) => !!t.icon);
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as MenuCore["state"]),
  );

  console.log(
    "[MenuItem] created, label:",
    props.store.label,
    "has submenu:",
    !!props.store.menu,
  );
  if (props.store.menu) {
    console.log(
      "[MenuItem] submenu parent_menu:",
      props.store.menu.parent_menu?._name,
      "has layer:",
      !!props.store.menu.layer,
    );
  }

  const unlisten = [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
  ];

  return View({ class: "t-menu-item-wrap" }, [
    MenuPrimitive.Item(
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
            [props.store.icon],
          ),
        ]),
        props.store.label,
        Show({ when: has_submenu_ }, [
          ChevronRightOutlined({ class: "w-4 h-4" }),
        ]),
      ],
    ),
    (() => {
      console.log("MenuItem render submenu for", props.store.label);
      const inner$ = props.store.menu
        ? MenuPrimitive.Portal({ store: props.store.menu }, [
            MenuPrimitive.SubMenuContent(
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
                      return MenuItem({ store: item });
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
