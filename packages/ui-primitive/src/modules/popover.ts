import { refobj, computed } from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  Fragment,
  Button,
  ButtonProps,
  Portal as NativePortal,
} from "../core";
import {
  PopoverCore,
  Align,
  Side,
  getGlobalLayerManager,
} from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";
import { Presence } from "./presence";

export type PopoverProps = Partial<{
  align: Align;
  side: Side;
}>;

export function Root(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}

export function Content(
  props: ViewProps & { store: PopoverCore },
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
  props: ViewProps & { store: PopoverCore },
  children?: ViewChildren,
) {
  return Fragment(
    {
      onMounted(event) {
        const $f = event.target;
        const nodes = $f.getChildren();
        const $ref = nodes.find((n) => n && n.getType() === "view") || nodes[0];
        if (!$ref) return;
        props.store.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $ref.getBoundingClientRect();
            },
          },
          { force: true },
        );
        const handlePointerDown = (e: any) => {
          e.preventDefault();
          // 先让 LayerManager 处理，关闭其他已打开的浮动层
          getGlobalLayerManager().handlePointerDown(e.clientX, e.clientY);
          // 阻止冒泡，避免 document 上的监听器重复处理
          e.stopPropagation();
          props.store.toggle();
        };
        $ref.addEventListener("pointerdown", handlePointerDown);
        return () => {
          $ref.removeEventListener("pointerdown", handlePointerDown);
        };
      },
    },
    children,
  );
}

export function Portal(
  props: ViewProps & { store: PopoverCore },
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
            style:
              props.store.destroyOnClose === false
                ? {
                    display: computed(state, (t) =>
                      !t.visible && !t.enter && !t.exit ? "none" : undefined,
                    ),
                  }
                : undefined,
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

export function Close(
  props: ButtonProps & { store: PopoverCore },
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
