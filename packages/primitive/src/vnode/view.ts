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
  getChildren(): (VNodeView<any> | null)[];
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
  hydrate(
    elm: TimelessElement,
    $dom: HostElm,
    opt: {
      initial?: boolean;
      $parent: any;
      /** 子节点的偏移量
       * 比如 Fragment 嵌套 Show 再 嵌套 Fragment 再嵌套 View
       * View 渲染的节点在 $parent 第二个，但是对于 Fragment 来说，它的子节点是 $parent 第一个
       * 所以需要一个偏移量来调整索引
       */
      offset: number;
      idx: number;
    },
  ): any;
  /** 构建 */
  buildChildren(children: (TimelessElement | null)[]): {
    $fragment: any;
    child_nodes: (VNodeView<any> | null)[];
    child_elements: (TimelessElement | null)[];
    child_host_nodes: HostElm[];
  };
  insertChildren(children: (TimelessElement | null)[]): void;
  get$children(): any[];
  removeChildren(): void;
  setupEventListener(events: any): void;
  teardownEventListener(events: any): void;
  /** Sync internal tracking after HMR patch inserts a child */
  trackChild(
    dom: any,
    element: TimelessElement,
    vnode: VNodeView<any>,
    index: number,
  ): void;
  /** Sync internal tracking after HMR patch removes a child */
  untrackChild(index: number): void;
  /** Replace internal tracking entry in-place (no array length change) */
  replaceTrackedChild?(
    index: number,
    dom: any,
    element: TimelessElement,
    vnode: VNodeView<any>,
  ): void;
  // getParent(): VNodeView<any>;
  getParent(): any;
  get$elm(): HostElm;
};
