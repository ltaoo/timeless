import { refobj, computed, combine } from "@timeless/reactive";
import { MenuCore, MenuItemCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Show } from "./show";
import { Portal as NativePortal } from "./portal";
import { Arrow as NativeArrow } from "./arrow";
import * as PopperPrimitive from "./popper";
import { h } from "./h";

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
    {
      ...props,
      store: props.store.popper,
      onMounted($el) {
        // console.log("[Menu Anchor] mounted");
        if (props.onMounted) {
          props.onMounted($el);
        }
      },
      onUnmounted() {
        // console.log("[Menu Anchor] unmounted");
        if (props.onUnmounted) {
          props.onUnmounted();
        }
      },
    },
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

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  props.store.presence.onStateChange((v) => {
    console.log(v.mounted, v.enter, v.exit);
    presence_.as(v);
  });

  return h(
    Show,
    {
      when: computed(presence_, (t) => {
        return t.mounted;
      }),
    },
    [
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
                return [
                  t.enter && animation?.in ? animation.in : "",
                  t.exit && animation?.out ? animation.out : "",
                ]
                  .filter(Boolean)
                  .join(" ");
              }),
            },
            children,
          ),
        ],
      ),
    ],
  );
}

export function Group(props: ViewProps, children: ViewChildren) {
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
      "tab-index": computed(state_, (t) => {
        return t.disabled ? undefined : -1;
      }),
      onMounted($el: HTMLDivElement) {
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
          $el.focus();
        });
        props.store.onBlur(() => {
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
  return PopperPrimitive.Root(
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
      onMounted($el: HTMLDivElement) {
        if (!props.store.menu) {
          return;
        }
        props.store.menu.popper.setReference({
          getRect() {
            const rect = $el.getBoundingClientRect();
            return rect;
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
      onMounted($el) {
        console.log("[SubMenuContent] mounted");
        // Add hover event listeners to keep submenu open
        $el.addEventListener("mouseenter", () => {
          console.log("[SubMenuContent] mouseenter");
          if (props.store.hide_sub_timer) {
            clearTimeout(props.store.hide_sub_timer);
            props.store.hide_sub_timer = null;
          }
          // 清除父菜单的定时器
          if (
            props.store.parent_menu &&
            props.store.parent_menu.hide_sub_timer
          ) {
            clearTimeout(props.store.parent_menu.hide_sub_timer);
            props.store.parent_menu.hide_sub_timer = null;
          }
        });
        $el.addEventListener("mouseleave", () => {
          console.log("[SubMenuContent] mouseleave");
          props.store.hide_sub_timer = setTimeout(() => {
            props.store.hide_sub_timer = null;
            props.store.hide();
          }, 200);
        });
        if (props.onMounted) {
          props.onMounted($el);
        }
      },
    },
    children,
  );
}
