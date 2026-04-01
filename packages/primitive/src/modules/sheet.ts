import { DialogCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "@/primitive/view";

import { Portal } from "./portal";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;

  return Portal(
    {
      onUnmounted() {
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [Presence({ store: store.presence || store }, children)],
  );
}

export function Overlay(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        if (store.closeable) {
          store.hide();
        }
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & {
    store: DialogCore;
    side?: "right" | "top" | "bottom" | "left";
  },
  children: ViewChildren = [],
) {
  const { store, side = "right", ...rest } = props;
  return View(rest, children);
}

export function Header(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Title(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Description(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Close(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.hide();
      },
    },
    children,
  );
}
