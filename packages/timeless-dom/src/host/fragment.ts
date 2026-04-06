import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMFragment {
  t: "fragment";
  $elm: DocumentFragment;
  getChildNodes(): NodeListOf<ChildNode>;
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): Text;
}

export function DOMFragment(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMFragment {
  let children$: ChildNode[] = [];
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");

  return {
    t: "fragment",
    get $elm() {
      return $fragment;
    },
    getChildNodes() {
      return $fragment.childNodes;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const new_nodes: any[] = [];
      const new_instances: any[] = [];
      console.log('[]fragment - in render', elm.children);
      if (elm.children) {
        // console.log("[]show - in render", elm.children);
        for (let child of elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
            new_instances.push(child);
            const $sub = props.build(child);
            if (!$sub) {
              continue;
            }
            if ($sub.isDocumentFragment()) {
              const child_nodes = Array.from($sub.getChildNodes());
              new_nodes.push(...child_nodes);
              children$.push(...child_nodes);
            } else {
              new_nodes.push($sub);
              if ($sub.$elm) {
                children$.push($sub.$elm as ChildNode);
              }
            }
            if ($sub.$elm) {
              $fragment.appendChild($sub.$elm);
            }
          }
        }
        $fragment.appendChild($anchor);
      }

      return $anchor;
    },
  };
}

export function isDocumentFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
