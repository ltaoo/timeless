import { DerivedRef, isRef, Ref, Subscriber, TimelessRef } from "./types";
import { __hmr_get_hot } from "./hmr";

export function ref<T = any>(v: T, __hmr_key?: string): TimelessRef<T> {
  const hot = __hmr_key ? __hmr_get_hot() : null;

  if (hot?.data?.__hmr_refs?.[__hmr_key!]) {
    v = hot.data.__hmr_refs[__hmr_key!].value;
  }

  let raw_value = v;
  const _initial_value = v;
  const deps: Subscriber<T>[] = [];
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
            // @ts-ignore
            ctx.onPatch(action);
          }
          return;
        }
        if (action.type === "update") {
          if (ctx.onPatch) {
            // @ts-ignore
            ctx.onPatch(action);
          }
          return;
        }
        if (ctx.onChange) {
          ctx.onChange(raw_value);
        }
      })();
    }
  }
  const r = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      deps.push(ctx);
      return function () {
        deps.splice(deps.indexOf(ctx), 1);
      };
    },
    destroy() {
      deps.length = 0;
    },
    get value() {
      return raw_value;
    },
    eq(v: T) {
      return raw_value === v;
    },
    isSame(v: unknown) {
      return Object.is(raw_value, v);
    },
    isStrictEqual(v: unknown) {
      return raw_value === v;
    },
    as(value: T | ((cur: T) => T)) {
      if (typeof value === "function") {
        raw_value = (value as (cur: T) => T)(raw_value);
      } else {
        raw_value = value;
      }
      notify({ type: "refresh" });
    },
    set(value: T) {
      raw_value = value;
      notify({ type: "refresh" });
    },
    update(fn: (current: T) => T) {
      raw_value = fn(raw_value);
      notify({ type: "refresh" });
    },
    reset() {
      raw_value = _initial_value;
      notify({ type: "refresh" });
    },
    toggle(): boolean {
      raw_value = !(raw_value as any) as T;
      notify({ type: "refresh" });
      return raw_value as any;
    },
    increment(amount: number = 1): number {
      raw_value = ((raw_value as any) + amount) as T;
      notify({ type: "refresh" });
      return raw_value as any;
    },
    decrement(amount: number = 1): number {
      raw_value = ((raw_value as any) - amount) as T;
      notify({ type: "refresh" });
      return raw_value as any;
    },
    append(suffix: string): string {
      raw_value = ((raw_value as any) + suffix) as T;
      notify({ type: "refresh" });
      return raw_value as any;
    },
    prepend(prefix: string): string {
      raw_value = (prefix + (raw_value as any)) as T;
      notify({ type: "refresh" });
      return raw_value as any;
    },
    clear() {
      if (typeof raw_value === "string") {
        raw_value = "" as T;
      } else if (typeof raw_value === "number") {
        raw_value = 0 as T;
      } else if (typeof raw_value === "boolean") {
        raw_value = false as T;
      } else if (Array.isArray(raw_value)) {
        (raw_value as any).length = 0;
      } else {
        raw_value = null as T;
      }
      notify({ type: "refresh" });
    },
    clone(): T {
      if (raw_value === null || raw_value === undefined) return raw_value;
      if (typeof raw_value === "object") {
        return JSON.parse(JSON.stringify(raw_value));
      }
      return raw_value;
    },
    isNullish(): boolean {
      return raw_value === null || raw_value === undefined;
    },
    lt(v: T | DerivedRef<T> | Ref<T>): boolean {
      const comparisonValue = isRef(v) ? (v as any).value : v;
      return (raw_value as any) < comparisonValue;
    },
    gt(v: T | DerivedRef<T> | Ref<T>): boolean {
      const comparisonValue = isRef(v) ? (v as any).value : v;
      return (raw_value as any) > comparisonValue;
    },
  };

  if (hot && __hmr_key) {
    hot.data.__hmr_refs[__hmr_key] = r;
  }

  return r;
}
