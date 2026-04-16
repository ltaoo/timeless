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
export type VNodeEvent<T = any> = {
  target: T;
  stopPropagation(): void;
  preventDefault(): void;
};

type VNodeViewType =
  | "view"
  | "text"
  | "button"
  | "input"
  | "fragment"
  | "reactive";

export type VNodeView<HostElm = any> = {
  // $elm: HostElm;
  getType(): VNodeViewType;
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
  /** 构建宿主 node tree */
  render(elm: TimelessElement): any;
  /** 水合 */
  hydrate(elm: TimelessElement, $dom: HostElm): any;
  /** 构建 */
  buildChildren(children: (TimelessElement | null)[]): {
    $fragment: any;
    child_elements: (TimelessElement | null)[];
    child_host_nodes: HostElm[];
    child_nodes: VNodeView<any>[];
  };
  insertChildren(children: (TimelessElement | null)[]): void;
  removeChildren(): void;
  setupEventListener(events: any): void;
  teardownEventListener(events: any): void;
  // getParent(): VNodeView<any>;
  getParent(): any;
  get$elm(): HostElm;
};
