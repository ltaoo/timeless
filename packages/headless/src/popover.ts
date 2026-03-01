import { ref, refobj, computed, Ref } from "@timeless/reactive";
import { PopoverCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Show } from "./show";
import { Portal as NativePortal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";

export function Root(props: ViewProps, children?: ViewChildren) {
  return View(props, children);
}

export function Content(
  props: ViewProps & { store: PopoverCore },
  children?: ViewChildren,
) {
  const layer = props.store.layer;
  const state = refobj(props.store.state);

  let handlePointerDown: any;

  return View(
    {
      class: props.class,
      style: props.style,
      onMounted($e) {
        props.store.popper.setFloating({
          $el: $e,
          getRect() {
            return $e.getBoundingClientRect();
          },
        });
        if (layer) {
          handlePointerDown = () => {
            layer.handlePointerDownOnTop();
          };
          document.addEventListener("pointerdown", handlePointerDown);
          $e.addEventListener("pointerdown", () => {
            layer.pointerDown();
          });
        }
      },
      onUnmounted() {
        // props.store.popper.setFloating(null);
        if (layer && handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
          handlePointerDown = null;
        }
      },
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: PopoverCore },
  children?: ViewChildren,
) {
  const layer = props.store.layer;

  return View(
    {
      onMounted($e) {
        // if (rest.onMounted) {
        //   rest.onMounted($e);
        // }
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
        console.log("[]has layer?", !!layer);
        if (layer) {
          $e.addEventListener("pointerdown", () => {
            layer.pointerDown();
            const rect = $e.getBoundingClientRect();
            console.log("[]click", rect);
            props.store.toggle();
          });
        } else {
          $e.addEventListener("pointerdown", () => {
            const rect = $e.getBoundingClientRect();
            props.store.toggle({
              x: rect.left,
              y: rect.bottom + 4,
              width: rect.width,
              height: rect.height,
            });
          });
        }
      },
      // onUnmounted() {
      //   if (rest.onUnmounted) rest.onUnmounted();
      // },
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
  // const visible = computed(state, (d) => d.visible || d.enter || d.exit);
  // const layer = props.store.layer;

  return NativePortal(
    {
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") {
            fn();
          }
        }
        // if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    [
      Presence({ store: props.store.presence }, [
        Popper({ store: props.store.popper }, children),
      ]),
    ],
  );
}

export function Close(
  props: ViewProps & { store: PopoverCore },
  children?: ViewChildren,
) {
  return View(
    {
      ...props,
      type: "button",
      onClick() {
        props.store.hide();
      },
    },
    children,
  );
}
