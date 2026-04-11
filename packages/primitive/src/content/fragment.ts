import { MountedEvent } from "@/event";

import { TimelessElement, ViewChildren, isElement } from "./type";
import { Box } from "./box";

export type FragmentProps = {
  onMounted?: (event: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
type FragmentState = {
  rendered: boolean;
  children: TimelessElement[];
};
export function Fragment(props: FragmentProps, children?: ViewChildren) {
  const { onMounted, beforeUnmounted, onUnmounted } = props || {};

  let $elm: any = null;
  const box$ = Box<FragmentState>({}, {} as FragmentState);

  const state = box$.state;

  box$.methods.build_children(children);

  return {
    t: "fragment",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    children: state.children,
    append(node: any) {
      state.children.push(node);
    },
    onMounted(event: MountedEvent) {
      if (onMounted) {
        box$.methods.add_listen(onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (onUnmounted) {
        onUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
      // Reset state for potential re-render
      state.rendered = false;
    },
  };
}

type Fragment = ReturnType<typeof Fragment>;

export function isFragment(v: any): v is Fragment {
  if (v.t === "fragment") {
    return true;
  }
  return false;
}
