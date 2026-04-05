import {
  type TimelessHost,
  type TimelessElement,
  setHost,
  getHost,
  isElement,
  registerComponent,
  Grid,
  View,
  Txt,
  VNode,
  isRef,
} from "@timeless/timeless";

import type { VNode as VNodeNS } from "@timeless/timeless";

import * as modules from "./modules/index";
import { viewStyleToCssText } from "./modules/style";

const { isDescriptor, mount, commitTree } = VNode;

console.log("dom.version" + __Version);

type AnyEventHandler = (event: any) => void;

export function createDomHost(
  options: {
    document?: Document;
    window?: Window;
    body?: HTMLElement | null;
  } = {},
): TimelessHost {
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
      const originalStopPropagation = (event as any).stopPropagation?.bind(
        event,
      );
      const originalStopImmediatePropagation = (
        event as any
      ).stopImmediatePropagation?.bind(event);

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
          (event as any).stopImmediatePropagation =
            originalStopImmediatePropagation;
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
      // Non-bubbling events must be bound directly to the target element
      const nonBubblingEvents = [
        "mouseenter",
        "mouseleave",
        "focus",
        "blur",
        "load",
        "unload",
        "scroll",
      ];
      if (nonBubblingEvents.includes(type)) {
        target.addEventListener(type, handler, options);
        return;
      }

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
    removeEventListener(
      target: any,
      type: string,
      handler: any,
      options?: any,
    ) {
      // Non-bubbling events are bound directly to the target element
      const nonBubblingEvents = [
        "mouseenter",
        "mouseleave",
        "focus",
        "blur",
        "load",
        "unload",
        "scroll",
      ];
      if (nonBubblingEvents.includes(type)) {
        target.removeEventListener(type, handler, options);
        return;
      }

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
      if (patch.userSelect !== undefined)
        body.style.userSelect = patch.userSelect;
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

export type HostOperation = {
  method: string;
  args: any[];
};

type RecordingState = {
  enabled: boolean;
  ops: HostOperation[];
};

let _recording: null | {
  host: TimelessHost;
  baseHost: TimelessHost;
  state: RecordingState;
} = null;

function ensureRecordingDomHost(): {
  host: TimelessHost;
  state: RecordingState;
} {
  const currentHost = getHost();
  if (_recording) {
    if (_recording.host === currentHost) {
      return { host: _recording.host, state: _recording.state };
    }
    if (_recording.baseHost === currentHost) {
      return { host: _recording.host, state: _recording.state };
    }
  }

  const baseHost = currentHost;

  const state: RecordingState = { enabled: false, ops: [] };
  const proxy = new Proxy(baseHost as any, {
    get(target, prop, receiver) {
      const v = Reflect.get(target, prop, receiver);
      if (typeof prop === "string" && typeof v === "function") {
        return (...args: any[]) => {
          if (state.enabled) state.ops.push({ method: prop, args });
          return v.apply(target, args);
        };
      }
      return v;
    },
  }) as TimelessHost;

  _recording = { host: proxy, baseHost, state };
  return { host: proxy, state };
}

// ─── Platform ────────────────────────────────────────────────────

export const platform = {
  addEventListener(type: string, handler: (event: any) => void, options?: any) {
    if (typeof window !== "undefined") {
      window.addEventListener(type, handler, options);
    }
  },
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) {
    if (typeof window !== "undefined") {
      window.removeEventListener(type, handler, options);
    }
  },
};

if (typeof document !== "undefined" && typeof window !== "undefined") {
  installDomHost();
}

/**
 * Register DOM-specific component implementations.
 */
function registerDomComponents() {
  registerComponent(Grid, modules.Grid);
  registerComponent(View, modules.View);
  registerComponent(Txt, modules.Txt);

  // registerComponent(Input, DomInput);
  // registerComponent(InputPrimitive.Root, DomInputRoot);
  // registerComponent(InputPrimitive.Input, DomInputField);

  // registerComponent(ButtonPrimitive.Root, DomButtonRoot);

  // registerComponent(CheckboxPrimitive.Root, DomCheckboxRoot);
  // registerComponent(CheckboxPrimitive.Box, DomCheckboxBox);
  // registerComponent(CheckboxPrimitive.Indicator, DomCheckboxIndicator);
  // registerComponent(CheckboxPrimitive.Input, DomCheckboxInput);
  // registerComponent(CheckboxPrimitive.Label, DomCheckboxLabel);
  // registerComponent(CheckboxPrimitive.Group, DomCheckboxGroup);
  // registerComponent(CheckboxPrimitive.GroupItem, DomCheckboxGroupItem);

  // registerComponent(RadioPrimitive.Root, DomRadioRoot);
  // registerComponent(RadioPrimitive.Box, DomRadioBox);
  // registerComponent(RadioPrimitive.Indicator, DomRadioIndicator);
  // registerComponent(RadioPrimitive.Input, DomRadioInput);
  // registerComponent(RadioPrimitive.Label, DomRadioLabel);
  // registerComponent(RadioPrimitive.Group, DomRadioGroup);
  // registerComponent(RadioPrimitive.GroupItem, DomRadioGroupItem);
}

/**
 * Render a TimelessElement or ElementDescriptor into a DOM container.
 * @param elm - The element or descriptor to render
 * @param $root - The DOM container element
 */
export function render(
  elm: TimelessElement | VNodeNS.ElementDescriptor,
  $root: HTMLElement | null,
  extra: Partial<{
    onVNodeCreated: (data: any) => void;
  }> = {},
) {
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  const { host, state } = ensureRecordingDomHost();

  setHost(host);
  registerDomComponents();

  const ops: HostOperation[] = [];
  state.ops = ops;
  state.enabled = true;

  try {
    // if (isDescriptor(elm as any)) {
    //   const vnode = mount(elm as any);
    //   commitTree(vnode, getRenderer());
    //   if (!vnode._hostNode) {
    //     console.error("[Render] VNode commit missing host node");
    //     return;
    //   }
    //   host.appendChild($root, vnode._hostNode);
    //   extra.onVNodeCreated?.({ vnode, ops });
    //   return { vnode, ops };
    // }

    function build(elm: TimelessElement) {
      // console.log("build elm", elm.t, elm.value);
      if (elm.t === "view") {
        const $elm = document.createElement("div");
        if (elm.props?.style) {
          $elm.style = viewStyleToCssText(elm.props.style);
        }
        // console.log("build elm before style sets", elm.props?.styleSets);
        if (elm.props?.styleSets) {
          if (isRef(elm.props.styleSets)) {
            $elm.className = elm.props.styleSets.value.join(" ");
          } else {
            $elm.className = elm.props.styleSets.join(" ");
          }
        }
        if (elm.children) {
          for (const child of elm.children) {
            const $sub = build(child);
            if ($sub) {
              $elm.appendChild($sub);
            }
          }
        }
        return $elm;
      }
      if (elm.t === "text" && elm.value) {
        const $elm = document.createTextNode(elm.value);
        return $elm;
      }
      if (elm.t === "grid") {
        const $elm = document.createElement("div");
        $elm.style = "display: grid;";
        return $elm;
      }
      if (elm.t === "for") {
        const $elm = document.createDocumentFragment();
        if (elm.children) {
          for (const child of elm.children) {
            const $sub = build(child);
            if ($sub) {
              $elm.appendChild($sub);
            }
          }
        }
        return $elm;
      }
      return null;
    }

    if (isElement(elm)) {
      // const $content = elm.render();
      const $content = build(elm);
      if (!$content) {
        console.error("[Render] Element render return null");
        return;
      }
      $root.appendChild($content);
      return { $content, ops };
    }

    console.error("[Render] Root Element can't be lazy element");
    return;
  } finally {
    state.enabled = false;
    state.ops = [];
  }
}

/**
 * Hydrate a virtual node tree onto existing server-rendered DOM.
 * This reuses the existing DOM nodes and attaches event listeners and reactive subscriptions.
 *
 * @param vnode - The virtual node tree to hydrate
 * @param container - The DOM container element with server-rendered content
 */
export function hydrate(
  vnode: TimelessElement,
  container: HTMLElement | null,
): void {
  if (!vnode) {
    console.error("[Hydrate] Invalid vnode");
    return;
  }
  if (!container) {
    console.error("[Hydrate] Container element not found");
    return;
  }

  const host = createDomHost();
  const firstChild = host.getFirstChild(container);

  if (!firstChild) {
    console.warn("[Hydrate] No SSR content found, falling back to render");
    render(vnode, container);
    return;
  }

  // Perform hydration
  hydrateNode(vnode, firstChild, host);
}

/**
 * Recursively hydrate a virtual node onto an existing DOM node.
 */
function hydrateNode(
  vnode: TimelessElement,
  domNode: any,
  host: TimelessHost,
): any {
  if (!vnode || !domNode) {
    return domNode;
  }

  const vnodeType = (vnode as any).t;

  switch (vnodeType) {
    case "view":
      return hydrateView(vnode, domNode, host);
    case "text":
      return hydrateText(vnode, domNode, host);
    case "for":
      return hydrateFor(vnode, domNode, host);
    case "show":
      return hydrateShow(vnode, domNode, host);
    default:
      // Unknown type, try to use hydrate method if available
      if (typeof (vnode as any).hydrate === "function") {
        return (vnode as any).hydrate(domNode);
      }
      // Fallback to render
      return vnode.render();
  }
}

/**
 * Hydrate a View component.
 */
function hydrateView(
  vnode: TimelessElement,
  domNode: any,
  host: TimelessHost,
): any {
  const props = (vnode as any)._props || {};
  const expectedTag = (props.as || "div").toUpperCase();
  const actualTag = domNode.nodeName || domNode.tagName || "";

  // Validate tag match
  if (actualTag.toUpperCase() !== expectedTag) {
    console.warn(
      `[Hydrate] Tag mismatch: expected ${expectedTag}, got ${actualTag}. Falling back to render.`,
    );
    return vnode.render();
  }

  // Use the hydrate method
  if (typeof (vnode as any).hydrate === "function") {
    return (vnode as any).hydrate(domNode);
  }

  // Fallback
  vnode.$elm = domNode;
  return vnode.render();
}

/**
 * Hydrate a Text component.
 */
function hydrateText(
  vnode: TimelessElement,
  domNode: any,
  host: TimelessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    return (vnode as any).hydrate(domNode);
  }

  vnode.$elm = domNode;
  return vnode.render();
}

/**
 * Hydrate a For component.
 */
function hydrateFor(
  vnode: TimelessElement,
  domNode: any,
  host: TimelessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    const parent = host.getParentNode(domNode);
    return (vnode as any).hydrate(domNode, parent);
  }

  return vnode.render();
}

/**
 * Hydrate a Show component.
 */
function hydrateShow(
  vnode: TimelessElement,
  domNode: any,
  host: TimelessHost,
): any {
  if (typeof (vnode as any).hydrate === "function") {
    const parent = host.getParentNode(domNode);
    return (vnode as any).hydrate(domNode, parent);
  }

  return vnode.render();
}
