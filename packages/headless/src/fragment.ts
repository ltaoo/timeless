import { ViewChildren, ViewProps, isElement } from "./view";

export function Fragment(props: ViewProps, children: ViewChildren) {
  const $fragment = document.createDocumentFragment();
  const { onMounted, beforeUnmounted, onUnmounted } = props || {};

  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  return {
    t: "fragment",
    $elm: $fragment,
    beforeUnmounted() {
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
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (!node) continue;
        if (typeof node === "string" || typeof node === "number") {
          $fragment.appendChild(document.createTextNode(String(node)));
          continue;
        }
        if (isElement(node)) {
          const result = node.render();
          if (result) {
            $fragment.appendChild(result);
          }
        }
      }

      if (onMounted) {
        onMounted($fragment as any);
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
