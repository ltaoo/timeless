import { refobj, computed, combine } from "@timeless/reactive";
import { MenuCore, MenuItemCore, MenuGroupCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Portal as NativePortal } from "@/content/portal";
import { Show } from "@/reactive/show";
// import { getHost } from "@/host";

import { Arrow as NativeArrow } from "./arrow";
import * as PopperPrimitive from "./popper";

export function Root(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    { ...props, store: props.store.popper },
    children,
  );
}

export function Anchor(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren = [],
) {
  // console.log("[Menu Anchor] created");
  return PopperPrimitive.Anchor(
    { ...props, store: props.store.popper },
    children,
  );
}

export function Portal(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  return ContentNonModal(props, children);
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

  const state_ = refobj(props.store.state);
  const presence_ = refobj(props.store.presence.state);
  // Track exit animation to prevent flash when unmounting
  let _was_exiting = false;

  const listeners = [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
    props.store.presence.onStateChange((v) => {
      console.log("[Menu Content] presence change", v.mounted);
      presence_.as(v);
    }),
  ];

  return Show({
    when: computed(presence_, (t) => {
      return t.mounted;
    }),
    ok() {
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
                      // @ts-ignore
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
    onUnmounted() {
      for (let i = 0; i < listeners.length; i += 1) {
        listeners[i]();
      }
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

  // console.log("[ItemImpl] render", props.store.label);
  props.store.onStateChange((v) => {
    // console.log("[ItemImpl] handle store.onStateChange", v.focused);
    state_.as(v);
  });

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
      onUnmounted() {
        console.log("[ItemImpl] unmounted", props.store.label);
      },
    },
    children,
  );
}

export function Separator(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}
export function Arrow(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren,
) {
  return NativeArrow(
    {
      ...props,
      store: props.store.popper,
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
        const $el = (event as any).target as HTMLDivElement;
        if (!props.store.menu) {
          return;
        }
        props.store.menu.popper.setReference({
          getRect() {
            return $el.getBoundingClientRect();
          },
        });
      },
      onUnmounted() {
        if (!props.store.menu) {
          return;
        }
        props.store.menu.popper.removeReference();
      },
    },
    [
      ItemImpl(
        {
          store: props.store,
        },
        children,
      ),
    ],
  );
}

export function SubMenuContent(
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  return ContentImpl(
    {
      ...props,
      store: props.store,
      onMouseEnter() {
        // 清除父菜单的定时器，防止从菜单项移动到子菜单时子菜单被关闭
        if (
          props.store.parent_menu &&
          props.store.parent_menu.hide_sub_timer !== null
        ) {
          clearTimeout(props.store.parent_menu.hide_sub_timer);
          props.store.parent_menu.hide_sub_timer = null;
        }
      },
      onMounted(event) {
        if (props.onMounted) {
          props.onMounted(event);
        }
      },
    },
    children,
  );
}
