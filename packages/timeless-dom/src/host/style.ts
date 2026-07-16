import {
  isRef,
  ObjectSignal,
  Ref,
  StyleRef,
  TimelessElement,
  ViewStyle,
  VNodeView,
} from "@timeless/timeless";
import { HostElement } from "./box";

export type DOMStyle = VNodeView<HTMLStyleElement> & {
  t: "style";
  render(): DocumentFragment;
};

export function DOMStyle(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLStyleElement>;
  elm: TimelessElement;
}): DOMStyle {
  const t = "style";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return true;
    },
    render() {
      const $elm = document.createElement("style");
      $elm.type = "text/css";
      if (props.elm.state.content) {
        $elm.textContent = props.elm.state.content;
      }
      box$.methods.set$elm($elm);
      document.head.appendChild($elm);
      return document.createDocumentFragment();
    },
    hydrate(elm: TimelessElement, $elm: HTMLStyleElement) {
      box$.methods.set$elm($elm);

      const child_nodes: VNodeView[] = [];
      const child_elements: (TimelessElement | null)[] = [];
    },
  };
}

export function viewStyleToCssText(
  style:
    | ViewStyle
    | StyleRef
    | ObjectSignal<ViewStyle>
    | Ref<ViewStyle>
    | undefined,
) {
  if (!style) {
    return "";
  }
  if (typeof style === "string") {
    return style;
  }
  const parts: string[] = [];
  const keys = Object.keys(style);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const vv = (style as any)[k] as any;
    const v = isRef(vv) ? vv.value : vv;
    if (v === undefined || v === null || v === false) {
      continue;
    }
    parts.push(`${k}: ${String(v)}`);
  }
  return parts.join("; ");
}
