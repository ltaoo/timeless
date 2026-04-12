import { isRef } from "@timeless/reactive";

import { TimelessElement, ViewChildren, isElement } from "@/content/type";
import { Text } from "@/content/text";
import { MountedEvent } from "@/event";
import { Logger } from "@/util/logger";

type PortalProps = {
  onMounted?: (e: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
type PortalState = {
  children: (TimelessElement | null)[];
};

const logger = Logger({ prefix: "primitive", scope: "content/portal" });

export function Portal(props: PortalProps, children?: ViewChildren) {
  let $elm: any = null;
  const state: PortalState = {
    children: [],
  };

  const methods = {
    build_children(children?: ViewChildren) {
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
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (child) {
            state.children[i] = Text(String(child));
            return;
          }
          state.children[i] = null;
        })();
      }
    },
  };

  methods.build_children(children);

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
      logger.info("onMounted", state.children.length);
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
