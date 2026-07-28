import {
  View,
  ViewProps,
  ViewChildren,
  // Icon as NativeIcon,
} from "@timeless/timeless";
import { ToastCore } from "@timeless/inner-vm";

// import { Presence } from "./presence";

// const sonner = SonnerCore.getInstance();

export function Root(
  props: ViewProps & { store: ToastCore },
  children?: ViewChildren,
) {
  const { store } = props;

  // return NativePortal(rest, [Presence({ store: store.presence }, children)]);
  return children;
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
  return View(rest, children || [text]);
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
        // store.hide();
      },
    },
    children,
  );
}

// export function toast(message: unknown, data?: ExternalToast) {
//   return sonner.toast(message, data);
// }

// export function success(message: unknown, data?: ExternalToast) {
//   return sonner.success(message, data);
// }

// export function error(message: unknown, data?: ExternalToast) {
//   return sonner.error(message, data);
// }

// export function info(message: unknown, data?: ExternalToast) {
//   return sonner.info(message, data);
// }

// export function warning(message: unknown, data?: ExternalToast) {
//   return sonner.warning(message, data);
// }

// export function loading(message: unknown, data?: ExternalToast) {
//   return sonner.loading(message, data);
// }

// export function dismiss(id?: number | string) {
//   return sonner.dismiss(id);
// }
