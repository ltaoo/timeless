import { ref, computed, refobj, classNames } from "@timeless/reactive";
import {
  MenuPrimitive,
  For,
  View,
  Show,
  ViewProps,
  TimelessElement,
} from "@timeless/headless";
import {
  MenuCore,
  MenuItemCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";

const MENU_ITEM_CLASS =
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";

let menuIdCounter = 0;

export function Menu(props: ViewProps & { store: MenuCore }) {
  const state_ = refobj(props.store.state);
  let $element: HTMLElement | null = null;
  let layerId: string | null = null;

  initGlobalPointerListener();

  return View(
    {
      class: MENU_CONTENT_CLASS,
      onMounted($el: HTMLDivElement) {
        $element = $el;

        // Register to LayerManager
        layerId = `menu-${++menuIdCounter}`;
        const layerManager = getGlobalLayerManager();

        const layer: Layer = {
          id: layerId,
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
            // For always-visible root menu, only close submenus
            if (
              props.store.cur_item &&
              props.store.cur_item.menu &&
              props.store.cur_item.menu.state.open
            ) {
              props.store.cur_item.menu.hide();
            }
          },
        };

        layerManager.register(layer);

        if (props.onMounted) {
          props.onMounted($el);
        }
      },
      onUnmounted() {
        $element = null;

        if (layerId) {
          const layerManager = getGlobalLayerManager();
          layerManager.unregister(layerId);
          layerId = null;
        }

        if (props.onUnmounted) {
          props.onUnmounted();
        }
      },
    },
    [
      For({
        each: computed(state_, (t) => t.items),
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

  props.store.onStateChange((v) => {
    state_.as(v);
  });

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
            [props.store.icon as TimelessElement],
          ),
        ]),
        props.store.label,
        Show({ when: has_submenu_ }, [
          ChevronRightOutlined({ class: "w-4 h-4" }),
        ]),
      ],
    ),
    (() => {
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
                    each: computed(menu_state_, (t) => t.items),
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
