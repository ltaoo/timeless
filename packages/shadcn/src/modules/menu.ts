import { ref, computed, refobj, classNames, Icon } from "@timeless/timeless";
import {
  MenuPrimitive,
  For,
  View,
  Show,
  ViewProps,
  TimelessElement,
} from "@timeless/timeless";
import {
  MenuCore,
  MenuItemCore,
  MenuSeparatorCore,
  MenuGroupCore,
  getGlobalLayerManager,
  initGlobalPointerListener,
  Layer,
} from "@timeless/ui";

const MENU_CONTENT_CLASS =
  "cn-menu-target cn-menu-translucent z-50 min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fill-mode-both data-open:fade-in-0 data-open:zoom-in-95";

const MENU_SUB_CONTENT_CLASS =
  "cn-menu-target cn-menu-translucent z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fill-mode-both data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fill-mode-both data-closed:fade-out-0 data-closed:zoom-out-95";

const MENU_ITEM_CLASS =
  "group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!";

let menuIdCounter = 0;

export function Menu(props: ViewProps & { store: MenuCore }) {
  const state_ = refobj(props.store.state);
  let $element: HTMLElement | null = null;
  let layerId: string | null = null;

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  initGlobalPointerListener();

  return View(
    {
      class: MENU_CONTENT_CLASS,
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
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
          props.onMounted(event);
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
        render(item: MenuItemCore | MenuSeparatorCore | MenuGroupCore) {
          if (item instanceof MenuSeparatorCore) {
            return MenuSeparator({});
          }
          if (item instanceof MenuGroupCore) {
            return MenuGroup({ store: item });
          }
          return MenuItem({ store: item as MenuItemCore });
        },
      }),
    ],
  );
}

function MenuSeparator(_props: ViewProps) {
  return MenuPrimitive.Separator({
    class: "-mx-1 my-1 h-px bg-border",
  });
}

function MenuGroup(props: ViewProps & { store: MenuGroupCore }) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (t) => !!t.label);

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  return MenuPrimitive.Group({ store: props.store }, [
    Show({
      when: has_label_,
      ok() {
        return [
          MenuPrimitive.GroupLabel(
            {
              class:
                "px-1.5 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-7",
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
          return MenuSeparator({});
        }
        if (item instanceof MenuGroupCore) {
          return MenuGroup({ store: item });
        }
        return MenuItem({ store: item as MenuItemCore });
      },
    }),
  ]);
}

function MenuItem(props: ViewProps & { store: MenuItemCore }) {
  const state_ = refobj(props.store.state);
  const has_submenu_ = ref(!!props.store.menu);
  const has_icon_ = computed(state_, (t) => !!t.icon);
  const has_shortcut_ = computed(state_, (t) => !!t.shortcut);
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as MenuCore["state"]),
  );

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  if (props.store.menu) {
    props.store.menu.onStateChange((v) => {
      menu_state_.as(v);
    });
  }

  return View({ class: "t-menu-item-wrap" }, [
    MenuPrimitive.Item(
      {
        store: props.store,
        class: classNames([
          computed(state_, (t) => {
            return t.focused ? "bg-accent text-accent-foreground" : "";
          }),
          computed(state_, (t) => {
            return t.disabled
              ? "pointer-events-none opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50"
              : "";
          }),
          MENU_ITEM_CLASS,
        ]),
      },
      [
        Show({
          when: has_icon_,
          ok() {
            return [
              View(
                {
                  class: "flex size-4 shrink-0 items-center justify-center",
                },
                [props.store.icon as TimelessElement],
              ),
            ];
          },
        }),
        props.store.label,
        Show({
          when: has_shortcut_,
          ok() {
            return [
              View(
                {
                  class:
                    "ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
                },
                [computed(state_, (t) => t.shortcut)],
              ),
            ];
          },
        }),
        Show({
          when: has_submenu_,
          ok() {
            return [
              Icon({
                class: "cn-rtl-flip ml-auto size-4",
                name: "chevron-right",
              }),
            ];
          },
        }),
      ],
    ),
    (() => {
      const inner$ = props.store.menu
        ? MenuPrimitive.Portal({ store: props.store.menu }, [
            MenuPrimitive.SubMenuContent(
              {
                store: props.store.menu,
                animation: {
                  in: "animate-in fill-mode-both fade-in-0 zoom-in-95",
                  out: "animate-out fill-mode-both fade-out-0 zoom-out-95",
                },
              },
              [
                View({ class: MENU_SUB_CONTENT_CLASS }, [
                  For({
                    each: computed(menu_state_, (t) => t.items),
                    render(
                      item: MenuItemCore | MenuSeparatorCore | MenuGroupCore,
                    ) {
                      if (item instanceof MenuSeparatorCore) {
                        return MenuSeparator({});
                      }
                      if (item instanceof MenuGroupCore) {
                        return MenuGroup({ store: item });
                      }
                      return MenuItem({ store: item as MenuItemCore });
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
