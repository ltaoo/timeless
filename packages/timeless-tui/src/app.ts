import {
  renderToScreen,
  renderToString,
  clearScreen,
  showCursor,
  hideCursor,
} from "./renderer";
import type { TuiNode } from "./nodes";
import { createTuiInput, parseKey, type KeyName } from "./modules/input";

export type TuiRenderFn = () => TuiNode;

export interface TuiApp {
  render(): void;
  start(): void;
  stop(): void;
  toString(): string;
  onResize(fn: () => void): void;
  onKey(fn: (key: KeyName) => void): void;
  offKey(fn: (key: KeyName) => void): void;
}

export function createTuiApp(
  renderFn: TuiRenderFn,
  options: { out?: NodeJS.WritableStream; in?: any } = {},
): TuiApp {
  const out = options.out ?? process.stdout;
  const input = createTuiInput(options.in);
  let running = false;
  let dirty = true;
  let rafId: ReturnType<typeof setTimeout> | null = null;
  let resizeFns: (() => void)[] = [];
  let keyFns = new Set<(key: KeyName) => void>();

  function doRender() {
    if (!dirty) return;
    dirty = false;
    const tree = renderFn();
    renderToScreen(tree, out);
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

  function handleResize() {
    for (const fn of resizeFns) fn();
    dirty = true;
    doRender();
  }

  function handleSIGINT() {
    app.stop();
    process.exit(0);
  }

  function handleRawKey(raw: string) {
    if (raw === "\x03") {
      handleSIGINT();
      return;
    }
    const key = parseKey(raw);
    for (const fn of keyFns) fn(key);
  }

  const app: TuiApp = {
    render() {
      scheduleRender();
    },

    start() {
      if (running) return;
      running = true;
      hideCursor(out);
      dirty = true;
      doRender();

      input.onKey(handleRawKey);
      input.start();

      process.stdout.on("resize", handleResize);
      process.on("SIGINT", handleSIGINT);
    },

    stop() {
      running = false;
      if (rafId !== null) {
        clearTimeout(rafId);
        rafId = null;
      }

      input.offKey(handleRawKey);
      input.stop();

      process.stdout.off("resize", handleResize);
      process.off("SIGINT", handleSIGINT);
      showCursor(out);
      clearScreen(out);
    },

    toString() {
      const tree = renderFn();
      return renderToString(tree);
    },

    onResize(fn: () => void) {
      resizeFns.push(fn);
    },

    onKey(fn: (key: KeyName) => void) {
      keyFns.add(fn);
    },

    offKey(fn: (key: KeyName) => void) {
      keyFns.delete(fn);
    },
  };

  return app;
}

// ─── Reactive primitives ────────────────────────────────────────

export type Ref<T> = {
  value: T;
  subscribe(sub: { onChange: (v: T) => void }): void;
  _unsubscribe(sub: { onChange: (v: T) => void }): void;
};

export function useReactive<T>(refs: Ref<T>[], app: TuiApp) {
  const sub = { onChange: () => app.render() };
  for (const r of refs) {
    r.subscribe(sub);
  }
  return () => {
    for (const r of refs) {
      r._unsubscribe(sub);
    }
  };
}

export function ref<T>(initial: T): Ref<T> {
  let _value = initial;
  const subs = new Set<{ onChange: (v: T) => void }>();

  return {
    get value() {
      return _value;
    },
    set value(v: T) {
      if (Object.is(_value, v)) return;
      _value = v;
      for (const s of subs) s.onChange(_value);
    },
    subscribe(sub) {
      subs.add(sub);
    },
    _unsubscribe(sub) {
      subs.delete(sub);
    },
  };
}
