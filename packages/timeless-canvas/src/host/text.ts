import { TimelessElement } from "@timeless/primitive";

import { CanvasDocument } from "./draw";

export interface CanvasText {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setContent: (v: string | number | null) => void;
  render(elm: TimelessElement): any;
}

export function CanvasText(
  value: string | null,
  canvas: CanvasDocument,
): CanvasText {
  const $text = canvas.createTextNode(String(value ?? ""));

  return {
    get $elm() {
      return $text;
    },
    getChildNodes() {
      return [];
    },
    isDocumentFragment() {
      return false;
    },
    setContent(v) {
      if (v) {
        // $text
      }
    },
    render(elm: TimelessElement) {
      if (!elm.value) {
        return null;
      }
      return $text;
    },
  };
}

export function isCanvasText(value: any): value is CanvasText {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
