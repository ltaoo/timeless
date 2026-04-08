import { TimelessElement, ViewStyleProperties } from "@timeless/timeless";

export interface NativeHostNode {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  render(elm: TimelessElement): any;
}

export interface NativeView {
  t: "view";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  addEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  render(elm: TimelessElement): any;
}
