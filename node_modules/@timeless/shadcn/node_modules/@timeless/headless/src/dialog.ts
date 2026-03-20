import { computed } from "@timeless/reactive";
import { DialogCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Portal } from "./portal";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
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
  children?: ViewChildren,
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
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Header(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Title(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Body(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Footer(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Close(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
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

export function Cancel(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.cancel();
        store.hide();
      },
    },
    children || ["取消"],
  );
}

export function OK(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.ok();
      },
    },
    children || ["确认"],
  );
}
