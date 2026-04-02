export const TUI_NODE = Symbol("tui-node");

export type TuiNodeKind = "element" | "text" | "fragment";

export interface TuiNode {
  [TUI_NODE]: true;
  kind: TuiNodeKind;
  parentNode: TuiNode | null;
  nextSibling: TuiNode | null;
  childNodes: TuiNode[];
  textContent: string;
  appendChild(child: TuiNode): TuiNode;
  removeChild(child: TuiNode): TuiNode;
  insertBefore(newNode: TuiNode, refNode: TuiNode | null): TuiNode;
  replaceChild(newChild: TuiNode, oldChild: TuiNode): void;
  get firstChild(): TuiNode | null;
}

function updateSiblings(children: TuiNode[]) {
  for (let i = 0; i < children.length; i++) {
    children[i].nextSibling = children[i + 1] || null;
  }
}

export interface TuiAttributes {
  get(name: string): string | null;
  set(name: string, value: string): void;
  delete(name: string): void;
  has(name: string): boolean;
  entries(): IterableIterator<[string, string]>;
}

export interface TuiElement extends TuiNode {
  kind: "element";
  tag: string;
  attrs: TuiAttributes;
  className: string;
  innerHTML: string;
  style: Record<string, string>;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  querySelector(selector: string): TuiElement | null;
  getBoundingClientRect(): {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  addEventListener(
    type: string,
    handler: (...args: any[]) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (...args: any[]) => void,
    options?: any,
  ): void;
  contains(node: TuiNode): boolean;
}

export interface TuiText extends TuiNode {
  kind: "text";
}

export interface TuiFragment extends TuiNode {
  kind: "fragment";
}

function createAttributes(): TuiAttributes {
  const map = new Map<string, string>();
  return {
    get: (name) => map.get(name) ?? null,
    set: (name, value) => map.set(name, value),
    delete: (name) => map.delete(name),
    has: (name) => map.has(name),
    entries: () => map.entries(),
  };
}

export function createTuiElement(tag: string): TuiElement {
  const children: TuiNode[] = [];
  const attrs = createAttributes();
  const listeners = new Map<string, Set<(...args: any[]) => void>>();

  const node: TuiElement = {
    [TUI_NODE]: true,
    kind: "element",
    tag,
    attrs,
    className: "",
    innerHTML: "",
    style: {},
    parentNode: null,
    nextSibling: null,
    textContent: "",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    appendChild(child: TuiNode) {
      if (child.parentNode && child.parentNode !== node) {
        const idx = child.parentNode.childNodes.indexOf(child);
        if (idx !== -1) child.parentNode.childNodes.splice(idx, 1);
      }
      child.parentNode = node;
      children.push(child);
      updateSiblings(children);
      return child;
    },
    removeChild(child: TuiNode) {
      const idx = children.indexOf(child);
      if (idx !== -1) {
        children.splice(idx, 1);
        child.parentNode = null;
        updateSiblings(children);
      }
      return child;
    },
    insertBefore(newNode: TuiNode, refNode: TuiNode | null) {
      if (!refNode) {
        return node.appendChild(newNode);
      }
      const idx = children.indexOf(refNode);
      if (idx === -1) {
        return node.appendChild(newNode);
      }
      if (newNode.parentNode && newNode.parentNode !== node) {
        const oidx = newNode.parentNode.childNodes.indexOf(newNode);
        if (oidx !== -1) newNode.parentNode.childNodes.splice(oidx, 1);
      }
      newNode.parentNode = node;
      children.splice(idx, 0, newNode);
      updateSiblings(children);
      return newNode;
    },
    replaceChild(newChild: TuiNode, oldChild: TuiNode) {
      const idx = children.indexOf(oldChild);
      if (idx !== -1) {
        newChild.parentNode = node;
        oldChild.parentNode = null;
        children[idx] = newChild;
        updateSiblings(children);
      }
    },
    setAttribute(name: string, value: string) {
      attrs.set(name, value);
    },
    getAttribute(name: string) {
      return attrs.get(name);
    },
    removeAttribute(name: string) {
      attrs.delete(name);
    },
    querySelector(_selector: string) {
      return null;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 0, height: 0 };
    },
    addEventListener(type: string, handler: (...args: any[]) => void) {
      let set = listeners.get(type);
      if (!set) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(handler);
    },
    removeEventListener(type: string, handler: (...args: any[]) => void) {
      listeners.get(type)?.delete(handler);
    },
    contains(target: TuiNode) {
      let cur: TuiNode | null = target;
      while (cur) {
        if (cur === node) return true;
        cur = cur.parentNode;
      }
      return false;
    },
  };

  return node;
}

export function createTuiText(text: string): TuiText {
  const node: TuiText = {
    [TUI_NODE]: true,
    kind: "text",
    parentNode: null,
    nextSibling: null,
    childNodes: [],
    textContent: text,
    get firstChild() {
      return null;
    },
    appendChild() {
      return node;
    },
    removeChild() {
      return node;
    },
    insertBefore() {
      return node;
    },
    replaceChild() {},
  };
  return node;
}

export function createTuiFragment(): TuiFragment {
  const children: TuiNode[] = [];

  const node: TuiFragment = {
    [TUI_NODE]: true,
    kind: "fragment",
    parentNode: null,
    nextSibling: null,
    textContent: "",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    appendChild(child: TuiNode) {
      if (child.parentNode && child.parentNode !== node) {
        const idx = child.parentNode.childNodes.indexOf(child);
        if (idx !== -1) child.parentNode.childNodes.splice(idx, 1);
      }
      child.parentNode = node;
      children.push(child);
      updateSiblings(children);
      return child;
    },
    removeChild(child: TuiNode) {
      const idx = children.indexOf(child);
      if (idx !== -1) {
        children.splice(idx, 1);
        child.parentNode = null;
        updateSiblings(children);
      }
      return child;
    },
    insertBefore(newNode: TuiNode, refNode: TuiNode | null) {
      if (!refNode) {
        return node.appendChild(newNode);
      }
      const idx = children.indexOf(refNode);
      if (idx === -1) {
        return node.appendChild(newNode);
      }
      if (newNode.parentNode && newNode.parentNode !== node) {
        const oidx = newNode.parentNode.childNodes.indexOf(newNode);
        if (oidx !== -1) newNode.parentNode.childNodes.splice(oidx, 1);
      }
      newNode.parentNode = node;
      children.splice(idx, 0, newNode);
      updateSiblings(children);
      return newNode;
    },
    replaceChild(newChild: TuiNode, oldChild: TuiNode) {
      const idx = children.indexOf(oldChild);
      if (idx !== -1) {
        newChild.parentNode = node;
        oldChild.parentNode = null;
        children[idx] = newChild;
        updateSiblings(children);
      }
    },
  };
  return node;
}

export function isTuiNode(v: unknown): v is TuiNode {
  return !!v && typeof v === "object" && (v as any)[TUI_NODE] === true;
}
