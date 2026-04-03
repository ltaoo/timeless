import type {
  VNode,
  VNodeElement,
  VNodeFragment,
  VNodeKey,
  VNodeStyle,
  VNodeText,
  VNodeEvents,
} from "./types";

function updateNextSiblings(children: VNode[]) {
  for (let i = 0; i < children.length; i += 1) {
    children[i].nextSibling = children[i + 1] ?? null;
  }
}

export function createElement(
  tag: string,
  config?: {
    key?: VNodeKey;
    style?: VNodeStyle;
    stylePresets?: string[];
    attrs?: Record<string, string | boolean | number>;
    props?: Record<string, any>;
    events?: VNodeEvents;
    draggable?: boolean;
    focusable?: boolean;
  },
  children?: VNode[],
): VNodeElement {
  const vnode: VNodeElement = {
    kind: "element",
    key: config?.key,
    parent: null,
    nextSibling: null,
    tag,
    style: config?.style ?? {},
    stylePresets: config?.stylePresets ?? [],
    attrs: config?.attrs ?? {},
    props: config?.props ?? {},
    events: config?.events ?? {},
    children: [],
    draggable: config?.draggable,
    focusable: config?.focusable,
  };

  if (children && children.length) {
    for (const child of children) {
      appendChild(vnode, child);
    }
  }

  return vnode;
}

export function createText(text: string): VNodeText {
  return {
    kind: "text",
    parent: null,
    nextSibling: null,
    text,
  };
}

export function createFragment(children: VNode[] = []): VNodeFragment {
  const vnode: VNodeFragment = {
    kind: "fragment",
    parent: null,
    nextSibling: null,
    children: [],
  };
  for (const child of children) {
    appendChild(vnode, child);
  }
  return vnode;
}

export function appendChild(parent: VNodeElement | VNodeFragment, child: VNode) {
  if (child.parent) {
    removeChild(child.parent, child);
  }
  child.parent = parent;
  parent.children.push(child);
  updateNextSiblings(parent.children);
}

export function removeChild(parent: VNodeElement | VNodeFragment, child: VNode) {
  const idx = parent.children.indexOf(child);
  if (idx === -1) return;
  parent.children.splice(idx, 1);
  child.parent = null;
  child.nextSibling = null;
  updateNextSiblings(parent.children);
}

export function insertBefore(
  parent: VNodeElement | VNodeFragment,
  child: VNode,
  before: VNode | null,
) {
  if (before === null) {
    appendChild(parent, child);
    return;
  }
  const idx = parent.children.indexOf(before);
  if (idx === -1) {
    appendChild(parent, child);
    return;
  }
  if (child.parent) {
    removeChild(child.parent, child);
  }
  child.parent = parent;
  parent.children.splice(idx, 0, child);
  updateNextSiblings(parent.children);
}

export function replaceChild(
  parent: VNodeElement | VNodeFragment,
  newChild: VNode,
  oldChild: VNode,
) {
  const idx = parent.children.indexOf(oldChild);
  if (idx === -1) return;
  if (newChild.parent) {
    removeChild(newChild.parent, newChild);
  }
  newChild.parent = parent;
  parent.children[idx] = newChild;
  oldChild.parent = null;
  oldChild.nextSibling = null;
  updateNextSiblings(parent.children);
}

export function clearChildren(parent: VNodeElement | VNodeFragment) {
  for (const child of parent.children) {
    child.parent = null;
    child.nextSibling = null;
  }
  parent.children.length = 0;
}

export function replaceChildren(parent: VNodeElement, newChildren: VNode[]) {
  clearChildren(parent);
  for (const child of newChildren) {
    appendChild(parent, child);
  }
}
