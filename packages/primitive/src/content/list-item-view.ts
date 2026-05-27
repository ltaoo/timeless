import { MountedEvent } from "@/event/index";
import { VNodeView } from "@/vnode/view";
import { Logger } from "@/util/logger";

import { isElement, TimelessElement, ViewChildren } from "./type";
import { Box, BoxProps } from "./box";

const logger = Logger({ prefix: "primitive", scope: "content/list-item-view" });

export type ListItemViewProps<T> = BoxProps & {
  uid: number;
  top: number;
  height: number;
  payload: T;
  bound?: boolean;
};

/** Internal state for View */
type ListItemViewState<T> = {
  top: number;
  height: number;
  bound: boolean;
  payload: T | null;
};

/**
 * Creates a View component - the primary container.
 *
 * @param props - View props (style, class, events, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a view/container
 */
export function ListItemView<T>(
  props: ListItemViewProps<T>,
  children?: ViewChildren,
) {
  const { uid, top, height, payload, bound, ...rest } = props;

  const box$ = Box<ListItemViewState<T>>(rest, {
    bound,
    top,
    height,
    payload,
  } as ListItemViewState<T>);

  let $elm: any = null;

  const state = box$.state;
  const events = box$.events;

  const methods = {
    // Helper: setup bindings (attributes, class, style, events)
    subscribe_props() {
      box$.methods.subscribe_props();
    },
    cleanup_children(children = state.children) {
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        if (!isElement(child)) {
          continue;
        }
        if (child.beforeUnmounted) {
          child.beforeUnmounted();
        }
        if (child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
    rebind(data: {
      uid?: number | string;
      top: number;
      height?: number;
      payload?: T;
      child: TimelessElement;
    }) {
      const prev_children = [...state.children];
      state.bound = true;
      state.top = data.top;
      if (data.height !== undefined) {
        state.height = data.height;
      }
      if (data.payload !== undefined) {
        state.payload = data.payload;
      }
      state.children = [data.child];
      $elm.setStyle({
        position: "absolute",
        top: `${data.top}px`,
        width: "100%",
      });
      methods.cleanup_children(prev_children);
      $elm.removeChildren();
      $elm.insertChildren([data.child]);
      console.log('after $elm.insertChildren', data.child);
      if (isElement(data.child) && data.child.onMounted) {
        data.child.onMounted({ target: data.child.$elm });
      }
    },
    unbind() {
      const prev_children = [...state.children];
      state.bound = false;
      state.children = [];
      state.payload = null;
      $elm.setStyle({
        display: "none",
      });
      methods.cleanup_children(prev_children);
      $elm.removeChildren();
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "list-item-view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    events,
    get children() {
      return state.children;
    },
    unbind: methods.unbind,
    rebind: methods.rebind,
    setState(data: ListItemViewState<T> & { children: TimelessElement[] }) {
      state.top = data.top;
      state.height = data.height;
      state.bound = data.bound;
      state.payload = data.payload;
      state.children = data.children;
    },
    setTop(v: number) {
      state.top = v;
      if ($elm) {
        $elm.setStyleValue("top", `${v}px`);
      }
    },
    setPayload(v: T) {
      state.payload = v;
    },
    onMounted(event: MountedEvent<VNodeView>) {
      // logger.log("onMounted", state.children.length);
      state.rendered = true;
      const { top, height } = event.target.getBoundingClientRect();
      state.top = top;
      state.height = height;
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    // beforeUnmounted() {
    //   if (rest.beforeUnmounted) {
    //     rest.beforeUnmounted();
    //   }
    //   for (let i = 0; i < state.children.length; i += 1) {
    //     const node = state.children[i];
    //     if (isElement(node) && node.beforeUnmounted) {
    //       node.beforeUnmounted();
    //     }
    //   }
    // },
    onUnmounted() {
      // logger.log("onUnmounted", box$.listener$.length);
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      methods.cleanup_children();
      box$.methods.destroy();
      state.rendered = false;
      state.children.length = 0;
      $elm = null;
    },
  };
}

export type ListItemView = ReturnType<typeof ListItemView>;
