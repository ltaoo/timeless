/**
 * Owner-based Context System for Timeless.
 *
 * Provides dependency injection through an owner chain,
 * similar to Solid.js's owner tracking.
 *
 * - `createContext()` defines a context key
 * - `provide()` stores a value on the current owner
 * - `use()` walks up the owner chain to find a value
 * - `Scope()` creates a new owner scope with lazy children evaluation
 *
 * Show/For automatically inherit the owner at creation time,
 * so their lazy callbacks (ok/render) can access provided context.
 */
import { Fragment } from "@/content/fragment";
import {
  TimelessElement,
  ViewChildren,
  resolve_children,
} from "@/content/type";
import {
  start_tracking,
  stop_tracking,
} from "@timeless/inner-reactive";

// === Owner ===

interface Owner {
  parent: Owner | null;
  context: Map<symbol, any>;
  disposables: (() => void)[];
}

let current_owner: Owner | null = null;

export function create_owner(parent: Owner | null = current_owner): Owner {
  return { parent, context: new Map(), disposables: [] };
}

export function run_with_owner<T>(owner: Owner, fn: () => T): T {
  const prev = current_owner;
  current_owner = owner;
  start_tracking(owner.disposables);
  try {
    return fn();
  } finally {
    stop_tracking();
    current_owner = prev;
  }
}

export function get_owner(): Owner | null {
  return current_owner;
}

/** Register a disposable with the current owner */
export function track_disposable(clean: () => void): void {
  if (current_owner) {
    current_owner.disposables.push(clean);
  }
}

/** Destroy all disposables registered with an owner */
export function dispose_owner(owner: Owner): void {
  for (const clean of owner.disposables) {
    clean();
  }
  owner.disposables.length = 0;
}

/** Dispose and clear disposables (for re-render cycles) */
export function clear_owner_disposables(owner: Owner): void {
  for (const clean of owner.disposables) {
    clean();
  }
  owner.disposables.length = 0;
}

// === Context API ===

export type Context<T> = { key: symbol; name?: string; defaultValue?: T };

export function createContext<T>(name?: string, defaultValue?: T): Context<T> {
  return { key: Symbol(name), name, defaultValue };
}

export function provide<T>(ctx: Context<T>, value: T): void {
  if (!current_owner) {
    throw new Error(
      `provide("${ctx.name ?? ""}") called outside of owner scope`,
    );
  }
  current_owner.context.set(ctx.key, value);
}

export function use<T>(ctx: Context<T>): T {
  let owner = current_owner;
  while (owner) {
    if (owner.context.has(ctx.key)) {
      return owner.context.get(ctx.key);
    }
    owner = owner.parent;
  }
  if (ctx.defaultValue !== undefined) {
    return ctx.defaultValue;
  }
  throw new Error(`Context "${ctx.name ?? ""}" not found`);
}

// === Scope ===

export function Scope(
  setup: () => void,
  children: ViewChildren,
): TimelessElement {
  const owner = create_owner(current_owner);
  const fragment = run_with_owner(owner, () => {
    setup();
    return Fragment({}, resolve_children(children));
  });
  const originalUnmounted = fragment.onUnmounted;
  fragment.onUnmounted = () => {
    originalUnmounted();
    dispose_owner(owner);
  };
  return fragment;
}
