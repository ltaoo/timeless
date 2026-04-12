import { TimelessElement } from "@timeless/timeless";

export interface NativeTextElm {
  type: "text";
  value: string;
  style: Record<string, string>;
  /** Called by the native bridge when it creates the platform label,
   *  so that future setContent() calls can push updates. */
  _onContentChange?: (value: string) => void;
}

export interface NativeText {
  $elm: NativeTextElm;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setContent(value: string | number | null): void;
  setStyle(style: Record<string, string>): void;
  render(elm: TimelessElement): any;
}

export function NativeText(value?: string | null): NativeText {
  const $text: NativeTextElm = {
    type: "text" as const,
    value: (() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }
      return "";
    })(),
    style: {},
  };

  return {
    get $elm() {
      return $text;
    },
    getChildNodes() {
      return [];
    },
    isDocumentFragment() {
      return true;
    },
    setContent(v: string | number | null) {
      if (v !== null && v !== undefined) {
        const str = String(v);
        $text.value = str;
        if (typeof $text._onContentChange === "function") {
          $text._onContentChange(str);
        }
      }
    },
    setStyle(style: Record<string, string>) {
      Object.assign($text.style, style);
    },
    render(elm: TimelessElement) {
      return $text;
    },
  };
}

export function isNativeText(value: any): value is NativeText {
  return (
    value &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
