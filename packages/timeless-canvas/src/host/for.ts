import { isElement, TimelessElement, TimelessHost } from "@timeless/timeless";

import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";

export interface CanvasFor {
  $elm: any;
  getChildNodes(): any[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): any;
}

export function CanvasFor(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
}): CanvasFor {
  const canvas = props.canvas;
  const $elm = canvas.createDocumentFragment();

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
            const $sub = props.build(child, canvas);
            if ($sub && $sub.$elm) {
              canvas.appendChild($elm, $sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
  };
}

export function isCanvasFor(value: any): value is CanvasFor {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
