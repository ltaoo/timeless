import { refobj } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  ListenerManager,
} from "@timeless/timeless";
import {
  ContextMenuCore,
  MenuCore,
  MenuItemCore,
  MenuGroupCore,
} from "@timeless/ui-vm";

import * as MenuPrimitive from "./menu";

// Shared hover timer state to coordinate between Trigger and Content
const hoverTimers = new WeakMap<ContextMenuCore, { timer: any }>();

function getHoverTimer(store: ContextMenuCore) {
  let state = hoverTimers.get(store);
  if (!state) {
    state = { timer: null };
    hoverTimers.set(store, state);
  }
  return state;
}

function _hoverClearHide(store: ContextMenuCore) {
  // const host = getHost();
  const state = getHoverTimer(store);
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function _hoverScheduleHide(store: ContextMenuCore) {
  // const host = getHost();
  _hoverClearHide(store);
  const state = getHoverTimer(store);
  state.timer = setTimeout(() => {
    store.hide();
    state.timer = null;
  }, 300);
}

export function Root(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  return MenuPrimitive.Root(props, children);
}

export function Trigger(
  props: ViewProps & { store: ContextMenuCore },
  children?: ViewChildren,
) {
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
        // Don't set reference here - it will be set dynamically on contextmenu event
        // Handle context menu (right-click)
        const handleContextMenu = (e: any) => {
          e.preventDefault();
          if (store.disabled) {
            return;
          }
          store.show({
            x: e.clientX,
            y: e.clientY - 4,
          });
        };
        listener$.add($elm.addEventListener("contextmenu", handleContextMenu));

        // Handle hover trigger if enabled
        if (store.trigger === "hover") {
          const handleMouseEnter = () => {
            if (store.disabled) {
              return;
            }
            _hoverClearHide(store);
            store.show();
          };

          // Prevent click from closing the menu in hover mode
          const handlePointerDown = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
          };

          listener$.append([
            $elm.addEventListener("mouseenter", handleMouseEnter),
            $elm.addEventListener("pointerdown", handlePointerDown),
          ]);
        }
        return listener$.clean;
      },
    },
    children,
  );
}

export function Portal(
  props: ViewProps & { store: MenuCore },
  children: ViewChildren = [],
) {
  // Delegate to MenuPrimitive.Portal which uses Presence
  return MenuPrimitive.Portal(props, children);
}

export function Content(
  props: ViewProps & {
    store: ContextMenuCore;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  // Add hover event handlers for hover trigger mode
  const hoverHandlers = {};
  // const hoverHandlers =
  //   store.trigger === "hover"
  //     ? {
  //         onMouseEnter() {
  //           console.log("[ContextMenu Content] mouseenter");
  //           _hoverClearHide(store);
  //         },
  //         onMouseLeave() {
  //           console.log("[ContextMenu Content] mouseleave");
  //           _hoverScheduleHide(store);
  //         },
  //       }
  //     : {};

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
  return MenuPrimitive.Separator(props);
}

export function Arrow(
  props: ViewProps & {
    store: ContextMenuCore;
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
  return MenuPrimitive.Content(
    {
      ...props,
      onMouseEnter(event: MouseEvent) {
        // Clear parent menu's hide timer when entering submenu
        if (
          props.store.parent_menu &&
          props.store.parent_menu.hide_sub_timer !== null
        ) {
          clearTimeout(props.store.parent_menu.hide_sub_timer);
          props.store.parent_menu.hide_sub_timer = null;
        }
        if (props.onMouseEnter) {
          props.onMouseEnter(event);
        }
      },
      onMouseLeave(event: MouseEvent) {
        if (props.onMouseLeave) {
          props.onMouseLeave(event);
        }
      },
    },
    children,
  );
}
