/**
 * @file 宿主平台抽象节点
 */
import { TimelessElement } from "@/content/type";
import { RawViewStyleProperties } from "@/style";

export type VNodeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};
export type VNodeEvent<T> = {
  target: T;
};

export type VNodeView<HostElm = any> = {
  // $elm: HostElm;
  getType(): "view" | "text" | "button" | "input" | "reactive";
  isDocumentFragment(): boolean;
  getChildren(): VNodeView<any>[];
  setStyle(style: RawViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(set: string[]): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  /** 获取视图的矩形位置 */
  getBoundingClientRect(): VNodeRect;
  addEventListener(
    type: string,
    handler: (event: VNodeEvent<VNodeView<HostElm>>) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (event: VNodeEvent<VNodeView<HostElm>>) => void,
    options?: any,
  ): void;
  render(elm: TimelessElement): any;
  /** 构建 */
  appendChildren(children: (TimelessElement | null)[]): any;
  insertChildren(children: (TimelessElement | null)[]): void;
  removeChildren(): void;
  // getParent(): VNodeView<any>;
  getParent(): any;
};
