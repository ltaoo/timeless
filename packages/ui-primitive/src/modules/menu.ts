import { refobj, computed } from "@timeless/timeless";
import { Logger } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Portal as NativePortal,
  Show,
  ListenerManager,
  createContext,
  provide,
  use,
  Scope,
} from "@timeless/timeless";
import { MenuCore, MenuItemCore, MenuGroupCore } from "@timeless/ui-vm";

import { Arrow as NativeArrow } from "./arrow";
import * as PopperPrimitive from "./popper";

const logger = Logger({ prefix: "primitive", scope: "menu.ts" });

const MenuCtx = createContext<MenuCore>("Menu");

export { MenuCtx };

export function Root(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren,
) {
  return Scope(
    () => provide(MenuCtx, props.store),
    () => [
      PopperPrimitive.Root(
        { ...props, store: props.store.popper },
        children,
      ),
    ],
  );
}

export function Anchor(
  props: ViewProps & { store?: MenuCore },
  children: ViewChildren = [],
) {
  const store = props.store ?? use(MenuCtx);
  return PopperPrimitive.Anchor(
    { ...props, store: store.popper },
    children,
  );
}

export function Portal(
  props: ViewProps & {
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store?: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const store = props.store ?? use(MenuCtx);
  return ContentNonModal({ ...props, store }, children);
}

export function ContentNonModal(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  return ContentImpl(props, children);
}

export function ContentImpl(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { animation, ...rest } = props;

  let _was_exiting = false;
  const state_ = refobj(props.store.state);
  const presence_ = refobj(props.store.presence.state);
  const listener$ = ListenerManager([state_, presence_]);

  return Show({
    when: computed(presence_, (t) => {
      return t.mounted;
    }),
    onMounted() {
      listener$.append([
        props.store.onStateChange((v) => {
          state_.as(v);
        }),
        props.store.presence.onStateChange((v) => {
          console.log(
            "[Menu Content] presence change",
            v.mounted,
            presence_.value.mounted,
          );
          presence_.as(v);
        }),
      ]);
      // return listener$.destroy;
    },
    ok() {
      // logger.log("Content mounted");
      return [
        NativePortal({}, [
          PopperPrimitive.Content(
            {
              store: props.store.popper,
              onDismiss() {
                props.store.hide();
              },
              onReferenceOutOfView() {
                props.store.hide();
              },
              onMouseEnter(event) {
                // 清除父菜单的定时器，防止从菜单项移动到子菜单时子菜单被关闭
                if (
                  props.store.parent_menu &&
                  props.store.parent_menu.hide_sub_timer !== null
                ) {
                  clearTimeout(props.store.parent_menu.hide_sub_timer);
                  props.store.parent_menu.hide_sub_timer = null;
                }
                if (rest.onMouseEnter) {
                  rest.onMouseEnter(event);
                }
              },
              onMouseLeave(event) {
                props.store.handleLeave();
                if (rest.onMouseLeave) {
                  rest.onMouseLeave(event);
                }
              },
            },
            [
              View(
                {
                  class: computed(presence_, (t) => {
                    if (t.exit) {
                      _was_exiting = true;
                    }
                    // Keep exit animation class during unmount to prevent flash
                    // When exit=false but mounted=false, the animation class would become ""
                    // causing the element to snap to full opacity before DOM removal
                    if (!t.mounted && _was_exiting) {
                      _was_exiting = false;
                      return animation?.out || "";
                    }
                    if (t.mounted) {
                      _was_exiting = false;
                    }
                    return [
                      t.enter && animation?.in ? animation.in : "",
                      t.exit && animation?.out ? animation.out : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }),
                  onAnimationEnd(e: AnimationEvent) {
                    if (e.target === e.currentTarget) {
                      props.store.presence.handleAnimationEnd();
                    }
                    if (rest.onAnimationEnd) {
                      rest.onAnimationEnd(e);
                    }
                  },
                },
                children,
              ),
            ],
          ),
        ]),
      ];
    },
  });
}

export function Group(
  props: ViewProps & { store?: MenuGroupCore },
  children: ViewChildren,
) {
  return View(props, children);
}
export function GroupLabel(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}
export function Label(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Item(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  return ItemImpl(props, children);
}

export function ItemImpl(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  // const host = getHost();
  const { store, ...rest } = props;
  const state_ = refobj(props.store.state);

  return View(
    {
      ...rest,
      class: props.class,
      attributes: {
        ...(rest.attributes || {}),
        "tab-index": computed(state_, (t) => {
          return t.disabled ? undefined : -1;
        }),
      },
      onMounted(event) {
        logger.log(
          "[ItemImpl] onMounted",
          props.store.label,
          !!props.store.menu,
        );
        props.store.onStateChange((v) => {
          // console.log("[ItemImpl] handle store.onStateChange", v.focused);
          state_.as(v);
        });
        const $el = event.target;
        // console.log("[ItemImpl] mounted", props.store.label);
        if (props.store.menu) {
          props.store.menu.popper.setReference({
            $el,
            getRect() {
              return $el.getBoundingClientRect();
            },
          });
        }
        props.store.onFocus(() => {
          // @ts-ignore
          $el.focus();
        });
        props.store.onBlur(() => {
          // @ts-ignore
          $el.blur();
        });
        if (rest.onMounted) {
          return rest.onMounted(event);
        }
      },
      onUnmounted() {
        logger.log("[ItemImpl] unmounted", props.store.label);
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
      onClick() {
        props.store.handleClick();
      },
      onFocus() {
        props.store.handleFocus();
      },
      onBlur() {
        props.store.handleBlur();
      },
      onMouseEnter() {
        props.store.handlePointerEnter();
      },
      onMouseLeave() {
        props.store.handlePointerLeave();
      },
    },
    children,
  );
}

export function Separator(props: ViewProps) {
  return View(props);
}
export function Arrow(
  props: ViewProps & { store?: MenuCore },
  children: ViewChildren,
) {
  const store = props.store ?? use(MenuCtx);
  return NativeArrow(
    {
      ...props,
      store: store.popper,
    },
    children,
  );
}

export function SubMenu(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren,
) {
  return PopperPrimitive.Content(
    { ...props, store: props.store.popper },
    children,
  );
}

export function SubMenuTrigger(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  return Anchor(
    {
      class: "menu-item-with-sub-menu",
      store: props.store.menu!,
      onMounted(event) {
        console.log(
          "[primitive]menu.ts/SubMenuTrigger mounted",
          props.store.label,
        );
        if (props.store.menu) {
          const $el = event.target;
          props.store.menu.popper.setReference({
            getRect() {
              return $el.getBoundingClientRect();
            },
          });
        }
        if (props.onMounted) {
          return props.onMounted(event);
        }
      },
      onUnmounted() {
        if (props.store.menu) {
          props.store.menu.popper.removeReference();
        }
        if (props.onUnmounted) {
          props.onUnmounted();
        }
      },
    },
    [ItemImpl({ store: props.store }, children)],
  );
}

export function SubMenuContent(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  return Scope(
    () => provide(MenuCtx, store),
    () => [
      ContentImpl(
        {
          ...rest,
          store,
          onMouseEnter() {
            // 清除父菜单的定时器，防止从菜单项移动到子菜单时子菜单被关闭
            if (
              store.parent_menu &&
              store.parent_menu.hide_sub_timer !== null
            ) {
              clearTimeout(store.parent_menu.hide_sub_timer);
              store.parent_menu.hide_sub_timer = null;
            }
          },
        },
        children,
      ),
    ],
  );
}
