import { createTuiInput, parseKey, type KeyName } from "./input";
import {
  renderToScreen,
  clearScreen,
  showCursor,
  hideCursor,
  getTerminalSize,
} from "./renderer";
import type { TuiNode } from "./nodes";

export interface TuiGlobal {
  onKeydown(handler: (key: KeyName) => void): void;
  reload(): void;
  exit(): void;
  readonly cols: number;
  readonly rows: number;
}

const input = createTuiInput();
let appFn: (() => TuiNode) | null = null;
let target: NodeJS.WritableStream = process.stdout;
let running = false;
let rafId: ReturnType<typeof setTimeout> | null = null;
let dirty = false;
const keydownHandlers: ((key: KeyName) => void)[] = [];

function doRender() {
  if (!dirty || !appFn) return;
  dirty = false;
  const tree = appFn();
  renderToScreen(tree, target);
}

function scheduleRender() {
  if (dirty) return;
  dirty = true;
  if (!running) return;
  if (rafId !== null) return;
  rafId = setTimeout(() => {
    rafId = null;
    doRender();
  }, 0);
}

function handleRawKey(raw: string) {
  const key = parseKey(raw);
  for (const h of keydownHandlers) h(key);
}

function handleResize() {
  dirty = true;
  doRender();
}

function handleSIGINT() {
  TUI.exit();
  process.exit(0);
}

export const TUI: TuiGlobal = {
  onKeydown(handler: (key: KeyName) => void) {
    keydownHandlers.push(handler);
  },

  reload() {
    if (running) scheduleRender();
  },

  exit() {
    if (!running) return;
    running = false;
    if (rafId !== null) {
      clearTimeout(rafId);
      rafId = null;
    }
    input.offKey(handleRawKey);
    input.stop();
    process.stdout.off("resize", handleResize);
    process.off("SIGINT", handleSIGINT);
    showCursor(target);
    clearScreen(target);
    process.exit(0);
  },

  get cols() {
    return getTerminalSize().width;
  },

  get rows() {
    return getTerminalSize().height;
  },
};

export function _setAppFn(fn: () => TuiNode) {
  appFn = () => {
    keydownHandlers.length = 0;
    return fn();
  };
}

export function _startTui(out?: NodeJS.WritableStream) {
  if (running) return;
  running = true;
  target = out ?? process.stdout;
  hideCursor(target);
  dirty = true;
  doRender();
  input.onKey(handleRawKey);
  input.start();
  process.stdout.on("resize", handleResize);
  process.on("SIGINT", handleSIGINT);
}
