import { safeCreateDocumentFragment, safeCreateTextNode } from "@/util/env";
import { getHost } from "@/host";

import { ViewChildren, ViewProps, isElement } from "./view";

export function Fragment(props: ViewProps, children: ViewChildren = []) {
  const host = getHost();
  let $fragment: any = null;
  const { onMounted, beforeUnmounted, onUnmounted } = props || {};
  let onMountedCleanup: (() => void) | undefined;
  let rendered = false;

  let _children = children;
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  // console.log("[Fragment] created with", _children.length, "children");

  return {
    t: "fragment",
    get $elm() {
      return $fragment;
    },
    set $elm(v) {
      $fragment = v;
    },
    beforeUnmounted() {
      // console.log("[Fragment] beforeUnmounted");
      if (beforeUnmounted) {
        beforeUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
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
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
    },
    append(node: any) {
      _children.push(node);
    },
    render() {
      if (rendered) {
        return $fragment;
      }
      rendered = true;

      // Create fragment if not already created
      if (!$fragment) {
        $fragment = safeCreateDocumentFragment();
      }

      // console.log("[Fragment] render, children count:", _children.length);
      for (let i = 0; i < _children.length; i += 1) {
        let node = _children[i];
        if (!node) continue;
        // 处理 h() 返回的延迟执行函数
        if (typeof node === "function") {
          node = node();
          _children[i] = node;
        }
        if (typeof node === "string" || typeof node === "number") {
          host.appendChild($fragment, safeCreateTextNode(String(node)));
          continue;
        }
        if (isElement(node)) {
          const result = node.render();
          if (result) {
            host.appendChild($fragment, result);
          }
        }
      }

      if (onMounted) {
        const cleanup = onMounted($fragment as any);
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node)) {
          if (node.onMounted) {
            node.onMounted(node.$elm);
          }
        }
      }
      return $fragment;
    },
  };
}
