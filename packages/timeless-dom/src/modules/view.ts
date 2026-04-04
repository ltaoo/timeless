import { ViewProps, ViewChildren, isStyleRef } from "@timeless/timeless";
import { viewStyleToCssText } from "./style";

export function View(props: ViewProps, children: ViewChildren) {
  const $elm = document.createElement("div");

  if (props.style) {
    $elm.style = viewStyleToCssText(props.style);
    if (isStyleRef(props.style)) {
      props.style._subscribe({
        onChange(v: any) {
          $elm.style = viewStyleToCssText(v);
        },
      });
    }
  }

  for (const child of children) {
    // const vnode = mountChild(child, null);
    // if (vnode) appendChild($elm, vnode);
  }

  return $elm;
}
