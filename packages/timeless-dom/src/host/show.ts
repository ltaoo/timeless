import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMShow = VNodeView<Text> & {
  t: "show";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

export function DOMShow(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMShow {
  const t = "show";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    t,
    getType() {
      return "reactive";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle: common$.methods.setStyle,
    setStyleValue: common$.methods.setStyleValue,
    setStyleSet: common$.methods.setStyleSet,
    setAttribute: common$.methods.setAttribute,
    removeAttribute: common$.methods.removeAttribute,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      if ($elm instanceof Text) {
        return;
      }
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      if (elm.children) {
        const count = elm.children.length;
        const $parent = $elm.parentElement;
        console.log("[]show check has $parent", $parent, count);
        if ($parent) {
          const $children = Array.from($parent.childNodes);
          const idx = $children.indexOf($elm);
          const $children_belong_show = $children.slice(idx, idx + count + 1);
          console.log(
            "[]show $children belong show",
            idx,
            $children_belong_show,
          );
          common$.methods.set$childrne($children_belong_show);
          const $last = $children_belong_show[$children_belong_show.length];
          if ($last) {
            $parent.insertBefore($anchor, $last);
          } else {
            $parent.appendChild($anchor);
          }
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            if (child) {
              hydrate_node(
                child,
                $children_belong_show[i] as HTMLElement | Text,
              );
            }
          }
        }
      }
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren(children: TimelessElement[]) {
      common$.methods.removeChildren();
      common$.methods.insertChildren(children);
    },
    removeChildren() {
      console.log("[]show remove children");
      common$.methods.removeChildren();
    },
    getParent() {
      return $anchor.parentElement;
    },
  };
}

export function isDOMShow(value: any): value is DOMShow {
  return value.t === "show";
}
