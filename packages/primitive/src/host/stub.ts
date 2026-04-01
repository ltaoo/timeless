export const STUB_MARKER = "__stub__";

function updateSiblings(children: any[]) {
  for (let i = 0; i < children.length; i++) {
    children[i].nextSibling = children[i + 1] || null;
  }
}

function stubAppendChild(parent: any, child: any) {
  if (child && child[STUB_MARKER] === "fragment") {
    const kids = child.__children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].parentNode = parent;
      parent.__children.push(kids[i]);
    }
    kids.length = 0;
  } else {
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
  if (newNode && newNode[STUB_MARKER] === "fragment") {
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

function createStubElement(tag: string) {
  const children: any[] = [];
  const attrs = new Map<string, string>();
  const stub: any = {
    [STUB_MARKER]: "element",
    __tag: tag,
    __attrs: attrs,
    __children: children,
    nodeType: 1,
    nodeName: tag.toUpperCase(),
    parentNode: null,
    nextSibling: null,
    className: "",
    style: { cssText: "" },
    textContent: "",
    innerHTML: "",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    setAttribute(k: string, v: string) {
      attrs.set(k, v);
    },
    getAttribute(k: string) {
      return attrs.get(k) ?? null;
    },
    removeAttribute(k: string) {
      attrs.delete(k);
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(child: any) {
      return stubAppendChild(stub, child);
    },
    removeChild(child: any) {
      return stubRemoveChild(stub, child);
    },
    insertBefore(n: any, ref: any) {
      return stubInsertBefore(stub, n, ref);
    },
    replaceChild(n: any, o: any) {
      stubReplaceChild(stub, n, o);
    },
    contains() {
      return false;
    },
    querySelector() {
      return null;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON() {},
      };
    },
  };
  return stub;
}

function createStubTextNode(text: string) {
  const stub: any = {
    [STUB_MARKER]: "text",
    __children: [],
    nodeType: 3,
    nodeName: "#text",
    textContent: text,
    parentNode: null,
    nextSibling: null,
    appendChild() {},
    removeChild() {},
    insertBefore() {},
  };
  return stub;
}

function createStubDocumentFragment() {
  const children: any[] = [];
  const stub: any = {
    [STUB_MARKER]: "fragment",
    __children: children,
    nodeType: 11,
    nodeName: "#document-fragment",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    parentNode: null,
    nextSibling: null,
    appendChild(child: any) {
      return stubAppendChild(stub, child);
    },
    removeChild(child: any) {
      return stubRemoveChild(stub, child);
    },
    insertBefore(n: any, ref: any) {
      return stubInsertBefore(stub, n, ref);
    },
  };
  return stub;
}

export function createStubHost() {
  return {
    kind: "stub",
    createElement(tag: string) {
      return createStubElement(tag);
    },
    createElementNS(_namespace: string, tag: string) {
      return createStubElement(tag);
    },
    createTextNode(text: string) {
      return createStubTextNode(text);
    },
    createDocumentFragment() {
      return createStubDocumentFragment();
    },
    appendChild(parent: any, child: any) {
      parent.appendChild(child);
    },
    removeChild(parent: any, child: any) {
      parent.removeChild(child);
    },
    insertBefore(parent: any, child: any, before: any) {
      parent.insertBefore(child, before);
    },
    replaceChild(parent: any, newChild: any, oldChild: any) {
      parent.replaceChild(newChild, oldChild);
    },
    clearChildren(parent: any) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    },
    setAttribute(el: any, name: string, value: string) {
      el.setAttribute(name, value);
    },
    removeAttribute(el: any, name: string) {
      el.removeAttribute(name);
    },
    setClassName(el: any, className: string) {
      el.className = className;
    },
    setStyleText(el: any, cssText: string) {
      if (el.style) el.style.cssText = cssText;
    },
    patchStyle(el: any, patch: Record<string, string>) {
      if (!el.style) return;
      for (const k of Object.keys(patch)) {
        (el.style as any)[k] = patch[k];
      }
    },
    setTextContent(node: any, text: string) {
      node.textContent = text;
    },
    setInnerHTML(el: any, html: string) {
      el.innerHTML = html;
      el.textContent = html;
    },
    setProperty(el: any, key: string, value: any) {
      el[key] = value;
    },
    addEventListener() {},
    removeEventListener() {},
    setTimeout(handler: () => void, ms: number) {
      return setTimeout(handler, ms);
    },
    clearTimeout(id: any) {
      clearTimeout(id);
    },
    setPointerCapture(target: any, pointerId: number) {
      target.setPointerCapture?.(pointerId);
    },
    releasePointerCapture(target: any, pointerId: number) {
      target.releasePointerCapture?.(pointerId);
    },
    focus(target: any) {
      target.focus?.();
    },
    blur(target: any) {
      target.blur?.();
    },
    querySelector(root: any, selector: string) {
      return root.querySelector?.(selector) ?? null;
    },
    getBoundingClientRect(el: any) {
      return el.getBoundingClientRect?.() ?? {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      };
    },
    getViewportSize() {
      return { width: 0, height: 0 };
    },
    getBody() {
      return null;
    },
    isDocumentFragment(node: any) {
      return !!node && (node[STUB_MARKER] === "fragment" || node.nodeType === 11);
    },
    getChildNodes(node: any) {
      const v = node?.childNodes;
      if (!v) return [];
      return Array.isArray(v) ? v : Array.from(v);
    },
    getParentNode(node: any) {
      return node?.parentNode ?? null;
    },
    getNextSibling(node: any) {
      return node?.nextSibling ?? null;
    },
    getFirstChild(node: any) {
      return node?.firstChild ?? null;
    },
  };
}
