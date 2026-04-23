import { isRef } from "@timeless/reactive";

import {
  TimelessElement,
  ViewChildren,
  ViewChildrenArray,
  isElement,
  resolve_children,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { createOwner, getOwner, provide, runWithOwner } from "@/context";
import { BoxState } from "@/content/box";

import {
  ErrorBoundaryContext,
  ErrorBoundaryHandler,
} from "./error-boundary-context";

export type ErrorBoundaryProps = {
  fallback?: (error: unknown, reset: () => void) => ViewChildren;
  onError?: (error: unknown) => void;
  throwToGlobal?: boolean;
  onMounted?: (event: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

type ErrorBoundaryState = {
  error: unknown;
} & BoxState;

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error) {
    return error;
  }
  return "Unknown error";
}

function toThrowableError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(toErrorMessage(error));
}

function throwErrorToGlobal(error: unknown) {
  if (typeof globalThis === "undefined") {
    return;
  }

  if (typeof globalThis.reportError === "function") {
    globalThis.reportError(error);
    return;
  }

  const throwable = toThrowableError(error);
  if (typeof globalThis.queueMicrotask === "function") {
    globalThis.queueMicrotask(() => {
      throw throwable;
    });
    return;
  }

  setTimeout(() => {
    throw throwable;
  }, 0);
}

export function ErrorBoundary(
  props: ErrorBoundaryProps = {},
  children?: ViewChildren,
): TimelessElement<{ error: unknown }> {
  const {
    fallback,
    onError,
    throwToGlobal = false,
    onMounted,
    beforeUnmounted,
    onUnmounted,
  } = props;
  const owner = getOwner();
  const boundaryOwner = createOwner(owner);
  let $elm: any = null;

  const state: ErrorBoundaryState = {
    error: null,
    rendered: false,
    style: {},
    styleSet: [],
    attributes: {},
    dataset: {},
    children: [],
  };

  const methods = {
    normalize(children?: ViewChildren): ViewChildrenArray {
      if (children === null || children === undefined) {
        return [];
      }
      const resolved = resolve_children(children);
      if (!resolved) {
        return [];
      }
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    },
    build_nodes(next: ViewChildrenArray) {
      const result: (TimelessElement | null)[] = [];
      for (let i = 0; i < next.length; i += 1) {
        const child = next[i];
        if (child === null) {
          result[i] = null;
          continue;
        }
        if (isElement(child)) {
          result[i] = child;
          continue;
        }
        if (isRef(child)) {
          result[i] = Text(child);
          continue;
        }
        if (child) {
          result[i] = Text(String(child));
          continue;
        }
        result[i] = null;
      }
      return result;
    },
    evaluate<T>(fn: () => T): T {
      return runWithOwner(boundaryOwner, () => {
        provide(ErrorBoundaryContext, handler);
        return fn();
      });
    },
    reportError(error: unknown) {
      state.error = error;
      if (onError) {
        onError(error);
      }
      if (throwToGlobal) {
        throwErrorToGlobal(error);
      }
    },
    build_with_fallback(error: unknown) {
      if (!fallback) {
        return methods.build_nodes([`Error: ${toErrorMessage(error)}`]);
      }
      try {
        const next = methods.evaluate(() =>
          methods.normalize(fallback(error, methods.reset)),
        );
        return methods.build_nodes(next);
      } catch (fallbackError) {
        return methods.build_nodes([
          `Error: ${toErrorMessage(error)}; Fallback Error: ${toErrorMessage(fallbackError)}`,
        ]);
      }
    },
    rebuild() {
      try {
        const next = methods.evaluate(() => methods.normalize(children));
        state.error = null;
        state.children = methods.build_nodes(next);
      } catch (error) {
        methods.reportError(error);
        state.children = methods.build_with_fallback(error);
      }
      return state.children;
    },
    reset() {
      const next = methods.rebuild();
      if (!$elm) {
        return;
      }
      if (typeof $elm.removeChildren === "function") {
        $elm.removeChildren();
      }
      if (next.length > 0 && typeof $elm.insertChildren === "function") {
        $elm.insertChildren(next);
      }
    },
  };

  const handler: ErrorBoundaryHandler = {
    handle(error: unknown) {
      methods.reportError(error);
      return methods.build_with_fallback(error);
    },
    reset() {
      methods.reset();
    },
  };

  methods.rebuild();

  return {
    t: "fragment",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    get state() {
      return state;
    },
    get children() {
      return state.children;
    },
    set children(v) {
      state.children = v;
    },
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (onMounted) {
        onMounted(event);
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
      for (const child of state.children) {
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      for (const child of state.children) {
        if (isElement(child) && child.onUnmounted) {
          child.onUnmounted();
        }
      }
      state.rendered = false;
      $elm = null;
    },
  };
}
