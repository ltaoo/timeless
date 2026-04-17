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
import { TimelessElement, ViewChildren, resolve_children } from "@/content/type";

// === Owner ===

interface Owner {
  parent: Owner | null;
  context: Map<symbol, any>;
}

let currentOwner: Owner | null = null;

export function createOwner(parent: Owner | null = currentOwner): Owner {
  return { parent, context: new Map() };
}

export function runWithOwner<T>(owner: Owner, fn: () => T): T {
  const prev = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prev;
  }
}

export function getOwner(): Owner | null {
  return currentOwner;
}

// === Context API ===

export type Context<T> = { key: symbol; name?: string; defaultValue?: T };

export function createContext<T>(name?: string, defaultValue?: T): Context<T> {
  return { key: Symbol(name), name, defaultValue };
}

export function provide<T>(ctx: Context<T>, value: T): void {
  if (!currentOwner) {
    throw new Error(
      `provide("${ctx.name ?? ""}") called outside of owner scope`,
    );
  }
  currentOwner.context.set(ctx.key, value);
}

export function use<T>(ctx: Context<T>): T {
  let owner = currentOwner;
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
  const owner = createOwner(currentOwner);
  return runWithOwner(owner, () => {
    setup();
    return Fragment({}, resolve_children(children));
  });
}
