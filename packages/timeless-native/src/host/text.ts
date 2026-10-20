import { TimelessElement } from "@timeless/timeless";
import {
  refreshNativeStyles,
  requestNativeLayout,
  setNativeInlineStyle,
} from "../stylesheet";

export interface NativeTextElm {
  type: "text";
  value: string;
  style: Record<string, string>;
  parentNode?: any;
  /** Called by the native bridge when it creates the platform label,
   *  so that future setContent() calls can push updates. */
  _onContentChange?: (value: string) => void;
  _onStyleChange?: (style: Record<string, string>) => void;
}

export type NativeText = {
  t: "text";
  $elm: NativeTextElm;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: Record<string, string>): void;
  render(): any;
  setText(value: string | number | null): void;
};

export function NativeText(props: { elm: TimelessElement }): NativeText {
  const $text: NativeTextElm = {
    type: "text",
    value: "",
    style: {},
  };

  return {
    t: "text",
    get $elm() {
      return $text;
    },
    getChildNodes() {
      return [];
    },
    isDocumentFragment() {
      return false;
    },
    setText(v: string | number | null) {
      if (v !== null && v !== undefined) {
        const str = String(v);
        $text.value = str;
        if (typeof $text._onContentChange === "function") {
          $text._onContentChange(str);
        }
      } else {
        $text.value = "";
        $text._onContentChange?.("");
      }
      requestNativeLayout();
    },
    setStyle(style: Record<string, string>) {
      setNativeInlineStyle($text, style);
    },
    render() {
      refreshNativeStyles($text);
      $text.value = (() => {
        if (
          props.elm.state.value !== null &&
          props.elm.state.value !== undefined
        ) {
          return String(props.elm.state.value);
        }
        return "";
      })();
      return $text;
    },
  };
}

export function isNativeText(value: any): value is NativeText {
  return value.t === "text";
}
