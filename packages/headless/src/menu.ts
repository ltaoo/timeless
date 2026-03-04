import { ref, refobj, computed, combine } from "@timeless/reactive";
import { MenuCore, MenuItemCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

import { tp, merge } from "./theme";
import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { For } from "./for";
import { Show } from "./show";
import { Portal as NativePortal } from "./portal";
import { Presence } from "./presence";
import * as PopperPrimitive from "./popper";
import { Arrow as NativeArrow } from "./arrow";

export function Root(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.popper,
    },
    children,
  );
}

export function Anchor(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren = [],
) {
  console.log("[Menu Anchor] created");
  return PopperPrimitive.Anchor(
    {
      ...props,
      store: props.store.popper,
      onMounted($el) {
        console.log("[Menu Anchor] mounted");
        if (props.onMounted) {
          props.onMounted($el);
        }
      },
      onUnmounted() {
        console.log("[Menu Anchor] unmounted");
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

  const state = refobj(props.store.state);
  const presenceState = refobj(props.store.presence.state);

  props.store.onStateChange((v) => {
    state.as(v);
  });

  props.store.presence.onStateChange((v) => {
    presenceState.as(v);
  });

  return Show(
    {
      when: combine([state, presenceState], (menuState, pState) => {
        // console.log("[ContentImpl Show when]", {
        //   open: menuState.open,
        //   exit: pState.exit,
        //   result: menuState.open || pState.exit,
        // });
        // Keep mounted when open, or during exit animation
        return menuState.open || pState.exit;
      }),
    },
    [
      PopperPrimitive.Content(
        {
          store: props.store.popper,
          layer: props.store.layer,
          getAllParentLayers,
          isRootLayer,
          onReferenceOutOfView() {
            // Close the menu when reference is out of viewport
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
              class: computed(presenceState, (t) => {
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
      onMounted($el) {
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
      onMounted($el) {
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
