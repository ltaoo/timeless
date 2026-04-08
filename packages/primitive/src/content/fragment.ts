import { ViewProps } from "./view";
import { Txt } from "./text";
import { TimelessElement, ViewChildren, isElement } from "./type";
import { MountedEvent } from "@/event";

export function Fragment(props: ViewProps, children: ViewChildren = []) {
  const { onMounted, beforeUnmounted, onUnmounted } = props || {};
  let onMountedCleanup: (() => void) | undefined;

  // 关联一个 宿主平台 节点
  let $fragment: any = null;

  const state: {
    rendered: boolean;
    children: TimelessElement[];
  } = {
    rendered: false,
    children: [],
  };

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
    state,
    get $elm() {
      return $fragment;
    },
    children: state.children,
    // set $elm(v) {
    //   $fragment = v;
    // },
    append(node: any) {
      state.children.push(node);
    },
    render() {
      if (state.rendered) {
        return $fragment;
      }
      state.rendered = true;

      // Create fragment if not already created
      // if (!$fragment) {
      //   $fragment = safeCreateDocumentFragment();
      // }

      if (onMounted) {
        const cleanup = onMounted({ target: $fragment as any });
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node)) {
          if (node.onMounted) {
            node.onMounted({ target: node.$elm });
          }
        }
      }
      return $fragment;
    },
    onMounted(event: MountedEvent) {
      if (onMounted) {
        onMounted(event);
      }
    },
    beforeUnmounted() {
      // console.log("[Fragment] beforeUnmounted");
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
      // console.log("[Fragment] onUnmounted");
      if (onMountedCleanup) {
        onMountedCleanup();
        onMountedCleanup = undefined;
      }
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
