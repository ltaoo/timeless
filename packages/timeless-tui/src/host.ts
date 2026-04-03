import {
  setHost,
  setRenderer,
  type HeadlessHost,
  isElement,
  type TimelessElement,
  registerComponent,
  getRenderer,
  Grid,
  View,
  Txt,
  VNode,
} from "@timeless/timeless";

import {
  createTuiElement,
  createTuiText,
  createTuiFragment,
  isTuiNode,
  type TuiNode,
  type TuiElement,
} from "./nodes";
import {
  renderToString,
  renderToScreen as renderTuiNodeToScreen,
  showCursor,
} from "./renderer";
import { setTuiHost } from "./host-accessor";
import { _setAppFn, _startTui } from "./tui";
import { TuiGrid } from "./modules/grid";
import { TuiView } from "./modules/view";
import { TuiTxt } from "./modules/text";
import { createTuiInput, parseKey, type KeyName } from "./modules/input";

const { isDescriptor, mount, commitTree } = VNode;

type TuiHost = HeadlessHost & {
  getBody: NonNullable<HeadlessHost["getBody"]>;
  appendChild: NonNullable<HeadlessHost["appendChild"]>;
};

export function createTuiHost(
  options: { out?: NodeJS.WritableStream } = {},
): TuiHost {
  const out = options.out ?? process.stdout;
  const body = createTuiElement("body");

  return {
    kind: "tui",
    createElement(tag: string) {
      return createTuiElement(tag);
    },
    createElementNS(_namespace: string, tag: string) {
      return createTuiElement(tag);
    },
    createTextNode(text: string) {
      return createTuiText(text);
    },
    createDocumentFragment() {
      return createTuiFragment();
    },
    appendChild(parent: any, child: any) {
      if (!isTuiNode(parent) || !isTuiNode(child)) return;
      parent.appendChild(child);
    },
    removeChild(parent: any, child: any) {
      if (!isTuiNode(parent) || !isTuiNode(child)) return;
      parent.removeChild(child);
    },
    insertBefore(parent: any, child: any, before: any) {
      if (!isTuiNode(parent) || !isTuiNode(child)) return;
      parent.insertBefore(child, isTuiNode(before) ? before : null);
    },
    replaceChild(parent: any, newChild: any, oldChild: any) {
      if (!isTuiNode(parent) || !isTuiNode(newChild) || !isTuiNode(oldChild))
        return;
      parent.replaceChild(newChild, oldChild);
    },
    clearChildren(parent: any) {
      if (!isTuiNode(parent)) return;
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    },
    setAttribute(el: any, name: string, value: string) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      (el as TuiElement).setAttribute(name, value);
    },
    removeAttribute(el: any, name: string) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      (el as TuiElement).removeAttribute(name);
    },
    setClassName(el: any, className: string) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      (el as TuiElement).className = className;
    },
    setStyleText(el: any, cssText: string) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      (el as TuiElement).style = { cssText } as any;
    },
    patchStyle(el: any, patch: Record<string, string>) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      const tuiEl = el as TuiElement;
      for (const k of Object.keys(patch)) {
        tuiEl.style[k] = patch[k];
      }
    },
    setTextContent(node: any, text: string) {
      if (!isTuiNode(node)) return;
      node.textContent = text;
    },
    setInnerHTML(el: any, html: string) {
      if (!isTuiNode(el) || el.kind !== "element") return;
      (el as TuiElement).innerHTML = html;
      el.textContent = html;
    },
    setProperty(el: any, key: string, value: any) {
      if (!isTuiNode(el)) return;
      (el as any)[key] = value;
    },
    addEventListener(
      _target: any,
      _type: string,
      handler: any,
      _options?: any,
    ) {
      if (!isTuiNode(_target) || _target.kind !== "element") return;
      (_target as TuiElement).addEventListener(_type, handler);
    },
    removeEventListener(
      _target: any,
      _type: string,
      handler: any,
      _options?: any,
    ) {
      if (!isTuiNode(_target) || _target.kind !== "element") return;
      (_target as TuiElement).removeEventListener(_type, handler);
    },
    addDocumentEventListener(_type: string, _handler: any, _options?: any) {
      // no-op for TUI
    },
    removeDocumentEventListener(_type: string, _handler: any, _options?: any) {
      // no-op for TUI
    },
    patchBodyStyle(_patch: { cursor?: string; userSelect?: string }) {
      // no-op for TUI
    },
    setTimeout(handler: () => void, ms: number) {
      return setTimeout(handler, ms);
    },
    clearTimeout(id: any) {
      clearTimeout(id);
    },
    setPointerCapture() {},
    releasePointerCapture() {},
    focus() {},
    blur() {},
    querySelector(_root: any, _selector: string) {
      return null;
    },
    getBoundingClientRect(el: any) {
      if (!isTuiNode(el) || el.kind !== "element") {
        return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
      }
      const rect = (el as TuiElement).getBoundingClientRect() as any;
      const top = rect.top ?? 0;
      const left = rect.left ?? 0;
      const width = rect.width ?? 0;
      const height = rect.height ?? 0;
      const right = rect.right ?? left + width;
      const bottom = rect.bottom ?? top + height;
      return { top, left, right, bottom, width, height };
    },
    getViewportSize() {
      const ttyOut = out as any;
      return {
        width: ttyOut.columns || 80,
        height: ttyOut.rows || 24,
      };
    },
    getBody() {
      return body;
    },
    isDocumentFragment(node: any) {
      return isTuiNode(node) && node.kind === "fragment";
    },
    getChildNodes(node: any) {
      if (!isTuiNode(node)) return [];
      return node.childNodes;
    },
    getParentNode(node: any) {
      if (!isTuiNode(node)) return null;
      return node.parentNode;
    },
    getNextSibling(node: any) {
      if (!isTuiNode(node)) return null;
      return node.nextSibling;
    },
    getFirstChild(node: any) {
      if (!isTuiNode(node)) return null;
      return node.firstChild;
    },
  };
}

export function installTuiHost(options?: Parameters<typeof createTuiHost>[0]) {
  const host = createTuiHost(options);
  setHost(host);
  setTuiHost(host);
  return host;
}

// ─── render ─────────────────────────────────────────────────────

function registerTuiComponents() {
  registerComponent(Grid, TuiGrid);
  registerComponent(View, TuiView);
  registerComponent(Txt, TuiTxt);
}

export function render(
  appFn: (() => TuiNode | TuiNode[]) | TimelessElement | any,
  out?: NodeJS.WritableStream,
) {
  // Descriptor path (VNode pipeline)
  if (isDescriptor(appFn)) {
    const target = out ?? process.stdout;
    const host = installTuiHost({ out: target });
    registerTuiComponents();

    // Wrap the renderer so patchNode triggers a screen re-render
    const baseRenderer = getRenderer();
    let renderScheduled = false;
    const body = host.getBody() as TuiNode;

    const wrappedRenderer = {
      ...baseRenderer,
      patchNode(vnode: any, changes: any) {
        baseRenderer.patchNode(vnode, changes);
        if (!renderScheduled) {
          renderScheduled = true;
          queueMicrotask(() => {
            renderScheduled = false;
            renderTuiNodeToScreen(body, target);
          });
        }
      },
    };
    setRenderer(wrappedRenderer);

    const vnode = mount(appFn);
    commitTree(vnode, getRenderer());
    host.appendChild(body, vnode._hostNode);
    renderTuiNodeToScreen(body, target);

    // Setup input handling
    ensureInput();

    return;
  }

  if (typeof appFn === "function") {
    // Install TUI host so View/Txt from @timeless/primitive work
    installTuiHost({ out: out ?? process.stdout });

    // Wrap appFn to handle TuiNode[] return
    _setAppFn(() => {
      const result = appFn();
      if (Array.isArray(result)) {
        const root = createTuiFragment();
        for (const child of result) root.appendChild(child);
        return root;
      }
      return result;
    });

    return {
      start() {
        _startTui(out);
      },
    };
  }

  // Static TimelessElement render
  if (!appFn) {
    console.error("[TUI Render] Element is null");
    return;
  }
  if (isElement(appFn)) {
    const host = createTuiHost({ out });
    const content = appFn.render();
    if (!content) {
      console.error("[TUI Render] Element render returned null");
      return;
    }
    host.appendChild(host.getBody(), content);
    const target = out ?? process.stdout;
    renderTuiNodeToScreen(host.getBody() as TuiNode, target);
    return;
  }
  console.error("[TUI Render] Invalid element");
}

export function renderToStringTree(elm: TimelessElement): string {
  if (!elm || !isElement(elm)) return "";
  const host = createTuiHost();
  const content = elm.render();
  if (!content) return "";
  host.appendChild(host.getBody(), content);
  return renderToString(host.getBody() as TuiNode);
}

// ─── Platform ────────────────────────────────────────────────────

const keyNameToKeyboardKey: Record<string, string> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  return: "Enter",
  escape: "Escape",
  backspace: "Backspace",
  tab: "Tab",
  space: " ",
};

function toKeyboardKey(name: KeyName): string {
  return keyNameToKeyboardKey[name] ?? name;
}

type PlatformEventHandler = (event: any) => void;

const _platformState = {
  input: null as ReturnType<typeof createTuiInput> | null,
  keydownHandlers: new Set<PlatformEventHandler>(),
};

function cleanup() {
  if (_platformState.input) {
    _platformState.input.stop();
    _platformState.input = null;
  }
  showCursor(process.stdout);
}

function ensureInput() {
  if (_platformState.input) return _platformState.input;
  _platformState.input = createTuiInput();
  _platformState.input.onKey((raw: string) => {
    const name = parseKey(raw);
    const key = toKeyboardKey(name);
    // ctrl+c 默认退出
    if (name === "ctrl+c") {
      cleanup();
      process.exit(0);
    }
    const event = { type: "keydown", key, raw };
    for (const handler of _platformState.keydownHandlers) {
      handler(event);
    }
  });
  _platformState.input.start();
  return _platformState.input;
}

export const platform = {
  addEventListener(
    type: string,
    handler: PlatformEventHandler,
    _options?: any,
  ) {
    if (type === "keydown") {
      _platformState.keydownHandlers.add(handler);
      ensureInput();
    }
  },
  removeEventListener(
    type: string,
    handler: PlatformEventHandler,
    _options?: any,
  ) {
    if (type === "keydown") {
      _platformState.keydownHandlers.delete(handler);
      if (_platformState.keydownHandlers.size === 0 && _platformState.input) {
        _platformState.input.stop();
        _platformState.input = null;
      }
    }
  },
  quit() {
    cleanup();
    process.exit(0);
  },
};
