import { Subscriber, Ref, isRef } from "./types";

export function ref<T = any>(v: T) {
  let _local_value = v;
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
    isSame(v: T) {
      return Object.is(_local_value, v);
    },
    isStrictEqual(v: T) {
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
  };
  return r;
}
