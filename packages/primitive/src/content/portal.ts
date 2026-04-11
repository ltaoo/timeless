import { isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { TimelessElement, ViewChildren, isElement } from "@/content/type";
import { Text } from "@/content/text";
import { MountedEvent } from "@/event";

type PortalProps = {
  onMounted?: (e: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
type PortalState = {
  children: TimelessElement[];
};

export function Portal(props: PortalProps, children?: ViewChildren) {
  let $elm: any = null;
  // let _mounted_children: Node[] = [];
  // let _mountedChildren: any[] = [];
  // let _mounted = false;
  const state: PortalState = {
    children: [],
  };

  const methods = {
    setup_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Text(String(child));
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          // state.children[i] = null;
        })();
      }
    },
    cleanup() {},
  };

  methods.setup_children(children);

  return {
    t: "portal",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: state.children,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted({ target: event.target });
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    onUnmounted() {
      // _mounted_children = [];
      // _mountedChildren = [];
      // _mounted = false;
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (const child of state.children) {
        if (isElement(child) && child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
  };
}
