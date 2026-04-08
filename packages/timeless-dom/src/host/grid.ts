import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";
import { DOMView } from "./view";

export interface DOMGrid {
  $elm: HTMLDivElement;
  getChildNodes(): ChildNode[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): HTMLDivElement;
}

export function DOMGrid(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMGrid {
  const view$ = DOMView(props);

  return {
    get $elm() {
      return view$.$elm;
    },
    getChildNodes() {
      return [];
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = view$.$elm;
      if (elm.props) {
        const cols = (elm.props as any).columns ?? 4;
        const gap = (elm.props as any).gap ?? 16;
        $elm.style.display = "grid";
        $elm.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        $elm.style.gap = `${gap}px`;
      }
      if (elm.children) {
        for (let child of elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            const $sub = props.build(child);
            if (!$sub) {
              continue;
            }
            if ($sub.$elm) {
              $elm.appendChild($sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
  };
}

export function isDOMGrid(value: any): value is DOMGrid {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
