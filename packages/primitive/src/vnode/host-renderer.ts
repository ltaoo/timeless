import type { AnimationConfig } from "./animation";
import type { VNode, VNodeA11y, VNodePlatform, VNodeStyle } from "./types";

export type BoundingRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export interface VNodePatch {
  style?: Partial<VNodeStyle>;
  stylePresets?: string[];
  attrs?: Record<string, string | boolean | number | null>;
  props?: Record<string, any>;
  text?: string;
  a11y?: Partial<VNodeA11y>;
}

export interface HostRenderer {
  kind: string;
  platform: VNodePlatform;

  createNode(vnode: VNode): void;
  removeNode(vnode: VNode): void;

  patchNode(vnode: VNode, changes: VNodePatch): void;

  insertChild(parent: VNode, child: VNode, before: VNode | null): void;
  removeChild(parent: VNode, child: VNode): void;

  getBoundingRect(vnode: VNode): BoundingRect;
  getViewportSize(): { width: number; height: number };
  focus(vnode: VNode): void;
  blur(vnode: VNode): void;
  getBody(): any;

  animate(vnode: VNode, animations: AnimationConfig[]): Promise<void>;
  cancelAnimation(vnode: VNode): void;

  setTimeout(handler: () => void, ms: number): any;
  clearTimeout(id: any): void;
  addGlobalEventListener(
    type: string,
    handler: (e: any) => void,
    options?: any,
  ): void;
  removeGlobalEventListener(
    type: string,
    handler: (e: any) => void,
    options?: any,
  ): void;

  getSafeAreaInsets?(): { top: number; right: number; bottom: number; left: number };
}

