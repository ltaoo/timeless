import {
  isElement,
  // type TimelessHost,
  type TimelessElement,
} from "@timeless/timeless";

import {
  createTuiElement,
  createTuiText,
  createTuiFragment,
  isTuiNode,
  setTuiInvalidator,
  setTuiInvalidationPaused,
  type TuiNode,
  type TuiElement,
} from "./host/nodes";
import {
  renderToString,
  renderToScreen as renderTuiNodeToScreen,
  showCursor,
} from "./host/draw";
import { build } from "./renderer/index";
// import { setTuiHost } from "./host-accessor";
import { createTuiInput, parseKey, type KeyName } from "./modules/input";

// import { _setAppFn, _startTui } from "./tui";

// const { isDescriptor, mount, commitTree } = VNode;

// type TuiHost = TimelessHost & {
//   getBody: NonNullable<TimelessHost["getBody"]>;
//   appendChild: NonNullable<TimelessHost["appendChild"]>;
// };

type RenderOptions = Partial<{
  out: NodeJS.WritableStream;
}>;

function normalizeOut(
  outOrOptions: unknown,
): NodeJS.WritableStream | undefined {
  if (!outOrOptions) return undefined;
  if (typeof outOrOptions === "object") {
    const direct = outOrOptions as any;
    if (typeof direct.write === "function")
      return direct as NodeJS.WritableStream;
    const nested = direct.out;
    if (nested && typeof nested.write === "function")
      return nested as NodeJS.WritableStream;
  }
  return undefined;
}

function normalizeCssKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("-")) return trimmed.toLowerCase();
  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function parseCssProps(cssText: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of String(cssText || "").split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const k = normalizeCssKey(part.slice(0, idx));
    const v = part.slice(idx + 1).trim();
    if (!k || !v) continue;
    props[k] = v;
  }
  return props;
}

function isGridElement(el: TuiElement) {
  const cssText = (el.style as any)?.cssText ?? "";
  const p = parseCssProps(cssText);
  if (p.display === "grid") return true;
  if (p["grid-template-columns"] || p.columns || p["grid-columns"]) return true;
  return false;
}

function isHiddenElement(el: TuiElement) {
  const cssText = (el.style as any)?.cssText ?? "";
  const p = parseCssProps(cssText);
  const opacity = p.opacity;
  if (opacity !== undefined) {
    const n = Number.parseFloat(opacity);
    if (Number.isFinite(n) && n <= 0) return true;
  }
  return false;
}

function resolveGridColumnsFromEl(el: TuiElement): number {
  const cssText = (el.style as any)?.cssText ?? "";
  const p = parseCssProps(cssText);
  const raw =
    p["grid-template-columns"] ?? p.columns ?? p["grid-columns"] ?? "";
  if (!raw) return 4;
  const m1 = /repeat\(\s*(\d+)/i.exec(raw);
  if (m1) {
    const n = Number.parseInt(m1[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const m2 = /(\d+)/.exec(raw);
  if (m2) {
    const n = Number.parseInt(m2[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 4;
}

type GridFocusContext = {
  grid: TuiElement;
  cols: number;
  cells: TuiElement[];
};

function collectGridFocusContexts(root: TuiNode): GridFocusContext[] {
  const out: GridFocusContext[] = [];
  const stack: TuiNode[] = [root];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur.kind === "element") {
      const el = cur as TuiElement;
      if (isHiddenElement(el)) {
        continue;
      }
      if (isGridElement(el)) {
        const cells = el.childNodes.filter(
          (n): n is TuiElement => n.kind === "element",
        );
        if (cells.length > 0) {
          out.push({ grid: el, cols: resolveGridColumnsFromEl(el), cells });
        }
      }
    }
    for (let i = cur.childNodes.length - 1; i >= 0; i--) {
      stack.push(cur.childNodes[i]);
    }
  }
  return out;
}

type FocusState =
  | { kind: "node"; node: TuiElement }
  | { kind: "grid"; grid: TuiElement; index: number };

let _focused: FocusState | null = null;
let _activeBody: TuiNode | null = null;

function clearFocusedAttr(el: TuiElement | null) {
  if (!el) return;
  if (el.getAttribute("data-focused") === "true") {
    el.removeAttribute("data-focused");
  }
}

function applyNodeFocus(node: TuiElement) {
  if (_focused?.kind === "node") {
    clearFocusedAttr(_focused.node);
  } else if (_focused?.kind === "grid") {
    const prevCells = _focused.grid.childNodes.filter(
      (n): n is TuiElement => n.kind === "element",
    );
    clearFocusedAttr(prevCells[_focused.index] ?? null);
  }
  node.setAttribute("data-focused", "true");
  _focused = { kind: "node", node };
}

function applyGridFocus(ctx: GridFocusContext, index: number) {
  const nextIndex = Math.max(0, Math.min(index, ctx.cells.length - 1));
  const nextCell = ctx.cells[nextIndex];

  if (_focused?.kind === "node") {
    clearFocusedAttr(_focused.node);
  } else if (_focused?.kind === "grid") {
    const prevGrid = _focused.grid;
    const prevIndex = _focused.index;
    if (prevGrid === ctx.grid) {
      const prevCell = ctx.cells[prevIndex];
      clearFocusedAttr(prevCell ?? null);
    } else {
      const prevCells = prevGrid.childNodes.filter(
        (n): n is TuiElement => n.kind === "element",
      );
      clearFocusedAttr(prevCells[prevIndex] ?? null);
    }
  }

  nextCell.setAttribute("data-focused", "true");
  _focused = { kind: "grid", grid: ctx.grid, index: nextIndex };
}

function collectFocusableNodes(body: TuiNode): TuiElement[] {
  const out: TuiElement[] = [];
  const stack: TuiNode[] = [body];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur.kind === "element") {
      const el = cur as TuiElement;
      if (isHiddenElement(el)) continue;
      if (isGridElement(el)) {
        continue;
      }
      if (el.hasEventListener?.("click")) {
        out.push(el);
      }
    }
    for (let i = cur.childNodes.length - 1; i >= 0; i--) {
      stack.push(cur.childNodes[i]);
    }
  }
  return out;
}

function findFocusedElement(body: TuiNode): TuiElement | null {
  const stack: TuiNode[] = [body];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur.kind === "element") {
      const el = cur as TuiElement;
      if (el.getAttribute("data-focused") === "true") return el;
    }
    for (let i = cur.childNodes.length - 1; i >= 0; i--) {
      stack.push(cur.childNodes[i]);
    }
  }
  return null;
}

function ensureDefaultFocus(body: TuiNode) {
  const existing = findFocusedElement(body);
  if (existing) {
    if (!_focused) {
      _focused = { kind: "node", node: existing };
    }
    return;
  }

  const focusables = collectFocusableNodes(body);
  if (focusables.length > 0) {
    applyNodeFocus(focusables[0]);
    return;
  }

  const ctxs = collectGridFocusContexts(body);
  if (ctxs.length > 0) {
    applyGridFocus(ctxs[0], 0);
  }
}

function focusedInGridContext(ctxs: GridFocusContext[], focusedEl: TuiElement) {
  for (const ctx of ctxs) {
    const idx = ctx.cells.indexOf(focusedEl);
    if (idx !== -1) return { ctx, index: idx };
  }
  return null;
}

function handleDefaultNavigation(body: TuiNode, event: any): boolean {
  const key = event?.key;
  const isArrow =
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === "ArrowDown";
  const isEnter = key === "Enter";
  const isBack = key === "Escape" || key === "Backspace";

  if (!isArrow && !isEnter && !isBack) return false;

  ensureDefaultFocus(body);

  const focusables = collectFocusableNodes(body);
  const ctxs = collectGridFocusContexts(body);
  const focusedEl = findFocusedElement(body);
  if (!focusedEl) return false;

  if (isEnter) {
    if (focusedEl.hasEventListener?.("click")) {
      focusedEl.dispatchEvent?.("click", { type: "click", key: "Enter" });
      return true;
    }
    return false;
  }

  const gridHit = focusedInGridContext(ctxs, focusedEl);

  if (isBack) {
    if (gridHit && focusables.length > 0) {
      applyNodeFocus(focusables[focusables.length - 1]);
      return true;
    }
    return false;
  }

  if (!gridHit) {
    const idx = focusables.indexOf(focusedEl);
    if (idx === -1) {
      if (focusables.length > 0) {
        applyNodeFocus(focusables[0]);
        return true;
      }
      if (ctxs.length > 0) {
        applyGridFocus(ctxs[0], 0);
        return true;
      }
      return false;
    }

    if (key === "ArrowUp") {
      if (idx > 0) {
        applyNodeFocus(focusables[idx - 1]);
        return true;
      }
      return true;
    }

    if (key === "ArrowDown") {
      if (idx < focusables.length - 1) {
        applyNodeFocus(focusables[idx + 1]);
        return true;
      }
      if (ctxs.length > 0) {
        applyGridFocus(ctxs[0], 0);
        return true;
      }
      return true;
    }

    return false;
  }

  const ctx = gridHit.ctx;
  const index = gridHit.index;

  const cols = Math.max(1, ctx.cols);
  const maxY = Math.floor((ctx.cells.length - 1) / cols);
  let x = index % cols;
  let y = Math.floor(index / cols);

  const maxXAtRow = (row: number) => {
    if (row === maxY) return (ctx.cells.length - 1) % cols;
    return cols - 1;
  };

  if (key === "ArrowLeft") {
    if (x > 0) x -= 1;
    else if (y > 0) {
      y -= 1;
      x = maxXAtRow(y);
    }
  }

  if (key === "ArrowRight") {
    const maxX = maxXAtRow(y);
    if (x < maxX) x += 1;
    else if (y < maxY) {
      y += 1;
      x = 0;
    }
  }

  if (key === "ArrowUp") {
    if (y > 0) {
      y -= 1;
      x = Math.min(x, maxXAtRow(y));
    } else if (focusables.length > 0) {
      applyNodeFocus(focusables[focusables.length - 1]);
      return true;
    }
  }

  if (key === "ArrowDown") {
    if (y < maxY) {
      y += 1;
      x = Math.min(x, maxXAtRow(y));
    }
  }

  const nextIndex = y * cols + x;
  applyGridFocus(ctx, nextIndex);
  return true;
}

export function createTuiHost(
  options: { out?: NodeJS.WritableStream } = {},
): any {
  const out = options.out ?? process.stdout;
  const body = createTuiElement("body");
  _activeBody = body;

  let scheduled = false;
  const scheduleRender = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      ensureDefaultFocus(body);
      renderTuiNodeToScreen(body, out);
      scheduled = false;
    });
  };
  setTuiInvalidator(scheduleRender);

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
  // setHost(host);
  // setTuiHost(host);
  return host;
}

export function render(
  elm: TimelessElement,
  outOrOptions?: NodeJS.WritableStream | RenderOptions,
) {
  if (isElement(elm)) {
    const target = process.stdout;
    const host = installTuiHost({ out: target });

    setTuiInvalidationPaused(true);
    const content = build(elm);
    if (!content) {
      setTuiInvalidationPaused(false);
      console.error("[TUI Render] Element render returned null");
      return;
    }
    const contentNode = content.$elm;
    if (!contentNode) {
      setTuiInvalidationPaused(false);
      console.error("[TUI Render] Element render returned null node");
      return;
    }
    host.appendChild(host.getBody(), contentNode);
    ensureDefaultFocus(host.getBody() as TuiNode);
    setTuiInvalidationPaused(false);
    renderTuiNodeToScreen(host.getBody() as TuiNode, target);
    ensureInput();
    return;
  }
  console.error("[TUI Render] Invalid element");
}

export function renderToStringTree(elm: TimelessElement): string {
  if (!elm || !isElement(elm)) return "";
  setTuiInvalidationPaused(true);
  const body = createTuiElement("body");
  const content = build(elm);
  setTuiInvalidationPaused(false);
  if (!content) return "";
  const contentNode = content.$elm;
  if (!contentNode) return "";
  body.appendChild(contentNode);
  return renderToString(body as TuiNode);
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
    if (_activeBody && handleDefaultNavigation(_activeBody, event)) {
      for (const handler of _platformState.keydownHandlers) {
        handler(event);
      }
      return;
    }
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
