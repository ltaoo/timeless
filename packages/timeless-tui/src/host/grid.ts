import { isElement, TimelessElement } from "@timeless/timeless";

import { TuiHostNode } from "./type";
import { createTuiElement } from "./nodes";

export interface TuiGrid {
  $elm: any;
  getChildNodes(): any[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): any;
}

export function TuiGrid(props: {
  build: (elm: TimelessElement) => TuiHostNode;
}): TuiGrid {
  const $elm = createTuiElement("div");

  return {
    get $elm() {
      return $elm;
    },
    getChildNodes() {
      return $elm ? [] : [];
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      if (elm.props) {
        const cols = (elm.props as any).columns ?? 4;
        const gap = (elm.props as any).gap ?? 16;
        ($elm as any).style = {
          cssText: `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px;`,
        };
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

export function isTuiGrid(value: any): value is TuiGrid {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
