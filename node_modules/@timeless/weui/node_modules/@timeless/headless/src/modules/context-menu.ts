import { refobj } from "@timeless/reactive";
import {
  ContextMenuCore,
  MenuCore,
  MenuItemCore,
  MenuGroupCore,
} from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";
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
  const state = getHoverTimer(store);
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function _hoverScheduleHide(store: ContextMenuCore) {
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

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      onMounted($elm: HTMLDivElement) {
        // Don't set reference here - it will be set dynamically on contextmenu event
        const $ref = $elm.firstElementChild || $elm;
        // Handle context menu (right-click)
        $elm.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          if (store.disabled) {
            return;
          }
          store.show({
            x: e.clientX,
            y: e.clientY - 4,
          });
        });

        // Handle hover trigger if enabled
        if (store.trigger === "hover") {
          $elm.addEventListener("mouseenter", () => {
            if (store.disabled) return;
            _hoverClearHide(store);
            store.show();
          });

          // Prevent click from closing the menu in hover mode
          $elm.addEventListener("pointerdown", (e: any) => {
            e.preventDefault();
            e.stopPropagation();
          });
        }
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
  return MenuPrimitive.Separator(props, children);
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
