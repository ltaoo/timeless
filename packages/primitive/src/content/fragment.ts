import { ViewProps } from "./view";
import { Txt } from "./text";
import { TimelessElement, ViewChildren, isElement } from "./type";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

type FragmentState = {
  rendered: boolean;
  children: TimelessElement[];
};
export function Fragment(props: ViewProps, children: ViewChildren = []) {
  const { onMounted, beforeUnmounted, onUnmounted } = props || {};

  let $elm: any = null;
  const state: FragmentState = {
    rendered: false,
    children: [],
  };
  const listener$ = ListenerManager();

  // console.log("[Fragment] created with", _children.length, "children");

  // console.log("[Fragment] render, children count:", _children.length);
  for (let i = 0; i < children.length; i += 1) {
    let node = children[i];
    if (!node) {
      continue;
    }
    // 处理 h() 返回的延迟执行函数
    // if (typeof node === "function") {
    //   node = node();
    //   state.children[i] = node;
    // }
    if (typeof node === "string" || typeof node === "number") {
      // $fragment.appendChild(Txt(String(node)));
      state.children[i] = Txt(String(node));
      continue;
    }
    if (isElement(node)) {
      state.children[i] = node;
      // const result = node.render();
      // if (result) {
      //   $fragment.appendChild(result);
      // }
    }
  }

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
        onMounted(event);
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
      listener$.clean();
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
      // $fragment = null;
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
