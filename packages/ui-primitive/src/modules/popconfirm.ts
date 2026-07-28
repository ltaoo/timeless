import { refobj } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Button,
  ButtonProps,
  Portal as NativePortal,
} from "@timeless/timeless";
import { PopconfirmCore } from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export function Root(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}

export function Content(
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return View(
    {
      onMounted(event) {
        const $e = event.target;
        const nodes = $e.getChildren();
        const $ref = nodes.find((n) => n && n.getType() === "view") || $e;
        props.store.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $e.getBoundingClientRect();
            },
          },
          { force: true },
        );

        const handlePointerDown = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          props.store.toggle();
        };
        $e.addEventListener("pointerdown", handlePointerDown);
        return () => {
          $e.removeEventListener("pointerdown", handlePointerDown);
        };
      },
    },
    children,
  );
}

export function Portal(
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  const state = refobj(props.store.state);
  const events: any[] = [];
  events.push(
    props.store.onStateChange(() => {
      state.as(props.store.state);
    }),
  );

  return NativePortal(
    {
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") {
            fn();
          }
        }
      },
    },
    [
      Presence({ store: props.store.presence }, [
        PopperPrimitive.Content(
          {
            store: props.store.popper,
            onDismiss() {
              props.store.hide();
            },
            onReferenceOutOfView() {
              props.store.hide();
            },
          },
          children,
        ),
      ]),
    ],
  );
}

export function Confirm(
  props: ButtonProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return Button(
    {
      ...props,
      onClick() {
        props.store.confirm();
      },
    },
    children,
  );
}

export function Cancel(
  props: ButtonProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return Button(
    {
      ...props,
      onClick() {
        props.store.cancel();
      },
    },
    children,
  );
}

export function Close(
  props: ButtonProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return Button(
    {
      ...props,
      onClick() {
        props.store.hide();
      },
    },
    children,
  );
}
