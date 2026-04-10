import { TimelessElement } from "@timeless/timeless";

import { createTuiText } from "./nodes";

export interface TuiText {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setContent: (v: string | number | null) => void;
  render(elm: TimelessElement): any;
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
    setContent(v) {
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
