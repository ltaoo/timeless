import { has, get } from "./registry";
import { refObject } from "./reactive-object";
import { Subscriber, Ref, isRef, TimelessRefArray } from "./types";

export interface RefArray<T> extends Ref<T[]> {
  key: unknown;
  length: number;
  get(idx: number): T | undefined;
  set(idx: number, item: T): void;
  splice(idx: number, dcount: number, ...items: T[]): T[];
  insert(idx: number, ...items: T[]): number;
  push(...items: T[]): number;
  unshift(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  delete(idx: number): void;
  remove(item: T): void;
  as(items: T[] | ((cur: T[]) => T[])): void;
  assign(items: T[]): void;
  refresh(): void;
  filter(predicate: (item: T, index: number, array: T[]) => boolean): T[];
  includes(item: T): boolean;
  reverse(): RefArray<T>;
  sort(compareFn?: (a: T, b: T) => number): RefArray<T>;
  fill(value: T, start?: number, end?: number): RefArray<T>;
  copyWithin(target: number, start: number, end?: number): RefArray<T>;
  concat(...items: (ConcatArray<T> | T)[]): T[];
  join(separator?: string): string;
  slice(start?: number, end?: number): T[];
  indexOf(searchElement: T, fromIndex?: number): number;
  lastIndexOf(searchElement: T, fromIndex?: number): number;
  every(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ): boolean;
  some(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ): boolean;
  forEach(
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: unknown,
  ): void;
  map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: unknown,
  ): U[];
  reduce: {
    <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ): U;
    (
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => T,
    ): T;
  };
  reduceRight: {
    <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ): U;
    (
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => T,
    ): T;
  };
  find(
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: unknown,
  ): T | undefined;
  findIndex(
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: unknown,
  ): number;
  entries(): IterableIterator<[number, T]>;
  keys(): IterableIterator<number>;
  values(): IterableIterator<T>;
  flat<D extends number = 1>(depth?: D): FlatArray<T[], D>[];
  flatMap(
    callback: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ): any[];
  [Symbol.iterator](): Iterator<T>;

  move(fromIndex: number, toIndex: number): RefArray<T>;
  swap(indexA: number, indexB: number): RefArray<T>;
  moveToFirst(index: number): RefArray<T>;
  moveToLast(index: number): RefArray<T>;
  toggle(item: T): RefArray<T>;
  removeBy(predicate: (item: T, index: number) => boolean): void;
  clear(): void;
  replace(oldItem: T, newItem: T): boolean;
  prepend(...items: T[]): number;
  first(): T | undefined;
  last(): T | undefined;
  nth(index: number): T | undefined;
  count(predicate?: (item: T, index: number) => boolean): number;
  distinct(keyFn?: (item: T) => unknown): T[];
  groupBy(keyFn: (item: T) => string | number): Record<string | number, T[]>;
  chunk(size: number): T[][];
  partition(predicate: (item: T, index: number) => boolean): [T[], T[]];
  intersect(other: T[]): T[];
  union(...others: T[][]): T[];
  diff(other: T[]): T[];
  symmetricDiff(other: T[]): T[];
  sum(fn?: (item: T) => number): number;
  min(fn?: (item: T) => number): T | undefined;
  max(fn?: (item: T) => number): T | undefined;
  shuffle(): RefArray<T>;
  rotate(n: number): RefArray<T>;
  compact(): T[];
  take(n: number): T[];
  skip(n: number): T[];
  isEmpty(): boolean;
  at(index: number): T | undefined;
  toArray(): T[];
}

export function refArray<T>(
  items: T[],
  opt: Partial<{ key: any }> = {},
): TimelessRefArray<T> {
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
    move(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex) return r;
      if (
        fromIndex < 0 ||
        fromIndex >= _local_value.length ||
        toIndex < 0 ||
        toIndex > _local_value.length
      )
        return r;
      const [item] = Array.prototype.splice.call(_local_value, fromIndex, 1);
      Array.prototype.splice.call(_local_value, toIndex, 0, item);
      notify({ type: "refresh" });
      return r;
    },
    swap(indexA: number, indexB: number) {
      if (indexA === indexB) return r;
      if (
        indexA < 0 ||
        indexA >= _local_value.length ||
        indexB < 0 ||
        indexB >= _local_value.length
      )
        return r;
      const temp = _local_value[indexA];
      _local_value[indexA] = _local_value[indexB];
      _local_value[indexB] = temp;
      notify({ type: "refresh" });
      return r;
    },
    moveToFirst(index: number) {
      return r.move(index, 0);
    },
    moveToLast(index: number) {
      return r.move(index, _local_value.length - 1);
    },
    toggle(item: T) {
      const idx = _local_value.indexOf(item);
      if (idx === -1) {
        r.push(item);
      } else {
        r.delete(idx);
      }
      return r;
    },
    removeBy(predicate: (item: T, index: number) => boolean) {
      for (let i = _local_value.length - 1; i >= 0; i--) {
        if (predicate(_local_value[i], i)) {
          Array.prototype.splice.call(_local_value, i, 1);
        }
      }
      notify({ type: "refresh" });
    },
    clear() {
      _local_value.length = 0;
      _inner.length = 0;
      notify({ type: "refresh" });
    },
    replace(oldItem: T, newItem: T) {
      const idx = _local_value.indexOf(oldItem);
      if (idx === -1) return false;
      Array.prototype.splice.call(_local_value, idx, 1, newItem);
      notify({ type: "update", index: idx, item: newItem });
      return true;
    },
    prepend(...items: T[]) {
      return r.unshift(...items);
    },
    first() {
      if (_local_value.length === 0) return undefined;
      return getProxy(_local_value[0], 0);
    },
    last() {
      if (_local_value.length === 0) return undefined;
      const idx = _local_value.length - 1;
      return getProxy(_local_value[idx], idx);
    },
    nth(index: number) {
      const len = _local_value.length;
      const idx = index < 0 ? len + index : index;
      if (idx < 0 || idx >= len) return undefined;
      return getProxy(_local_value[idx], idx);
    },
    count(predicate?: (item: T, index: number) => boolean) {
      if (!predicate) return _local_value.length;
      let count = 0;
      for (let i = 0; i < _local_value.length; i++) {
        if (predicate(_local_value[i], i)) count++;
      }
      return count;
    },
    distinct(keyFn?: (item: T) => any) {
      const seen = new Set();
      const result: T[] = [];
      for (const item of _local_value) {
        const key = keyFn ? keyFn(item) : item;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }
      return result;
    },
    groupBy(keyFn: (item: T) => string | number) {
      const groups: Record<string | number, T[]> = {};
      for (const item of _local_value) {
        const key = keyFn(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
      return groups;
    },
    chunk(size: number) {
      if (size <= 0) return [];
      const chunks: T[][] = [];
      for (let i = 0; i < _local_value.length; i += size) {
        chunks.push(_local_value.slice(i, i + size));
      }
      return chunks;
    },
    partition(predicate: (item: T, index: number) => boolean) {
      const pass: T[] = [];
      const fail: T[] = [];
      for (let i = 0; i < _local_value.length; i++) {
        if (predicate(_local_value[i], i)) {
          pass.push(_local_value[i]);
        } else {
          fail.push(_local_value[i]);
        }
      }
      return [pass, fail] as [T[], T[]];
    },
    intersect(other: T[]) {
      const set = new Set(other);
      return _local_value.filter((item) => set.has(item));
    },
    union(...others: T[][]) {
      const seen = new Set();
      const result: T[] = [];
      for (const arr of [_local_value, ...others]) {
        for (const item of arr) {
          if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
          }
        }
      }
      return result;
    },
    diff(other: T[]) {
      const set = new Set(other);
      return _local_value.filter((item) => !set.has(item));
    },
    symmetricDiff(other: T[]) {
      const setA = new Set(_local_value);
      const setB = new Set(other);
      const result: T[] = [];
      for (const item of _local_value) {
        if (!setB.has(item)) result.push(item);
      }
      for (const item of other) {
        if (!setA.has(item)) result.push(item);
      }
      return result;
    },
    sum(fn?: (item: T) => number) {
      let total = 0;
      for (const item of _local_value) {
        total += fn ? fn(item) : (item as any);
      }
      return total;
    },
    min(fn?: (item: T) => number) {
      if (_local_value.length === 0) return undefined;
      let minVal = fn ? fn(_local_value[0]) : (_local_value[0] as any);
      let result = _local_value[0];
      for (let i = 1; i < _local_value.length; i++) {
        const val = fn ? fn(_local_value[i]) : (_local_value[i] as any);
        if (val < minVal) {
          minVal = val;
          result = _local_value[i];
        }
      }
      return result;
    },
    max(fn?: (item: T) => number) {
      if (_local_value.length === 0) return undefined;
      let maxVal = fn ? fn(_local_value[0]) : (_local_value[0] as any);
      let result = _local_value[0];
      for (let i = 1; i < _local_value.length; i++) {
        const val = fn ? fn(_local_value[i]) : (_local_value[i] as any);
        if (val > maxVal) {
          maxVal = val;
          result = _local_value[i];
        }
      }
      return result;
    },
    shuffle() {
      for (let i = _local_value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = _local_value[i];
        _local_value[i] = _local_value[j];
        _local_value[j] = temp;
      }
      notify({ type: "refresh" });
      return r;
    },
    rotate(n: number) {
      const len = _local_value.length;
      if (len === 0) return r;
      const offset = ((n % len) + len) % len;
      if (offset === 0) return r;
      const rotated = [
        ..._local_value.slice(len - offset),
        ..._local_value.slice(0, len - offset),
      ];
      for (let i = 0; i < len; i++) {
        _local_value[i] = rotated[i];
      }
      notify({ type: "refresh" });
      return r;
    },
    compact() {
      return _local_value.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== false &&
          item !== 0 &&
          item !== "",
      );
    },
    take(n: number) {
      return _local_value.slice(0, n);
    },
    skip(n: number) {
      return _local_value.slice(n);
    },
    isEmpty() {
      return _local_value.length === 0;
    },
    at(index: number) {
      const idx = index < 0 ? _local_value.length + index : index;
      if (idx < 0 || idx >= _local_value.length) return undefined;
      return getProxy(_local_value[idx], idx);
    },
    toArray() {
      return _local_value.slice();
    },
    [Symbol.iterator]() {
      return _local_value[Symbol.iterator]();
    },
  };
  return r;
}
