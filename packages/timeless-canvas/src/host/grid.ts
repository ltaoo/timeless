import { isElement, TimelessElement, VNodeView } from "@timeless/timeless";

import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";

export type CanvasGrid = VNodeView<any> & {
  $elm: any;
  getChildNodes(): any[];
  isDocumentFragment(): boolean;
  render(): any;
};

export function CanvasGrid(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
  elm: TimelessElement;
}): CanvasGrid {
  const canvas = props.canvas;
  const $elm = canvas.createElement("div");

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
    render() {
      const cols = props.elm.state.columns ?? 4;
      const gap = props.elm.state.gap ?? 16;
      canvas.setStyleText(
        $elm,
        `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px;`,
      );
      if (props.elm.children) {
        for (let child of props.elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            const $sub = props.build(child, canvas);
            if (!$sub) {
              continue;
            }
            if ($sub.$elm) {
              canvas.appendChild($elm, $sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
  };
}

export function isCanvasGrid(value: any): value is CanvasGrid {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
