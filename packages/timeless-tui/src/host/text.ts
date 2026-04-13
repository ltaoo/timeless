import { TimelessElement } from "@timeless/timeless";

import { createTuiText } from "./nodes";

export interface TuiText {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  render(elm: TimelessElement): any;
  setText: (v: string | number | null) => void;
}

export function TuiText(value: string | null): TuiText {
  const $text = createTuiText(String(value ?? ""));

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
    setText(v) {
      if (v) {
        // $text
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

export function isTuiText(value: any): value is TuiText {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
