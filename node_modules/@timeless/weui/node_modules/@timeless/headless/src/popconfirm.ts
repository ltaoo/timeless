import { refobj } from "@timeless/reactive";
import { PopconfirmCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Fragment } from "./fragment";
import { Portal as NativePortal } from "./portal";
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
      onMounted($e: HTMLDivElement) {
        const $ref = $e.firstElementChild || $e;
        props.store.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $ref.getBoundingClientRect();
            },
          },
          { force: true },
        );

        $e.addEventListener("pointerdown", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          props.store.toggle();
        });
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
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return View(
    {
      ...props,
      as: "button",
      onClick() {
        props.store.confirm();
      },
    },
    children,
  );
}

export function Cancel(
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return View(
    {
      ...props,
      as: "button",
      onClick() {
        props.store.cancel();
      },
    },
    children,
  );
}

export function Close(
  props: ViewProps & { store: PopconfirmCore },
  children?: ViewChildren,
) {
  return View(
    {
      ...props,
      as: "button",
      onClick() {
        props.store.hide();
      },
    },
    children,
  );
}
