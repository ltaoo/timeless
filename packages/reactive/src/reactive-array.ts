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
  up(index: number): RefArray<T>;
  down(index: number): RefArray<T>;
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
  let _raw_value = items;
  const deps: Subscriber[] = [];
  function notify(action: {
    type: string;
    index?: number;
    item?: T;
    items?: T[];
    deleteCount?: number;
    from?: number;
    to?: number;
  }) {
    for (let i = 0; i < deps.length; i += 1) {
      console.log("[]reactive-array - notifiy", i, action);
      const ctx = deps[i];
      if (ctx.onPatch) {
        ctx.onPatch(action);
      }
      if (ctx.onChange) {
        ctx.onChange(_raw_value);
      }
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
    __is_ref_array: true as const,
    subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    destroy() {
      deps.length = 0;
    },
    key: opt.key,
    get value() {
      return _raw_value;
    },
    isSame(v: unknown) {
      return Object.is(_raw_value, v);
    },
    isStrictEqual(v: unknown) {
      return _raw_value === v;
    },
    get length() {
      return _raw_value.length;
    },
    get(idx: number) {
      const vv = _raw_value[idx];
      return getProxy(vv, idx);
    },
    set(idx: number, item: any) {
      Array.prototype.splice.call(_raw_value, idx, 1, item);
      notify({ type: "update", index: idx, item });
    },
    splice(idx: number, dcount: number, ...items: any[]) {
      const res = Array.prototype.splice.call(
        _raw_value,
        idx,
        dcount,
        ...items,
      );
      notify({ type: "refresh" });
      return res.map((item: any) => getProxy(item));
    },
    insert(idx: number, ...items: any[]) {
      Array.prototype.splice.call(_raw_value, idx, 0, ...items);
      notify({
        type: "insert",
        index: idx,
        deleteCount: 0,
        items,
      });
      return _raw_value.length;
    },
    push(...items: T[]) {
      const res = Array.prototype.push.call(_raw_value, ...items);
      notify({
        type: "insert",
        index: _raw_value.length - items.length,
        items,
      });
      return res;
    },
    unshift(...items: any[]) {
      const res = Array.prototype.unshift.call(_raw_value, ...items);
      notify({
        type: "insert",
        index: 0,
        deleteCount: 0,
        items,
      });
      return res;
    },
    pop() {
      if (_raw_value.length === 0) return undefined;
      const index = _raw_value.length - 1;
      const item = Array.prototype.pop.call(_raw_value);
      notify({ type: "delete", index, deleteCount: 1 });
      return getProxy(item);
    },
    shift() {
      if (_raw_value.length === 0) return undefined;
      const item = Array.prototype.shift.call(_raw_value);
      notify({ type: "delete", index: 0, deleteCount: 1 });
      return getProxy(item);
    },
    delete(idx: number) {
      Array.prototype.splice.call(_raw_value, idx, 1);
      notify({ type: "delete", index: idx, deleteCount: 1 });
    },
    remove(item: T) {
      const index = _raw_value.indexOf(item);
      if (index === -1) {
        return;
      }
      Array.prototype.splice.call(_raw_value, index, 1);
      notify({ type: "delete", index, deleteCount: 1 });
    },
    as(items: T[] | ((cur: T[]) => T[])) {
      if (typeof items === "function") {
        _raw_value = items(_raw_value);
      } else {
        _raw_value = items;
      }
      notify({ type: "refresh" });
    },
    assign(items: T[]) {
      _raw_value = items;
      _inner.length = 0;
      notify({ type: "refresh" });
    },
    filter(predicate: (item: T, index: number, array: T[]) => boolean) {
      return _raw_value.filter(predicate).map((item: any) => getProxy(item));
    },
    includes(item: T) {
      return _raw_value.includes(item);
    },
    refresh() {
      notify({ type: "refresh" });
    },
    reverse() {
      Array.prototype.reverse.call(_raw_value);
      notify({ type: "refresh" });
      return r;
    },
    sort(compareFn?: (a: T, b: T) => number) {
      Array.prototype.sort.call(_raw_value, compareFn);
      notify({ type: "refresh" });
      return r;
    },
    fill(value: T, start?: number, end?: number) {
      Array.prototype.fill.call(_raw_value, value, start, end);
      notify({ type: "refresh" });
      return r;
    },
    copyWithin(target: number, start: number, end?: number) {
      Array.prototype.copyWithin.call(_raw_value, target, start, end);
      notify({ type: "refresh" });
      return r;
    },
    concat(...items: (ConcatArray<T> | T)[]) {
      return _raw_value.concat(...items);
    },
    join(separator?: string) {
      return _raw_value.join(separator);
    },
    slice(start?: number, end?: number) {
      return _raw_value.slice(start, end).map((item: any) => getProxy(item));
    },
    indexOf(v: T, from_idx?: number) {
      // First try direct reference lookup
      const directIndex = _raw_value.indexOf(v, from_idx);
      if (directIndex !== -1) {
        return directIndex;
      }
      // If not found, try registry-based lookup (for reused items with different references)
      if (typeof v === "object" && v !== null) {
        const proxy = get(v);
        if (proxy) {
          const start = from_idx ?? 0;
          for (let i = start; i < _raw_value.length; i++) {
            const item = _raw_value[i];
            if (
              typeof item === "object" &&
              item !== null &&
              get(item) === proxy
            ) {
              return i;
            }
          }
        }
      }
      return -1;
    },
    lastIndexOf(v: T, from_idx?: number) {
      return _raw_value.lastIndexOf(v, from_idx);
    },
    every(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return _raw_value.every(predicate, thisArg);
    },
    some(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return _raw_value.some(predicate, thisArg);
    },
    forEach(
      callbackfn: (value: T, index: number, array: T[]) => void,
      thisArg?: any,
    ) {
      return _raw_value.forEach(callbackfn, thisArg);
    },
    map<U>(
      callbackfn: (value: T, index: number, array: T[]) => U,
      thisArg?: any,
    ) {
      return _raw_value.map(callbackfn, thisArg);
    },
    reduce(callbackfn: any, initialValue?: any) {
      return _raw_value.reduce(callbackfn, initialValue);
    },
    reduceRight(callbackfn: any, initialValue?: any) {
      return _raw_value.reduceRight(callbackfn, initialValue);
    },
    find(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      const idx = _raw_value.findIndex(predicate, thisArg);
      if (idx === -1) {
        return null;
      }
      const vv = _raw_value[idx];
      return getProxy(vv, idx);
    },
    findIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      return _raw_value.findIndex(predicate, thisArg);
    },
    entries() {
      return _raw_value.entries();
    },
    keys() {
      return _raw_value.keys();
    },
    values() {
      return _raw_value.values();
    },
    flat(depth?: number) {
      return _raw_value.flat(depth);
    },
    flatMap(callback: any, thisArg?: any) {
      return _raw_value.flatMap(callback, thisArg);
    },
    toString() {
      return _raw_value.toString();
    },
    toLocaleString() {
      return _raw_value.toLocaleString();
    },
    move(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex) return r;
      if (
        fromIndex < 0 ||
        fromIndex >= _raw_value.length ||
        toIndex < 0 ||
        toIndex > _raw_value.length
      )
        return r;
      const [item] = Array.prototype.splice.call(_raw_value, fromIndex, 1);
      Array.prototype.splice.call(_raw_value, toIndex, 0, item);
      notify({ type: "move", from: fromIndex, to: toIndex });
      return r;
    },
    up(index: number) {
      if (index <= 0 || index >= _raw_value.length) return r;
      return r.move(index, index - 1);
    },
    down(index: number) {
      if (index < 0 || index >= _raw_value.length - 1) return r;
      return r.move(index, index + 1);
    },
    swap(indexA: number, indexB: number) {
      if (indexA === indexB) return r;
      if (
        indexA < 0 ||
        indexA >= _raw_value.length ||
        indexB < 0 ||
        indexB >= _raw_value.length
      )
        return r;
      const temp = _raw_value[indexA];
      _raw_value[indexA] = _raw_value[indexB];
      _raw_value[indexB] = temp;
      notify({ type: "swap", from: indexA, to: indexB });
      return r;
    },
    moveToFirst(index: number) {
      return r.move(index, 0);
    },
    moveToLast(index: number) {
      return r.move(index, _raw_value.length - 1);
    },
    toggle(item: T) {
      const idx = _raw_value.indexOf(item);
      if (idx === -1) {
        r.push(item);
      } else {
        r.delete(idx);
      }
      return r;
    },
    removeBy(predicate: (item: T, index: number) => boolean) {
      for (let i = _raw_value.length - 1; i >= 0; i--) {
        if (predicate(_raw_value[i], i)) {
          Array.prototype.splice.call(_raw_value, i, 1);
        }
      }
      notify({ type: "refresh" });
    },
    clear() {
      _raw_value.length = 0;
      _inner.length = 0;
      notify({ type: "refresh" });
    },
    replace(oldItem: T, newItem: T) {
      const idx = _raw_value.indexOf(oldItem);
      if (idx === -1) return false;
      Array.prototype.splice.call(_raw_value, idx, 1, newItem);
      notify({ type: "update", index: idx, item: newItem });
      return true;
    },
    prepend(...items: T[]) {
      return r.unshift(...items);
    },
    first() {
      if (_raw_value.length === 0) return undefined;
      return getProxy(_raw_value[0], 0);
    },
    last() {
      if (_raw_value.length === 0) return undefined;
      const idx = _raw_value.length - 1;
      return getProxy(_raw_value[idx], idx);
    },
    nth(index: number) {
      const len = _raw_value.length;
      const idx = index < 0 ? len + index : index;
      if (idx < 0 || idx >= len) return undefined;
      return getProxy(_raw_value[idx], idx);
    },
    count(predicate?: (item: T, index: number) => boolean) {
      if (!predicate) return _raw_value.length;
      let count = 0;
      for (let i = 0; i < _raw_value.length; i++) {
        if (predicate(_raw_value[i], i)) count++;
      }
      return count;
    },
    distinct(keyFn?: (item: T) => any) {
      const seen = new Set();
      const result: T[] = [];
      for (const item of _raw_value) {
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
      for (const item of _raw_value) {
        const key = keyFn(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
      return groups;
    },
    chunk(size: number) {
      if (size <= 0) return [];
      const chunks: T[][] = [];
      for (let i = 0; i < _raw_value.length; i += size) {
        chunks.push(_raw_value.slice(i, i + size));
      }
      return chunks;
    },
    partition(predicate: (item: T, index: number) => boolean) {
      const pass: T[] = [];
      const fail: T[] = [];
      for (let i = 0; i < _raw_value.length; i++) {
        if (predicate(_raw_value[i], i)) {
          pass.push(_raw_value[i]);
        } else {
          fail.push(_raw_value[i]);
        }
      }
      return [pass, fail] as [T[], T[]];
    },
    intersect(other: T[]) {
      const set = new Set(other);
      return _raw_value.filter((item) => set.has(item));
    },
    union(...others: T[][]) {
      const seen = new Set();
      const result: T[] = [];
      for (const arr of [_raw_value, ...others]) {
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
      return _raw_value.filter((item) => !set.has(item));
    },
    symmetricDiff(other: T[]) {
      const setA = new Set(_raw_value);
      const setB = new Set(other);
      const result: T[] = [];
      for (const item of _raw_value) {
        if (!setB.has(item)) result.push(item);
      }
      for (const item of other) {
        if (!setA.has(item)) result.push(item);
      }
      return result;
    },
    sum(fn?: (item: T) => number) {
      let total = 0;
      for (const item of _raw_value) {
        total += fn ? fn(item) : (item as any);
      }
      return total;
    },
    min(fn?: (item: T) => number) {
      if (_raw_value.length === 0) return undefined;
      let minVal = fn ? fn(_raw_value[0]) : (_raw_value[0] as any);
      let result = _raw_value[0];
      for (let i = 1; i < _raw_value.length; i++) {
        const val = fn ? fn(_raw_value[i]) : (_raw_value[i] as any);
        if (val < minVal) {
          minVal = val;
          result = _raw_value[i];
        }
      }
      return result;
    },
    max(fn?: (item: T) => number) {
      if (_raw_value.length === 0) return undefined;
      let maxVal = fn ? fn(_raw_value[0]) : (_raw_value[0] as any);
      let result = _raw_value[0];
      for (let i = 1; i < _raw_value.length; i++) {
        const val = fn ? fn(_raw_value[i]) : (_raw_value[i] as any);
        if (val > maxVal) {
          maxVal = val;
          result = _raw_value[i];
        }
      }
      return result;
    },
    shuffle() {
      for (let i = _raw_value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = _raw_value[i];
        _raw_value[i] = _raw_value[j];
        _raw_value[j] = temp;
      }
      notify({ type: "refresh" });
      return r;
    },
    rotate(n: number) {
      const len = _raw_value.length;
      if (len === 0) return r;
      const offset = ((n % len) + len) % len;
      if (offset === 0) return r;
      const rotated = [
        ..._raw_value.slice(len - offset),
        ..._raw_value.slice(0, len - offset),
      ];
      for (let i = 0; i < len; i++) {
        _raw_value[i] = rotated[i];
      }
      notify({ type: "refresh" });
      return r;
    },
    compact() {
      return _raw_value.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== false &&
          item !== 0 &&
          item !== "",
      );
    },
    take(n: number) {
      return _raw_value.slice(0, n);
    },
    skip(n: number) {
      return _raw_value.slice(n);
    },
    isEmpty() {
      return _raw_value.length === 0;
    },
    at(index: number) {
      const idx = index < 0 ? _raw_value.length + index : index;
      if (idx < 0 || idx >= _raw_value.length) return undefined;
      return getProxy(_raw_value[idx], idx);
    },
    toArray() {
      return _raw_value.slice();
    },
    [Symbol.iterator]() {
      return _raw_value[Symbol.iterator]();
    },
  };
  return r;
}
