import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMFor {
  $elm: DocumentFragment;
  getChildNodes(): NodeListOf<ChildNode>;
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): DocumentFragment;
}

export function DOMFor(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMFor {
  const $elm = document.createDocumentFragment();

  return {
    get $elm() {
      return $elm;
    },
    getChildNodes() {
      return $elm.childNodes;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      if (elm.children) {
        for (const child of elm.children) {
          if (isElement(child)) {
            const $sub = props.build(child);
            if ($sub && $sub.$elm) {
              $elm.appendChild($sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
  };
}

export function isDOMFor(value: any): value is DOMFor {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
