import { setHost, type HeadlessHost } from "@timeless/timeless";

type AnyEventHandler = (event: any) => void;

export function createDomHost(options: {
  document?: Document;
  window?: Window;
  body?: HTMLElement | null;
} = {}): HeadlessHost {
  const doc = options.document ?? globalThis.document;
  const win = options.window ?? globalThis.window;
  const getBody = () => options.body ?? doc?.body ?? null;

  const handlerStore = new WeakMap<
    any,
    Map<string, { capture: Set<AnyEventHandler>; bubble: Set<AnyEventHandler> }>
  >();

  const dispatcherState = new Map<
    string,
    {
      captureCount: number;
      bubbleCount: number;
      captureListener: (event: Event) => void;
      bubbleListener: (event: Event) => void;
    }
  >();

  const getHandlerBucket = (target: any, type: string) => {
    let perTarget = handlerStore.get(target);
    if (!perTarget) {
      perTarget = new Map();
      handlerStore.set(target, perTarget);
    }
    let bucket = perTarget.get(type);
    if (!bucket) {
      bucket = { capture: new Set(), bubble: new Set() };
      perTarget.set(type, bucket);
    }
    return bucket;
  };

  const normalizeCapture = (options?: any) => {
    if (typeof options === "boolean") return options;
    return !!options?.capture;
  };

  const buildPath = (start: any) => {
    const path: any[] = [];
    let cur = start;
    while (cur) {
      path.push(cur);
      if (cur === doc) break;
      cur = cur.parentNode ?? cur.host ?? null;
    }
    if (path[path.length - 1] !== doc) {
      path.push(doc);
    }
    return path;
  };

  const createEventProxy = (event: any, currentTarget: any) => {
    return new Proxy(event, {
      get(target, prop) {
        if (prop === "currentTarget") return currentTarget;
        if (prop === "target") return event.target;
        if (prop === "stopPropagation") {
          return () => event.stopPropagation();
        }
        if (prop === "stopImmediatePropagation") {
          return () => event.stopImmediatePropagation();
        }
        if (prop === "preventDefault") {
          return () => event.preventDefault();
        }
        return Reflect.get(target, prop);
      },
    });
  };

  const makeDispatcher = (type: string, phase: "capture" | "bubble") => {
    return (event: Event) => {
      let stopped = false;
      let immediateStopped = false;
      const originalStopPropagation = (event as any).stopPropagation?.bind(event);
      const originalStopImmediatePropagation = (event as any).stopImmediatePropagation?.bind(event);

      if (originalStopPropagation) {
        (event as any).stopPropagation = () => {
          stopped = true;
          originalStopPropagation();
        };
      }

      if (originalStopImmediatePropagation) {
        (event as any).stopImmediatePropagation = () => {
          immediateStopped = true;
          stopped = true;
          originalStopImmediatePropagation();
        };
      }

      try {
        const start = (event as any).target ?? doc;
        const path = buildPath(start);
        const iter = phase === "capture" ? [...path].reverse() : path;

        for (let i = 0; i < iter.length; i++) {
          const node = iter[i];
          const perTarget = handlerStore.get(node);
          const bucket = perTarget?.get(type);
          const set = phase === "capture" ? bucket?.capture : bucket?.bubble;
          if (!set || set.size === 0) {
            if (stopped) break;
            continue;
          }

          const e2 = createEventProxy(event, node);
          for (const handler of Array.from(set)) {
            handler(e2);
            if (immediateStopped) break;
          }

          if (stopped) break;
        }
      } finally {
        if (originalStopPropagation) {
          (event as any).stopPropagation = originalStopPropagation;
        }
        if (originalStopImmediatePropagation) {
          (event as any).stopImmediatePropagation = originalStopImmediatePropagation;
        }
      }
    };
  };

  const ensureDispatcher = (type: string) => {
    let state = dispatcherState.get(type);
    if (!state) {
      state = {
        captureCount: 0,
        bubbleCount: 0,
        captureListener: makeDispatcher(type, "capture"),
        bubbleListener: makeDispatcher(type, "bubble"),
      };
      dispatcherState.set(type, state);
    }
    return state;
  };

  return {
    kind: "dom",
    createElement(tag: string) {
      return doc.createElement(tag);
    },
    createElementNS(namespace: string, tag: string) {
      return doc.createElementNS(namespace, tag);
    },
    createTextNode(text: string) {
      return doc.createTextNode(text);
    },
    createDocumentFragment() {
      return doc.createDocumentFragment();
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
      el.style.cssText = cssText;
    },
    patchStyle(el: any, patch: Record<string, string>) {
      for (const k of Object.keys(patch)) {
        el.style[k] = patch[k];
      }
    },
    setTextContent(node: any, text: string) {
      node.textContent = text;
    },
    setInnerHTML(el: any, html: string) {
      el.innerHTML = html;
    },
    setProperty(el: any, key: string, value: any) {
      el[key] = value;
    },
    addEventListener(target: any, type: string, handler: any, options?: any) {
      const capture = normalizeCapture(options);
      const bucket = getHandlerBucket(target, type);
      const state = ensureDispatcher(type);
      const set = capture ? bucket.capture : bucket.bubble;
      if (set.has(handler)) return;
      set.add(handler);

      if (capture) {
        if (state.captureCount === 0) {
          doc.addEventListener(type, state.captureListener, true);
        }
        state.captureCount += 1;
      } else {
        if (state.bubbleCount === 0) {
          doc.addEventListener(type, state.bubbleListener, false);
        }
        state.bubbleCount += 1;
      }
    },
    removeEventListener(target: any, type: string, handler: any, options?: any) {
      const capture = normalizeCapture(options);
      const perTarget = handlerStore.get(target);
      const bucket = perTarget?.get(type);
      const state = dispatcherState.get(type);
      if (!bucket || !state) return;

      const set = capture ? bucket.capture : bucket.bubble;
      if (!set.has(handler)) return;
      set.delete(handler);

      if (capture) {
        state.captureCount = Math.max(0, state.captureCount - 1);
        if (state.captureCount === 0) {
          doc.removeEventListener(type, state.captureListener, true);
        }
      } else {
        state.bubbleCount = Math.max(0, state.bubbleCount - 1);
        if (state.bubbleCount === 0) {
          doc.removeEventListener(type, state.bubbleListener, false);
        }
      }
    },
    addDocumentEventListener(type: string, handler: any, options?: any) {
      doc.addEventListener(type, handler, options);
    },
    removeDocumentEventListener(type: string, handler: any, options?: any) {
      doc.removeEventListener(type, handler, options);
    },
    patchBodyStyle(patch: { cursor?: string; userSelect?: string }) {
      const body = getBody();
      if (!body) return;
      if (patch.cursor !== undefined) body.style.cursor = patch.cursor;
      if (patch.userSelect !== undefined) body.style.userSelect = patch.userSelect;
    },
    setTimeout(handler: () => void, ms: number) {
      return win.setTimeout(handler, ms);
    },
    clearTimeout(id: any) {
      win.clearTimeout(id);
    },
    setPointerCapture(target: any, pointerId: number) {
      target.setPointerCapture(pointerId);
    },
    releasePointerCapture(target: any, pointerId: number) {
      target.releasePointerCapture(pointerId);
    },
    focus(target: any) {
      target.focus();
    },
    blur(target: any) {
      target.blur();
    },
    querySelector(root: any, selector: string) {
      return root.querySelector(selector);
    },
    getBoundingClientRect(el: any) {
      return el.getBoundingClientRect();
    },
    getViewportSize() {
      return { width: win.innerWidth, height: win.innerHeight };
    },
    getBody() {
      return getBody();
    },
    isDocumentFragment(node: any) {
      return !!node && node.nodeType === 11;
    },
    getChildNodes(node: any) {
      return Array.from(node.childNodes ?? []);
    },
    getParentNode(node: any) {
      return node.parentNode ?? null;
    },
    getNextSibling(node: any) {
      return node.nextSibling ?? null;
    },
    getFirstChild(node: any) {
      return node.firstChild ?? null;
    },
  };
}

export function installDomHost(options?: Parameters<typeof createDomHost>[0]) {
  const host = createDomHost(options);
  setHost(host);
  return host;
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  installDomHost();
}
