import { computed } from "@timeless/reactive";
import { ToastCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "./view";
import { Txt } from "./text";
import { Portal } from "./portal";
import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Portal(rest, [Presence({ store: store.presence }, children)]);
}

export function Mask(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Viewport(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Item(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Icon(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Text(
  props: ViewProps & { store: ToastCore; text: string },
  children?: ViewChildren,
) {
  const { store, text, ...rest } = props;
  return View(rest, children || [Txt(text)]);
}

export function Close(
  props: ViewProps & { store: ToastCore },
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
    children || [Txt("✕")],
  );
}
