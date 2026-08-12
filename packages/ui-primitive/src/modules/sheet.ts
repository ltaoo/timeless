import {
  View,
  ViewProps,
  ViewChildren,
  Portal as NativePortal,
} from "../core";
import { DialogCore } from "@timeless/inner-vm";

import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DialogCore },
  children: ViewChildren | (() => ViewChildren) = [],
) {
  const { store, ...rest } = props;

  return NativePortal(
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
  props: ViewProps & { store: DialogCore; zIndex?: number },
  children: ViewChildren = [],
) {
  const { store, zIndex, ...rest } = props;

  return View(
    {
      ...rest,
      style: zIndex != null ? { "z-index": zIndex } : undefined,
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
