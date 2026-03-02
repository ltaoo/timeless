import { ref, refobj, refarr, computed, uncomputed } from "@timeless/reactive";
import { DropdownMenuCore, MenuCore, MenuItemCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

import { For } from "./for";
import { merge, tp } from "./theme";
import { Show } from "./show";
import * as MenuPrimitive from "./menu";
import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { Portal as NativePortal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";

// Shared hover timer state to coordinate between Trigger and Content
const hoverTimers = new WeakMap<DropdownMenuCore, { timer: any }>();

function getHoverTimer(store: DropdownMenuCore) {
  let state = hoverTimers.get(store);
  if (!state) {
    state = { timer: null };
    hoverTimers.set(store, state);
  }
  return state;
}

function _hoverClearHide(store: DropdownMenuCore) {
  const state = getHoverTimer(store);
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function _hoverScheduleHide(store: DropdownMenuCore) {
  _hoverClearHide(store);
  const state = getHoverTimer(store);
  state.timer = setTimeout(() => {
    store.hide();
    state.timer = null;
  }, 100);
}

export function Root(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  return MenuPrimitive.Root(props, children);
}

export function Trigger(
  props: ViewProps & { store: DropdownMenuCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  let handlePointerDownOnTop: any;
  let triggerElement: HTMLElement | null = null;

  return MenuPrimitive.Anchor(
    {
      store: props.store.menu,
    },
    [
      View(
        {
          type: "button",
          onMounted($e) {
            if (rest.onMounted) {
              rest.onMounted($e);
            }
            triggerElement = $e;

            // Add global pointerdown listener
            handlePointerDownOnTop = (e: any) => {
              // Only handle when menu is open
              if (!store.menu.state.open) {
                return;
              }

              const target = e.target as Node;
              const path = e.composedPath ? e.composedPath() : [];

              // Check if click is inside trigger
              const isInsideTrigger =
                (triggerElement && triggerElement.contains(target)) ||
                (triggerElement && path.includes(triggerElement));

              if (isInsideTrigger) {
                // Click on trigger - don't dismiss
                return;
              }

              // Check if click is inside content
              const popperFloating = store.menu.popper.floating?.$el as
                | HTMLElement
                | undefined;
              const isInsideContent =
                (popperFloating && popperFloating.contains(target)) ||
                (popperFloating && path.includes(popperFloating));

              if (isInsideContent) {
                // Click inside content - don't dismiss
                return;
              }

              // Click outside - dismiss
              props.store.hide();
            };
            document.addEventListener(
              "pointerdown",
              handlePointerDownOnTop,
              true,
            );
          },
          onUnmounted() {
            triggerElement = null;

            if (handlePointerDownOnTop) {
              document.removeEventListener(
                "pointerdown",
                handlePointerDownOnTop,
                true,
              );
              handlePointerDownOnTop = null;
            }

            if (rest.onUnmounted) {
              rest.onUnmounted();
            }
          },
          onClick() {
            // Force unmount presence before opening to ensure clean state
            if (!props.store.menu.state.open) {
              props.store.menu.presence.unmount();
            }
            props.store.toggle();
          },
          onKeyDown(event: KeyboardEvent) {
            if (store.state.disabled) {
              return;
            }
            if (["Enter", " "].includes(event.key)) {
              props.store.toggle();
              return;
            }
            if (event.key === "ArrowDown") {
              // context.onOpenChange(true)
            }
            // prevent keydown from scrolling window / first focused item to execute
            // that keydown (inadvertently closing the menu)
            if (["Enter", " ", "ArrowDown"].includes(event.key)) {
              event.preventDefault();
            }
          },
        },
        children,
      ),
    ],
  );
}

export function Portal(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  // const { store, ...rest } = props;
  // const state = refobj(store.state);
  // const events: (void | (() => void))[] = [];
  // events.push(
  //   store.onStateChange(() => {
  //     state.as(store.state);
  //   }),
  // );

  // return NativePortal(
  //   {
  //     ...rest,
  //     onUnmounted() {
  //       for (const fn of events) if (typeof fn === "function") fn();
  //       if (rest.onUnmounted) rest.onUnmounted();
  //     },
  //   },
  //   [
  //     Presence({ store: store.menu.presence }, [
  //       Popper({ store: store.menu.popper }, children),
  //     ]),
  //   ],
  // );
  return MenuPrimitive.Portal(
    {
      store: props.store,
    },
    children,
  );
}

export function Content(
  props: ViewProps & { store: DropdownMenuCore },
  children: ViewChildren,
) {
  return Presence({ store: props.store.menu.presence }, [
    Popper(
      {
        store: props.store.menu.popper,
      },
      children,
    ),
  ]);
  // return View({}, [
  //   Presence({ store: props.store.menu.presence }, [
  //     Popper(
  //       {
  //         store: props.store.menu.popper,
  //       },
  //       children,
  //     ),
  //   ]),
  // ]);
}

export function Group(props: ViewProps, children: ViewChildren) {
  return MenuPrimitive.Group(props, children);
}
export function Label(props: ViewProps, children: ViewChildren) {
  return MenuPrimitive.Label(props, children);
}

export function Item(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  return MenuPrimitive.Item(props, children);
}

export function Separator(props: ViewProps, children: ViewChildren) {
  return MenuPrimitive.Separator(props, children);
}

export function Arrow(
  props: ViewProps & {
    store: DropdownMenuCore;
  },
  children: ViewChildren,
) {
  return MenuPrimitive.Arrow(
    {
      store: props.store.menu,
    },
    children,
  );
}

export function SubMenu(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren,
) {
  return MenuPrimitive.SubMenu(props, children);
}
export function SubMenuTrigger(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  return MenuPrimitive.SubMenuTrigger(props, children);
}

export function SubMenuContent(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren,
) {
  return MenuPrimitive.SubMenuContent(props, children);
}

// export function Content(
//   props: ViewProps & { store: DropdownMenuCore; theme: any },
//   children?: ViewChildren,
// ) {
//   const { store, theme: t, class: cls, style: st, ...rest } = props;
//   const state = refobj(store.state);
//   const events: (void | (() => void))[] = [];
//   events.push(
//     store.onStateChange(() => {
//       state.as(store.state);
//     }),
//   );

//   const $menucontent = View(
//     {
//       ...rest,
//       ...merge(tp(t?.menu), cls, st),
//       onUnmounted() {
//         for (const fn of events) if (typeof fn === "function") fn();
//         if (rest.onUnmounted) rest.onUnmounted();
//       },
//     },
//     children,
//   );

//   $menucontent.$elm.addEventListener("pointerdown", (e: Event) => {
//     e.stopPropagation();
//   });
//   if (store.trigger === "hover") {
//     $menucontent.$elm.addEventListener("mouseenter", () => {
//       _hoverClearHide(store);
//     });
//     $menucontent.$elm.addEventListener("mouseleave", () => {
//       _hoverScheduleHide(store);
//     });
//   }

//   return $menucontent;
// }

// export const Group = MenuGroup;
// export const Label = MenuLabel;
// export const Item = MenuItem;
// export const Separator = MenuSeparator;
// export const Arrow = MenuArrow;
// export const Sub = MenuSub;
// export const SubTrigger = MenuSubTrigger;
// export const SubContent = SubMenuContent;

// export function DropdownMenu(
//   props: {
//     store: DropdownMenuCore;
//     theme: any;
//     onMounted?: ($elm: any) => void;
//     onUnmounted?: () => void;
//   },
//   children: ViewChildren,
// ) {
//   const { store, theme, ...rest } = props;
//   const state = refobj(store.state);
//   store.onStateChange(() => {
//     state.as(store.state);
//   });
//   const menuitem$s = computed(state, (d) => d.items);

//   return Root({}, [
//     Trigger({ store, ...rest }, children),
//     Portal({ store }, [
//       Content({ store, theme }, [
//         For({
//           each: menuitem$s,
//           render(item: { label: string; menu?: MenuCore }) {
//             //       console.log("[]DropdownMenu render item", !!item.menu, item.label);
//             const items = ref(item.menu ? item.menu.state.items : []);
//             if (item.menu) {
//               item.menu.onStateChange((v) => {
//                 // console.log("[]items change", v.items);
//                 items.as(v.items);
//               });
//             }
//             return Show(
//               {
//                 when: ref(!!item.menu),
//                 fallback: [
//                   MenuItem({ store: item, theme: theme }, [Txt(item.label)]),
//                 ],
//               },
//               [
//                 MenuItem(
//                   {
//                     store: item,
//                     theme: theme,
//                     onMouseEnter: () => {
//                       const menu = item.menu;
//                       if (menu) {
//                         if (menu.hide_sub_timer) {
//                           clearTimeout(menu.hide_sub_timer);
//                           menu.hide_sub_timer = null;
//                         }
//                       }
//                     },
//                     onMouseLeave: () => {
//                       const menu = item.menu;
//                       if (menu) {
//                         menu.hide_sub_timer = setTimeout(() => {
//                           menu.hide_sub_timer = null;
//                           menu.hide();
//                         }, 200);
//                       }
//                     },
//                   },
//                   [
//                     View({ style: "flex:1;" }, [Txt(item.label)]),
//                     View({ ...merge(tp(theme?.submenuArrow)) }, [
//                       ChevronRightOutlined({}),
//                     ]),
//                     // 这里封装成组件，就不用判断 item.menu 了。因为现在是表达式，表达式肯定会执行 item.menu.presence，导致空指针
//                     item.menu
//                       ? NativePortal({}, [
//                           Presence(
//                             {
//                               store: item.menu.presence,
//                               animation:
//                                 theme?.subAnimation || theme?.animation,
//                             },
//                             [
//                               Popper({ store: item.menu.popper }, [
//                                 listenMenuContent(
//                                   item.menu,
//                                   (() => {
//                                     return View(
//                                       {
//                                         ...merge(tp(theme?.menu)),
//                                       },
//                                       [
//                                         For({
//                                           each: items,
//                                           render(sub) {
//                                             return MenuItemView(sub, theme);
//                                           },
//                                           onUnmounted() {
//                                             uncomputed(items);
//                                           },
//                                         }),
//                                       ],
//                                     );
//                                   })(),
//                                   () => {
//                                     if (store.trigger === "hover") {
//                                       _hoverClearHide(store);
//                                     }
//                                   },
//                                   () => {
//                                     if (store.trigger === "hover") {
//                                       _hoverScheduleHide(store);
//                                     }
//                                   },
//                                 ),
//                               ]),
//                             ],
//                           ),
//                         ])
//                       : null,
//                   ],
//                 ),
//               ],
//             );
//           },
//         }),
//       ]),
//     ]),
//   ]);
// }

function listenMenuContent(
  menu: MenuCore,
  child: TimelessElement,
  onEnter?: () => void,
  onLeave?: () => void,
) {
  const $el = child.$elm;
  $el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  $el.addEventListener("mouseenter", () => {
    if (menu.hide_sub_timer) {
      clearTimeout(menu.hide_sub_timer);
      menu.hide_sub_timer = null;
    }
    menu.popper.handleEnter();
    if (onEnter) {
      onEnter();
    }
  });
  $el.addEventListener("mouseleave", () => {
    menu.popper.handleLeave();
    menu.hide_sub_timer = setTimeout(() => {
      menu.hide_sub_timer = null;
      menu.hide();
    }, 200);
    if (onLeave) {
      onLeave();
    }
  });
  return child;
}
