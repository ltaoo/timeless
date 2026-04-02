import {
  setHost,
  type HeadlessHost,
  isElement,
  type TimelessElement,
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
  renderToScreen,
  clearScreen,
  showCursor,
  hideCursor,
} from "./renderer";
import { setTuiHost } from "./host-accessor";
import { createTuiSingleton, type TuiGlobal } from "./tui";

export function createTuiHost(
  options: { out?: NodeJS.WritableStream } = {},
): HeadlessHost {
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
      return (el as TuiElement).getBoundingClientRect();
    },
    getViewportSize() {
      return {
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24,
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

// ─── Global TUI singleton ───────────────────────────────────────

let _tui: (TuiGlobal & { _setAppFn: Function; _start: Function }) | null = null;

export function getTuiSingleton(): TuiGlobal {
  if (!_tui) _tui = createTuiSingleton();
  return _tui;
}

// ─── render ─────────────────────────────────────────────────────

export function render(
  appFn: (() => TuiNode | TuiNode[]) | TimelessElement,
  out?: NodeJS.WritableStream,
) {
  if (typeof appFn === "function") {
    const tui = getTuiSingleton() as any;

    // Install TUI host so View/Txt from @timeless/primitive work
    installTuiHost({ out: out ?? process.stdout });

    // Wrap appFn to handle TuiNode[] return
    tui._setAppFn(() => {
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
        tui._start(out);
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
    renderToScreen(host.getBody() as TuiNode, target);
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
