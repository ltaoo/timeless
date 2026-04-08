import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMFragment {
  t: "fragment";
  $elm: DocumentFragment;
  getChildNodes(): ChildNode[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): Text;
}

export function DOMFragment(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMFragment {
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");

  let elements: TimelessElement[] = [];
  let children$: ChildNode[] = [];

  return {
    t: "fragment",
    get $elm() {
      return $fragment;
    },
    getChildNodes() {
      return children$;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      // console.log('[]fragment render', elm.children);
      // const new_nodes: any[] = [];
      const new_instances: TimelessElement[] = [];
      // console.log('[]fragment - in render', elm.children);
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
              // new_nodes.push(...child_nodes);
              children$.push(...child_nodes);
            } else {
              // new_nodes.push($sub);
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
        for (let child of elements) {
          if (child.onMounted) {
            child.onMounted({
              target: child.$elm,
            });
          }
        }
        elements = new_instances;
      }

      return $anchor;
    },
  };
}

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
