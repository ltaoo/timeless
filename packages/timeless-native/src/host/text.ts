import { TimelessElement } from "@timeless/timeless";
import {
  refreshNativeStyles,
  invalidateNativeStyles,
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
  _onContentChange?: (value: string) => boolean | void;
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
      const value = v == null ? "" : String(v);
      if ($text.value === value) return;
      const empty_changed = !$text.value !== !value;
      $text.value = value;
      if (empty_changed && $text.parentNode)
        invalidateNativeStyles($text.parentNode, "structure", ["children"]);
      // Hosts may skip layout when the measured dimensions are unchanged.
      if ($text._onContentChange?.(value) !== false) requestNativeLayout();
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
