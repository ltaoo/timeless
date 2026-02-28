import { set, has, get } from "./store";
import { refobj } from "./refobj";
import { Subscriber, isClassName, isRef } from "./types";

export function refarr<T>(items: T[], opt: Partial<{ key: any }> = {}) {
  let _local_value = items;
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
        if (action.type === "delete") {
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
  const _inner = [];
  const r = {
    __is_ref: true as const,
    _subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    _destroy() {
      deps.length = 0;
    },
    key: opt.key,
    get value() {
      return _local_value;
    },
    get(idx: number) {
      const vv = _local_value[idx];
      if (isRef(vv)) {
        return vv;
      }
      if (typeof vv === "object" && vv !== null) {
        if (has(vv)) {
          return get(vv);
        }
        _inner[idx] = refobj(vv);
      }
    },
    set(idx: number, item: any) {
      Array.prototype.splice.call(_local_value, idx, 1, item);
      notify({ type: "update", index: idx, item });
    },
    splice(idx: number, dcount: number, ...items: any[]) {
      Array.prototype.splice.call(_local_value, idx, dcount, ...items);
      notify({ type: "refresh" });
    },
    insert(idx: number, ...items: any[]) {
      Array.prototype.splice.call(_local_value, idx, 0, ...items);
      notify({
        type: "insert",
        index: idx,
        deleteCount: 0,
        items,
      });
    },
    push(...items: any[]) {
      Array.prototype.push.call(_local_value, ...items);
      notify({
        type: "insert",
        index: _local_value.length - items.length,
        deleteCount: 0,
        items,
      });
    },
    unshift(...items: any[]) {
      Array.prototype.unshift.call(_local_value, ...items);
      notify({
        type: "insert",
        index: 0,
        deleteCount: 0,
        items,
      });
    },
    delete(idx: number) {
      Array.prototype.splice.call(_local_value, idx, 1);
      notify({ type: "delete", index: idx, deleteCount: 1 });
    },
    as(items: T[] | ((cur: T[]) => T[])) {
      if (typeof items === "function") {
        _local_value = items(_local_value);
      } else {
        _local_value = items;
      }
      notify({ type: "refresh" });
    },
    filter(predicate: (item: T, index: number, array: T[]) => boolean) {
      return _local_value.filter(predicate);
    },
    includes(item: T) {
      return _local_value.includes(item);
    },
    refresh() {
      notify({ type: "refresh" });
    },
  };
  return r;
}
