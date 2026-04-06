import { isElement, TimelessElement } from "@timeless/timeless";

import { TuiHostNode } from "./type";
import { createTuiFragment } from "./nodes";

export interface TuiFor {
  $elm: any;
  getChildNodes(): any[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): any;
}

export function TuiFor(props: {
  build: (elm: TimelessElement) => TuiHostNode;
}): TuiFor {
  const $elm = createTuiFragment();

  return {
    get $elm() {
      return $elm;
    },
    getChildNodes() {
      return $elm ? [] : [];
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

export function isTuiFor(value: any): value is TuiFor {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
