import {
  ref,
  computed,
  refobj,
  classNames,
  Icon,
  ListenerManager,
} from "@timeless/timeless";
import {
  For,
  Fragment,
  Show,
  View,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "@timeless/timeless";
import { ContextMenuPrimitive } from "@timeless/ui-primitive";
import {
  ContextMenuCore,
  MenuCore,
  MenuItemCore,
  MenuSeparatorCore,
  MenuGroupCore,
} from "@timeless/ui-vm";

const MENU_CONTENT_CLASS =
  "cn-menu-target cn-menu-translucent z-50 min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fill-mode-both data-open:fade-in-0 data-open:zoom-in-95";

const MENU_SUB_CONTENT_CLASS =
  "cn-menu-target cn-menu-translucent z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fill-mode-both data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fill-mode-both data-closed:fade-out-0 data-closed:zoom-out-95";

const MENU_ITEM_CLASS =
  "group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!";

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
          in: "animate-in fill-mode-both fade-in-0 zoom-in-95",
          out: "animate-out fill-mode-both fade-out-0 zoom-out-95",
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
                return ContextMenuSeparator({});
              }
              if (item instanceof MenuGroupCore) {
                return ContextMenuGroup({ store: item });
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
      class: "-mx-1 my-1 h-px bg-border",
    },
    [],
  );
}

function ContextMenuGroup(props: ViewProps & { store: MenuGroupCore }) {
  const state_ = refobj(props.store.state);
  const has_label_ = computed(state_, (t) => !!t.label);

  return ContextMenuPrimitive.Group({ store: props.store }, [
    Show({
      when: has_label_,
      ok() {
        return [
          ContextMenuPrimitive.Label(
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
          return ContextMenuSeparator({});
        }
        if (item instanceof MenuGroupCore) {
          return ContextMenuGroup({ store: item });
        }
        return ContextMenuItem({ store: item as MenuItemCore });
      },
    }),
  ]);
}

function ContextMenuItem(props: ViewProps & { store: MenuItemCore }) {
  const state_ = refobj(props.store.state);
  const show_chevron_ = ref(!!props.store.menu);
  const has_icon_ = computed(state_, (t) => !!t.icon);
  const has_shortcut_ = computed(state_, (t) => !!t.shortcut);
  const menu_state_ = refobj(
    props.store.menu ? props.store.menu.state : ({} as MenuCore["state"]),
  );
  const listener$ = ListenerManager();
  return View(
    {
      class: "t-context-menu-item-wrap",
      onMounted(event) {
        listener$.push(
          props.store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (props.store.menu) {
          listener$.push(
            props.store.menu.onStateChange((v) => {
              menu_state_.as(v);
            }),
          );
        }
        if (props.onMounted) {
          listener$.add(props.onMounted(event));
        }
        return listener$.clean;
      },
    },
    [
      ContextMenuPrimitive.Item(
        {
          store: props.store,
          class: classNames([
            MENU_ITEM_CLASS,
            computed(state_, (t) => {
              return t.focused ? "bg-accent text-accent-foreground" : "";
            }),
            computed(state_, (t) => {
              return t.disabled
                ? "pointer-events-none opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50"
                : "";
            }),
          ]),
        },
        [
          Show({
            when: has_icon_,
            ok() {
              return [
                View(
                  { class: "flex size-4 shrink-0 items-center justify-center" },
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
            when: show_chevron_,
            ok() {
              return [
                Icon({
                  class: "cn-rtl-flip ml-auto size-4",
                  name: "chevron-right",
                  size: 24,
                }),
              ];
            },
          }),
        ],
      ),
      (() => {
        if (!props.store.menu) {
          return View({}, [null]);
        }
        const menu = props.store.menu;
        if (menu.content) {
          const inner$ = ContextMenuPrimitive.SubMenuContent(
            {
              store: menu,
              animation: {
                in: "animate-in fade-in-0 zoom-in-95",
                out: "animate-out fade-out-0 zoom-out-95",
              },
            },
            [
              View({ class: MENU_SUB_CONTENT_CLASS }, [
                menu.content as TimelessElement,
              ]),
            ],
          );
          return View({}, [inner$]);
        }
        const inner$ = ContextMenuPrimitive.SubMenuContent(
          {
            store: menu,
            animation: {
              in: "animate-in fill-mode-both fade-in-0 zoom-in-95",
              out: "animate-out fill-mode-both fade-out-0 zoom-out-95",
            },
          },
          [
            View({ class: MENU_SUB_CONTENT_CLASS }, [
              For({
                each: computed(menu_state_, (t) => {
                  return t.items;
                }),
                render(item: MenuItemCore | MenuSeparatorCore | MenuGroupCore) {
                  if (item instanceof MenuSeparatorCore) {
                    return ContextMenuSeparator({});
                  }
                  if (item instanceof MenuGroupCore) {
                    return ContextMenuGroup({ store: item });
                  }
                  return ContextMenuItem({ store: item as MenuItemCore });
                },
              }),
            ]),
          ],
        );
        return View({}, [inner$]);
      })(),
    ],
  );
}
