import { Subscriber, TimelessRef } from "./types";

export function ref<T = any>(v: T): TimelessRef<T> {
  let _local_value = v;
  const _initial_value = v;
  const deps: Subscriber[] = [];
  function notify(action: {
    type: string;
    index?: number;
    deleteCount?: number;
    item?: any;
    items?: any;
  }) {
    for (let i = 0; i < deps.length; i += 1) {
      const ctx = deps[i];
      (() => {
        if (action.type === "insert") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (action.type === "update") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (ctx.onChange) {
          ctx.onChange(_local_value);
        }
      })();
    }
  }
  const r = {
    __is_ref: true as const,
    _subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    _destroy() {
      deps.length = 0;
    },
    get value() {
      return _local_value;
    },
    eq(v: T) {
      return _local_value === v;
    },
    isSame(v: unknown) {
      return Object.is(_local_value, v);
    },
    isStrictEqual(v: unknown) {
      return _local_value === v;
    },
    as(value: T | ((cur: T) => T)) {
      if (typeof value === "function") {
        _local_value = (value as (cur: T) => T)(_local_value);
      } else {
        _local_value = value;
      }
      notify({ type: "refresh" });
    },
    set(value: T) {
      _local_value = value;
      notify({ type: "refresh" });
    },
    update(fn: (current: T) => T) {
      _local_value = fn(_local_value);
      notify({ type: "refresh" });
    },
    reset() {
      _local_value = _initial_value;
      notify({ type: "refresh" });
    },
    toggle(): boolean {
      _local_value = !(_local_value as any) as T;
      notify({ type: "refresh" });
      return _local_value as any;
    },
    increment(amount: number = 1): number {
      _local_value = ((_local_value as any) + amount) as T;
      notify({ type: "refresh" });
      return _local_value as any;
    },
    decrement(amount: number = 1): number {
      _local_value = ((_local_value as any) - amount) as T;
      notify({ type: "refresh" });
      return _local_value as any;
    },
    append(suffix: string): string {
      _local_value = ((_local_value as any) + suffix) as T;
      notify({ type: "refresh" });
      return _local_value as any;
    },
    prepend(prefix: string): string {
      _local_value = (prefix + (_local_value as any)) as T;
      notify({ type: "refresh" });
      return _local_value as any;
    },
    clear() {
      if (typeof _local_value === "string") {
        _local_value = "" as T;
      } else if (typeof _local_value === "number") {
        _local_value = 0 as T;
      } else if (typeof _local_value === "boolean") {
        _local_value = false as T;
      } else if (Array.isArray(_local_value)) {
        (_local_value as any).length = 0;
      } else {
        _local_value = null as T;
      }
      notify({ type: "refresh" });
    },
    clone(): T {
      if (_local_value === null || _local_value === undefined)
        return _local_value;
      if (typeof _local_value === "object") {
        return JSON.parse(JSON.stringify(_local_value));
      }
      return _local_value;
    },
    isNullish(): boolean {
      return _local_value === null || _local_value === undefined;
    },
  };
  return r;
}
