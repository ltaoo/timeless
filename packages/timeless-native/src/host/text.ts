import { TimelessElement } from "@timeless/timeless";

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
  render(elm: TimelessElement): any;
  setText(value: string | number | null): void;
};

export function NativeText(): NativeText {
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
      }
    },
    setStyle(style: Record<string, string>) {
      Object.assign($text.style, style);
      if (typeof $text._onStyleChange === "function") {
        $text._onStyleChange($text.style);
      }
    },
    render(elm: TimelessElement) {
      $text.value = (() => {
        if (elm.state.value !== null && elm.state.value !== undefined) {
          return String(elm.state.value);
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
