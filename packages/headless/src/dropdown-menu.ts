import { refobj } from "@timeless/reactive";
import { DropdownMenuCore, MenuCore, MenuItemCore } from "@timeless/ui";

import * as MenuPrimitive from "./menu";
import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import * as PopperPrimitive from "./popper";

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
  }, 300);
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

  const layer = props.store.menu.layer;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      onMounted($e) {
        // if (rest.onMounted) {
        //   rest.onMounted($e);
        // }
        const $ref = $e.firstElementChild || $e;
        props.store.menu.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $ref.getBoundingClientRect();
            },
          },
          { force: true },
        );
        // console.log("[]has layer?", !!layer, $ref);

        // Handle click trigger
        if (store.trigger === "click") {
          if (layer) {
            $e.addEventListener("pointerdown", () => {
              layer.pointerDown();
              const rect = $e.getBoundingClientRect();
              console.log("[]click button in pointerdown callback", rect);
              props.store.toggle();
            });
          } else {
            $e.addEventListener("pointerdown", () => {
              const rect = $e.getBoundingClientRect();
              props.store.toggle({
                x: rect.left,
                y: rect.bottom + 4,
                width: rect.width,
                height: rect.height,
              });
            });
          }
        }

        // Handle hover trigger
        if (store.trigger === "hover") {
          $e.addEventListener("mouseenter", () => {
            if (store.disabled) return;
            _hoverClearHide(store);
            store.show();
          });

          $e.addEventListener("mouseleave", () => {
            if (store.disabled) return;
            _hoverScheduleHide(store);
          });

          // Prevent click from closing the menu in hover mode
          $e.addEventListener("pointerdown", (e: any) => {
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
  return MenuPrimitive.Portal({ store: props.store }, children);
}

export function Content(
  props: ViewProps & { store: DropdownMenuCore },
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
  // Get the parent DropdownMenuCore from the menu's parent
  const parentDropdown = (props.store as any).parentDropdown as
    | DropdownMenuCore
    | undefined;

  const hoverHandlers =
    parentDropdown && parentDropdown.trigger === "hover"
      ? {
          onMouseEnter() {
            console.log("[DropdownMenu SubMenuContent] mouseenter");
            // Cancel parent dropdown hide timer when entering submenu
            _hoverClearHide(parentDropdown);
          },
          onMouseLeave() {
            console.log("[DropdownMenu SubMenuContent] mouseleave");
            // Schedule parent dropdown hide when leaving submenu
            _hoverScheduleHide(parentDropdown);
          },
        }
      : {};

  return MenuPrimitive.SubMenuContent(
    {
      ...props,
      ...hoverHandlers,
    },
    children,
  );
}
