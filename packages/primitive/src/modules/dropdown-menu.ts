import { refobj } from "@timeless/reactive";
import {
  DropdownMenuCore,
  MenuCore,
  MenuItemCore,
  MenuGroupCore,
} from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
// import { getHost } from "@/host";

import * as MenuPrimitive from "./menu";
import { ListenerManager } from "@/util/listener";

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
  // const host = getHost();
  const state = getHoverTimer(store);
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function _hoverScheduleHide(store: DropdownMenuCore) {
  // const host = getHost();
  _hoverClearHide(store);

  // Clear all submenu hide timers to ensure they close together
  const clearAllSubTimers = (menu: any) => {
    if (menu.hide_sub_timer) {
      clearTimeout(menu.hide_sub_timer);
      menu.hide_sub_timer = null;
    }
    // Clear timers for all items with submenus
    if (menu.items) {
      for (const item of menu.items) {
        if (item.menu) {
          clearAllSubTimers(item.menu);
        }
      }
    }
  };
  clearAllSubTimers(store.menu);

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
  // const host = getHost();
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager();

  return View(
    {
      onMounted(event) {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        const $elm = event.target;
        const nodes = $elm.getChildren();
        const $ref = nodes.find((n) => n.getType() === "view") || $elm;
        console.log("before set referenece");
        props.store.menu.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $ref.getBoundingClientRect();
            },
          },
          { force: true },
        );
        // Handle click trigger
        if (store.trigger === "click") {
          const handlePointerDown = (e: any) => {
            if (store.disabled) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (store.menu.presence?.state.exit) {
              return;
            }
            if (store.menu.state.open) {
              store.hide();
              return;
            }
            store.show();
          };
          // host.addEventListener($elm, "pointerdown", handlePointerDown);
          // return () => {
          //   host.removeEventListener($elm, "pointerdown", handlePointerDown);
          // };
        }
        // Handle hover trigger
        if (store.trigger === "hover") {
          const handleMouseEnter = () => {
            if (store.disabled) {
              return;
            }
            if (store.menu.presence?.state.exit) {
              return;
            }
            _hoverClearHide(store);
            store.show();
          };

          const handleMouseLeave = () => {
            if (store.disabled) {
              return;
            }
            _hoverScheduleHide(store);
          };

          // Prevent click from closing the menu in hover mode
          const handlePointerDown = (e: any) => {
            e.stopPropagation();
          };

          // host.addEventListener($elm, "mouseenter", handleMouseEnter);
          // host.addEventListener($elm, "mouseleave", handleMouseLeave);
          // host.addEventListener($elm, "pointerdown", handlePointerDown);

          // return () => {
          //   host.removeEventListener($elm, "mouseenter", handleMouseEnter);
          //   host.removeEventListener($elm, "mouseleave", handleMouseLeave);
          //   host.removeEventListener($elm, "pointerdown", handlePointerDown);
          // };
        }
        return listener$.clean;
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
  // Delegate to MenuPrimitive.Portal which uses Presence
  return MenuPrimitive.Portal(props, children);
}

export function Content(
  props: ViewProps & {
    store: DropdownMenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  // Add hover event handlers for hover trigger mode
  const hoverHandlers =
    store.trigger === "hover"
      ? {
          onMouseEnter() {
            _hoverClearHide(store);
          },
          onMouseLeave() {
            _hoverScheduleHide(store);
          },
        }
      : {};

  return MenuPrimitive.Content(
    { ...rest, ...hoverHandlers, store: props.store.menu },
    children,
  );
}

export function Group(
  props: ViewProps & { store?: MenuGroupCore },
  children: ViewChildren,
) {
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
  return MenuPrimitive.Arrow({ store: props.store.menu }, children);
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
  props: ViewProps & {
    store: MenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  // const host = getHost();
  // Get the parent DropdownMenuCore from the menu's parent
  const parentDropdown = (props.store as any).parentDropdown as
    | DropdownMenuCore
    | undefined;

  const mergedHandlers: Record<string, any> = {
    onMouseEnter(event: MouseEvent) {
      // Clear parent menu's hide timer when entering submenu
      if (
        props.store.parent_menu &&
        props.store.parent_menu.hide_sub_timer !== null
      ) {
        clearTimeout(props.store.parent_menu.hide_sub_timer);
        props.store.parent_menu.hide_sub_timer = null;
      }
      if (parentDropdown && parentDropdown.trigger === "hover") {
        _hoverClearHide(parentDropdown);
      }
      if (props.onMouseEnter) {
        props.onMouseEnter(event);
      }
    },
    onMouseLeave(event: MouseEvent) {
      if (parentDropdown && parentDropdown.trigger === "hover") {
        _hoverScheduleHide(parentDropdown);
      }
      if (props.onMouseLeave) {
        props.onMouseLeave(event);
      }
    },
  };

  return MenuPrimitive.Content(
    {
      ...props,
      ...mergedHandlers,
    },
    children,
  );
}
