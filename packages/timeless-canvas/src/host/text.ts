import { TimelessElement, VNodeView } from "@timeless/timeless";

import { CanvasDocument } from "./draw";

export type CanvasText = VNodeView<any> & {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setContent: (v: string | number | null) => void;
  render(elm: TimelessElement): any;
};

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
      if ($text && typeof $text.setTextContent === "function") {
        $text.setTextContent(String(v ?? ""));
      }
    },
    render(elm: TimelessElement) {
      if (!elm.state.value) {
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
