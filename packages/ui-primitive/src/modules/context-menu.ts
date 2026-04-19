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

export function Root(
  props: ViewProps & { store: MenuCore },
  children?: ViewChildren,
) {
  return MenuPrimitive.Root(props, children ?? []);
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

        return listener$.destroy;
      },
    },
    children,
  );
}

export function Portal(props: ViewProps & {}, children: ViewChildren = []) {
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
  return MenuPrimitive.Content(props, children);
}
