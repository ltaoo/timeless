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
    get length() {
      return _local_value.length;
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
      const res = Array.prototype.splice.call(
        _local_value,
        idx,
        dcount,
        ...items,
      );
      notify({ type: "refresh" });
      return res;
    },
    insert(idx: number, ...items: any[]) {
      Array.prototype.splice.call(_local_value, idx, 0, ...items);
      notify({
        type: "insert",
        index: idx,
        deleteCount: 0,
        items,
      });
      return _local_value.length;
    },
    push(...items: any[]) {
      const res = Array.prototype.push.call(_local_value, ...items);
      notify({
        type: "insert",
        index: _local_value.length - items.length,
        deleteCount: 0,
        items,
      });
      return res;
    },
    unshift(...items: any[]) {
      const res = Array.prototype.unshift.call(_local_value, ...items);
      notify({
        type: "insert",
        index: 0,
        deleteCount: 0,
        items,
      });
      return res;
    },
    pop() {
      if (_local_value.length === 0) return undefined;
      const index = _local_value.length - 1;
      const item = Array.prototype.pop.call(_local_value);
      notify({ type: "delete", index, deleteCount: 1 });
      return item;
    },
    shift() {
      if (_local_value.length === 0) return undefined;
      const item = Array.prototype.shift.call(_local_value);
      notify({ type: "delete", index: 0, deleteCount: 1 });
      return item;
    },
    delete(idx: number) {
      Array.prototype.splice.call(_local_value, idx, 1);
      notify({ type: "delete", index: idx, deleteCount: 1 });
    },
    remove(item: T) {
      const index = _local_value.indexOf(item);
      if (index === -1) {
        return;
      }
      Array.prototype.splice.call(_local_value, index, 1);
      notify({ type: "delete", index, deleteCount: 1 });
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
    reverse() {
      Array.prototype.reverse.call(_local_value);
      notify({ type: "refresh" });
      return r;
    },
    sort(compareFn?: (a: T, b: T) => number) {
      Array.prototype.sort.call(_local_value, compareFn);
      notify({ type: "refresh" });
      return r;
    },
    fill(value: T, start?: number, end?: number) {
      Array.prototype.fill.call(_local_value, value, start, end);
      notify({ type: "refresh" });
      return r;
    },
    copyWithin(target: number, start: number, end?: number) {
      Array.prototype.copyWithin.call(_local_value, target, start, end);
      notify({ type: "refresh" });
      return r;
    },
    concat(...items: (ConcatArray<T> | T)[]) {
      return _local_value.concat(...items);
    },
    join(separator?: string) {
      return _local_value.join(separator);
    },
    slice(start?: number, end?: number) {
      return _local_value.slice(start, end);
    },
    indexOf(searchElement: T, fromIndex?: number) {
      return _local_value.indexOf(searchElement, fromIndex);
    },
    lastIndexOf(searchElement: T, fromIndex?: number) {
      return _local_value.lastIndexOf(searchElement, fromIndex);
    },
    every(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return _local_value.every(predicate, thisArg);
    },
    some(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return _local_value.some(predicate, thisArg);
    },
    forEach(
      callbackfn: (value: T, index: number, array: T[]) => void,
      thisArg?: any,
    ) {
      return _local_value.forEach(callbackfn, thisArg);
    },
    map<U>(
      callbackfn: (value: T, index: number, array: T[]) => U,
      thisArg?: any,
    ) {
      return _local_value.map(callbackfn, thisArg);
    },
    reduce(callbackfn: any, initialValue?: any) {
      return _local_value.reduce(callbackfn, initialValue);
    },
    reduceRight(callbackfn: any, initialValue?: any) {
      return _local_value.reduceRight(callbackfn, initialValue);
    },
    find(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      return _local_value.find(predicate, thisArg);
    },
    findIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      return _local_value.findIndex(predicate, thisArg);
    },
    entries() {
      return _local_value.entries();
    },
    keys() {
      return _local_value.keys();
    },
    values() {
      return _local_value.values();
    },
    flat(depth?: number) {
      return _local_value.flat(depth);
    },
    flatMap(callback: any, thisArg?: any) {
      return _local_value.flatMap(callback, thisArg);
    },
    toString() {
      return _local_value.toString();
    },
    toLocaleString() {
      return _local_value.toLocaleString();
    },
    [Symbol.iterator]() {
      return _local_value[Symbol.iterator]();
    },
  };
  return r;
}
