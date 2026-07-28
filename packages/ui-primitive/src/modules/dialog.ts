import {
  View,
  ViewProps,
  ViewChildren,
  Portal as NativePortal,
  ListenerManager,
} from "@timeless/timeless";
import {
  DialogCore,
  DismissableLayerCore,
  initGlobalPointerListener,
} from "@timeless/inner-vm";

import { Presence } from "./presence";

export function Root(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren | (() => ViewChildren),
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
  children?: ViewChildren,
) {
  const { store, zIndex, ...rest } = props;

  return View(
    {
      ...rest,
      style: zIndex != null ? { "z-index": zIndex } : undefined,
    },
    children,
  );
}

export function Content(
  props: ViewProps & { store: DialogCore; zIndex?: number },
  children?: ViewChildren,
) {
  const { store, zIndex, ...rest } = props;
  const listener$ = ListenerManager();
  const dismissableLayer$ = new DismissableLayerCore();

  initGlobalPointerListener();

  return View(
    {
      ...rest,
      style: zIndex != null ? { "z-index": zIndex } : undefined,
      onMounted(event) {
        const $elm = event.target.get$elm();
        dismissableLayer$.setRect(() => $elm.getBoundingClientRect());
        listener$.add(
          dismissableLayer$.onDismiss(() => {
            if (store.closeable) {
              dismissableLayer$.unregister();
              store.hide();
            }
          }),
        );
        dismissableLayer$.register();
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return () => {
          dismissableLayer$.unregister();
          listener$.destroy();
        };
      },
    },
    children,
  );
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
