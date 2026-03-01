export interface ViewProps {
  type?: string;
  style?: string;
  class?: string;
  onClick?(e: any): void;
  onMounted?(el: any): void;
  onUnmounted?(): void;
  beforeUnmounted?(): void;
  [key: string]: any;
}

export function View(props: ViewProps = {}, children?: any[]) {
  const { type = "div", style, class: cls, onClick, onMounted, onUnmounted, beforeUnmounted, ...rest } = props;
  const $elm = document.createElement(type);
  if (cls) {
    $elm.className = cls;
  }
  if (style) {
    $elm.style.cssText = style;
  }
  if (onClick) {
    $elm.addEventListener("click", onClick);
  }
  const _children = children ?? [];
  return {
    t: "view",
    $elm,
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      for (const node of _children) {
        if (node && node.beforeUnmounted) node.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (onUnmounted) onUnmounted();
      for (const node of _children) {
        if (node && node.onUnmounted) node.onUnmounted();
      }
    },
    render() {
      for (const node of _children) {
        if (!node) continue;
        if (typeof node === "string" || typeof node === "number") {
          $elm.appendChild(document.createTextNode(String(node)));
          continue;
        }
        if (node.t && node.$elm) {
          const result = node.render();
          if (result) $elm.appendChild(result);
        }
      }
      if (onMounted) onMounted($elm);
      return $elm;
    },
  };
}

export function DangerouslyInnerHTML(html: string) {
  const $elm = document.createElement("div");
  return {
    t: "html",
    $elm,
    render() {
      $elm.innerHTML = html;
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      $elm.innerHTML = "";
    },
  };
}
