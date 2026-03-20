export const isBrowser = typeof document !== 'undefined';

/** Marker to identify stub nodes created for SSR */
export const STUB_MARKER = '__stub__';

// --- Stub tree operations ---

function updateSiblings(children: any[]) {
  for (let i = 0; i < children.length; i++) {
    children[i].nextSibling = children[i + 1] || null;
  }
}

function stubAppendChild(parent: any, child: any) {
  if (child && child[STUB_MARKER] === 'fragment') {
    // Fragment: move its children into parent
    const kids = child.__children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].parentNode = parent;
      parent.__children.push(kids[i]);
    }
    kids.length = 0;
  } else {
    // Remove from previous parent if any
    if (child && child.parentNode && child.parentNode.__children) {
      const idx = child.parentNode.__children.indexOf(child);
      if (idx !== -1) child.parentNode.__children.splice(idx, 1);
    }
    child.parentNode = parent;
    parent.__children.push(child);
  }
  updateSiblings(parent.__children);
  return child;
}

function stubRemoveChild(parent: any, child: any) {
  const idx = parent.__children.indexOf(child);
  if (idx !== -1) {
    parent.__children.splice(idx, 1);
    child.parentNode = null;
    updateSiblings(parent.__children);
  }
  return child;
}

function stubInsertBefore(parent: any, newNode: any, refNode: any) {
  if (!refNode) {
    return stubAppendChild(parent, newNode);
  }
  const idx = parent.__children.indexOf(refNode);
  if (idx === -1) {
    return stubAppendChild(parent, newNode);
  }
  if (newNode && newNode[STUB_MARKER] === 'fragment') {
    const kids = newNode.__children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].parentNode = parent;
    }
    parent.__children.splice(idx, 0, ...kids);
    kids.length = 0;
  } else {
    if (newNode.parentNode && newNode.parentNode.__children) {
      const oidx = newNode.parentNode.__children.indexOf(newNode);
      if (oidx !== -1) newNode.parentNode.__children.splice(oidx, 1);
    }
    newNode.parentNode = parent;
    parent.__children.splice(idx, 0, newNode);
  }
  updateSiblings(parent.__children);
  return newNode;
}

function stubReplaceChild(parent: any, newChild: any, oldChild: any) {
  const idx = parent.__children.indexOf(oldChild);
  if (idx !== -1) {
    newChild.parentNode = parent;
    oldChild.parentNode = null;
    parent.__children[idx] = newChild;
    updateSiblings(parent.__children);
  }
}

// --- Factory functions ---

function createStubElement(tag: string): HTMLElement {
  const children: any[] = [];
  const attrs = new Map<string, string>();
  const stub: any = {
    [STUB_MARKER]: 'element',
    __tag: tag,
    __attrs: attrs,
    __children: children,
    nodeType: 1,
    nodeName: tag.toUpperCase(),
    parentNode: null,
    nextSibling: null,
    className: '',
    style: { cssText: '' },
    textContent: '',
    get childNodes() { return children; },
    get firstChild() { return children[0] || null; },
    setAttribute(k: string, v: string) { attrs.set(k, v); },
    getAttribute(k: string) { return attrs.get(k) ?? null; },
    removeAttribute(k: string) { attrs.delete(k); },
    addEventListener() {},
    removeEventListener() {},
    appendChild(child: any) { return stubAppendChild(stub, child); },
    removeChild(child: any) { return stubRemoveChild(stub, child); },
    insertBefore(n: any, ref: any) { return stubInsertBefore(stub, n, ref); },
    replaceChild(n: any, o: any) { stubReplaceChild(stub, n, o); },
    contains() { return false; },
    getBoundingClientRect() {
      return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} };
    },
  };
  return stub as unknown as HTMLElement;
}

function createStubTextNode(text: string): Text {
  const stub: any = {
    [STUB_MARKER]: 'text',
    __children: [],
    nodeType: 3,
    nodeName: '#text',
    textContent: text,
    parentNode: null,
    nextSibling: null,
    appendChild() {},
    removeChild() {},
    insertBefore() {},
  };
  return stub as unknown as Text;
}

function createStubDocumentFragment(): DocumentFragment {
  const children: any[] = [];
  const stub: any = {
    [STUB_MARKER]: 'fragment',
    __children: children,
    nodeType: 11,
    nodeName: '#document-fragment',
    get childNodes() { return children; },
    get firstChild() { return children[0] || null; },
    parentNode: null,
    nextSibling: null,
    appendChild(child: any) { return stubAppendChild(stub, child); },
    removeChild(child: any) { return stubRemoveChild(stub, child); },
    insertBefore(n: any, ref: any) { return stubInsertBefore(stub, n, ref); },
  };
  return stub as unknown as DocumentFragment;
}

// --- Public API ---

export function safeCreateElement(tag: string): HTMLElement {
  if (isBrowser) {
    return document.createElement(tag);
  }
  return createStubElement(tag);
}

export function safeCreateTextNode(text: string): Text {
  if (isBrowser) {
    return document.createTextNode(text);
  }
  return createStubTextNode(text);
}

export function safeCreateDocumentFragment(): DocumentFragment {
  if (isBrowser) {
    return document.createDocumentFragment();
  }
  return createStubDocumentFragment();
}
