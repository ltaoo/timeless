import { set, has, get } from "./registry";
import { refObject } from "./reactive-object";
import { Subscriber, Ref, isClassName, isRef } from "./types";

export interface RefArray<T> extends Ref<T[]> {
  key: any;
  length: number;
  get(idx: number): any;
  set(idx: number, item: any): void;
  splice(idx: number, dcount: number, ...items: any[]): any[];
  insert(idx: number, ...items: any[]): number;
  push(...items: any[]): number;
  unshift(...items: any[]): number;
  pop(): any;
  shift(): any;
  delete(idx: number): void;
  remove(item: T): void;
  as(items: T[] | ((cur: T[]) => T[])): void;
  assign(items: T[]): void;
  refresh(): void;
  filter(predicate: (item: T, index: number, array: T[]) => boolean): any[];
  includes(item: T): boolean;
  reverse(): RefArray<T>;
  sort(compareFn?: (a: T, b: T) => number): RefArray<T>;
  fill(value: T, start?: number, end?: number): RefArray<T>;
  copyWithin(target: number, start: number, end?: number): RefArray<T>;
  concat(...items: (ConcatArray<T> | T)[]): T[];
  join(separator?: string): string;
  slice(start?: number, end?: number): any[];
  indexOf(searchElement: T, fromIndex?: number): number;
  lastIndexOf(searchElement: T, fromIndex?: number): number;
  every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;
  some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;
  forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
  reduce(callbackfn: any, initialValue?: any): any;
  reduceRight(callbackfn: any, initialValue?: any): any;
  find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): any;
  findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
  entries(): IterableIterator<[number, T]>;
  keys(): IterableIterator<number>;
  values(): IterableIterator<T>;
  flat(depth?: number): any[];
  flatMap(callback: any, thisArg?: any): any[];
  [Symbol.iterator](): Iterator<T>;
}

export function refArray<T>(items: T[], opt: Partial<{ key: any }> = {}): RefArray<T> {
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
  const _inner: any[] = [];
  const getProxy = (vv: any, idx?: number) => {
    if (isRef(vv)) {
      return vv;
    }
    if (typeof vv === "object" && vv !== null) {
      if (has(vv)) {
        return get(vv);
      }
      const proxy = refObject(vv);
      if (typeof idx === "number") {
        _inner[idx] = proxy;
      }
      return proxy;
    }
    return vv;
  };
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
    isSame(v: unknown) {
      return Object.is(_local_value, v);
    },
    isStrictEqual(v: unknown) {
      return _local_value === v;
    },
    get length() {
      return _local_value.length;
    },
    get(idx: number) {
      const vv = _local_value[idx];
      return getProxy(vv, idx);
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
      return res.map((item: any) => getProxy(item));
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
      return getProxy(item);
    },
    shift() {
      if (_local_value.length === 0) return undefined;
      const item = Array.prototype.shift.call(_local_value);
      notify({ type: "delete", index: 0, deleteCount: 1 });
      return getProxy(item);
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
    assign(items: T[]) {
      _local_value = items;
      _inner.length = 0;
      notify({ type: "refresh" });
    },
    filter(predicate: (item: T, index: number, array: T[]) => boolean) {
      return _local_value.filter(predicate).map((item: any) => getProxy(item));
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
      return _local_value.slice(start, end).map((item: any) => getProxy(item));
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
      const idx = _local_value.findIndex(predicate, thisArg);
      if (idx === -1) {
        return null;
      }
      const vv = _local_value[idx];
      return getProxy(vv, idx);
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
