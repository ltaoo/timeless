import { Fragment, refobj } from "../core";
import {
  ViewProps,
  ViewChildren,
  ListenerManager,
  VNodeEvent,
} from "../core";
import {
  DropdownMenuCore,
  MenuCore,
  MenuItemCore,
  MenuGroupCore,
} from "@timeless/inner-vm";

import * as MenuPrimitive from "./menu";

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
  const listener$ = ListenerManager([state_]);

  return Fragment(
    {
      onMounted(event) {
        // console.log("before set referenece");
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        const $elm = event.target;
        const nodes = $elm.get$children();
        const $ref = nodes[0] || $elm;
        // console.log("[DropdownMenu]find child $elm", nodes, $ref);
        // console.log(
        //   "[primitive]dropdownmenu - Trigger mounted",
        //   nodes,
        //   $ref.getBoundingClientRect(),
        // );
        setTimeout(() => {
          props.store.setReference(
            {
              $el: $ref,
              getRect() {
                return $ref.getBoundingClientRect();
              },
            },
            { force: true },
          );
        }, 0);
        // Handle click trigger
        if (store.trigger === "click") {
          const handlePointerDown = (e: any) => {
            // console.log("handle pointer down");
            e.preventDefault();
            e.stopPropagation();
            store.handleClickTrigger(e);
          };
          listener$.add(
            $ref.addEventListener("pointerdown", handlePointerDown),
          );
        }
        // Handle hover trigger
        if (store.trigger === "hover") {
          const handleMouseEnter = () => {
            store.handleEnterTrigger();
          };

          const handleMouseLeave = () => {
            store.handleLeaveTrigger();
          };

          // Prevent click from closing the menu in hover mode
          const handlePointerDown = (e: VNodeEvent) => {
            e.stopPropagation();
          };
          listener$.append([
            $ref.addEventListener("mouseenter", handleMouseEnter),
            $ref.addEventListener("mouseleave", handleMouseLeave),
            $ref.addEventListener("pointerdown", handlePointerDown),
          ]);
        }
        if (props.onMounted) {
          listener$.add(props.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    children,
  );
}

export function Portal(
  props: ViewProps & {
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
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

  return MenuPrimitive.Content({ ...rest, store: props.store.menu }, children);
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

export function Separator(props: ViewProps) {
  return MenuPrimitive.Separator(props);
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
  return MenuPrimitive.Content(props, children);
}
