import { has, get, release } from "./registry";
import { refObject } from "./reactive-object";
import {
  Subscriber,
  SubscriberWithId,
  Ref,
  isRef,
  TimelessRefArray,
  DerivedRef,
  DepInfo,
} from "./types";
// import { __hmr_get_hot } from "./hmr";

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
  as(items: T[] | ((cur: T[]) => T[]), opt?: { silent?: boolean }): void;
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
  diff(other: T[]): void;
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
  opt_or_hmr_key?: Partial<{ key: any }> | string,
  __hmr_key?: string,
): TimelessRefArray<T> {
  let opt: Partial<{ key: any }> = {};
  if (typeof opt_or_hmr_key === "string") {
    __hmr_key = opt_or_hmr_key;
  } else if (opt_or_hmr_key) {
    opt = opt_or_hmr_key;
  }

  // const hot = __hmr_key ? __hmr_get_hot() : null;
  const hot: any = null;

  // if (hot?.data?.__hmr_refs?.[__hmr_key!]) {
  //   items = hot.data.__hmr_refs[__hmr_key!].value;
  // }

  let raw_value = items;
  const _arr_deps: SubscriberWithId<T[]>[] = [];
  const warn = (msg: string) => console.warn(`[refArray] ${msg}`);
  function checkIndex(idx: unknown, method: string): idx is number {
    if (typeof idx !== "number" || isNaN(idx)) {
      warn(
        `${method}: expected number index, got ${JSON.stringify(idx)} — ignoring`,
      );
      return false;
    }
    return true;
  }
  function destroy_inner() {
    for (let i = 0; i < _inner.length; i += 1) {
      const proxy = _inner[i];
      if (proxy && typeof proxy.destroy === "function") {
        proxy.destroy();
      }
      _inner[i] = undefined;
    }
    // Also clean up stale global_refs entries for items that had proxies
    for (let i = 0; i < raw_value.length; i += 1) {
      const item = raw_value[i];
      if (item !== null && item !== undefined && typeof item === "object") {
        if (has(item)) {
          release(item);
        }
      }
    }
    _inner.length = 0;
  }
  function notify(action: any, extra?: Record<string, unknown>) {
    for (let i = 0; i < _arr_deps.length; i += 1) {
      // console.log("[]reactive-array - notify", i, action, deps.length, extra);
      const ctx = _arr_deps[i];
      (() => {
        if (action.type === "refresh") {
          if (ctx.onChange) {
            ctx.onChange(raw_value, extra);
          }
          return;
        }
        if (ctx.onPatch) {
          ctx.onPatch(action, extra);
        }
      })();
    }
  }
  const _inner: (Ref<unknown> | undefined)[] = [];
  const sync_registry_key = (prev_raw_value: T[], next_raw_value: T[]) => {
    // if (prev_raw_value === next_raw_value) {
    //   return;
    // }
    // if (Array.isArray(prev_raw_value) && get(prev_raw_value) === r) {
    //   release(prev_raw_value);
    //   set(next_raw_value, r);
    // }
  };
  const get_computed_value = (vv: any, idx?: number) => {
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
    key: opt.key,
    get value() {
      return raw_value;
    },
    get length() {
      return raw_value.length;
    },
    subscribe(ctx: Subscriber<T[]>) {
      const track_ctx = ctx as SubscriberWithId<T[]>;
      _arr_deps.push(track_ctx);
      return function () {
        const idx = _arr_deps.indexOf(track_ctx);
        if (idx > -1) _arr_deps.splice(idx, 1);
      };
    },
    destroy() {
      destroy_inner();
      _arr_deps.length = 0;
      release(raw_value);
    },
    isSame(v: unknown) {
      return Object.is(raw_value, v);
    },
    isStrictEqual(v: unknown) {
      return raw_value === v;
    },
    getDeps(): DepInfo[] {
      return _arr_deps.map((ctx) => ({
        trackId: ctx.__trackId || "unknown",
        trackInfo: ctx.__trackInfo,
      }));
    },
    dump() {
      // console.log("[reactive.dump] refArray subscribers:", deps.length);
      // deps.forEach((ctx, i) => {
      //   console.log(
      //     `  [${i}] trackId: ${ctx.__trackId || "unknown"}`,
      //     ctx.__trackInfo || "",
      //   );
      // });
    },
    get(idx: number) {
      if (!checkIndex(idx, "get")) return undefined;
      const vv = raw_value[idx];
      return get_computed_value(vv, idx);
    },
    set(idx: number, item: any) {
      if (!checkIndex(idx, "set")) return;
      Array.prototype.splice.call(raw_value, idx, 1, item);
      notify({ type: "update", index: idx, item });
    },
    splice(idx: number, dcount: number, ...items: any[]) {
      if (!checkIndex(idx, "splice")) return [];
      const res = Array.prototype.splice.call(raw_value, idx, dcount, ...items);
      notify({ type: "refresh" });
      return res.map((item: any) => get_computed_value(item));
    },
    insert(idx: number, ...items: any[]) {
      if (!checkIndex(idx, "insert")) return raw_value.length;
      Array.prototype.splice.call(raw_value, idx, 0, ...items);
      notify({
        type: "insert",
        index: idx,
        deleteCount: 0,
        items,
      });
      return raw_value.length;
    },
    push(...items: T[]) {
      // console.log("[reactive]reactive-array - push", items);
      const res = Array.prototype.push.call(raw_value, ...items);
      notify({
        type: "insert",
        index: raw_value.length - items.length,
        items,
      });
      return res;
    },
    unshift(...items: any[]) {
      const res = Array.prototype.unshift.call(raw_value, ...items);
      notify({
        type: "insert",
        index: 0,
        deleteCount: 0,
        items,
      });
      return res;
    },
    pop() {
      if (raw_value.length === 0) {
        return null;
      }
      // console.log(
      //   "[reactive]reactive-array - pop",
      //   raw_value,
      //   raw_value.length,
      // );
      const index = raw_value.length - 1;
      const item = Array.prototype.pop.call(raw_value);
      notify({ type: "delete", index, deleteCount: 1 });
      return get_computed_value(item);
    },
    shift() {
      if (raw_value.length === 0) return undefined;
      const item = Array.prototype.shift.call(raw_value);
      notify({ type: "delete", index: 0, deleteCount: 1 });
      return get_computed_value(item);
    },
    delete(idx: number) {
      if (!checkIndex(idx, "delete")) return;
      Array.prototype.splice.call(raw_value, idx, 1);
      notify({ type: "delete", index: idx, deleteCount: 1 });
    },
    remove(item: T) {
      const index = raw_value.indexOf(item);
      if (index === -1) {
        return;
      }
      Array.prototype.splice.call(raw_value, index, 1);
      notify({ type: "delete", index, deleteCount: 1 });
    },
    as(
      items: T[] | ((cur: T[]) => T[]),
      opt: { reset?: boolean; silent?: boolean } = {},
    ) {
      destroy_inner();
      const prev_raw_value = [...raw_value];
      if (typeof items === "function") {
        raw_value = [...items(raw_value)];
      } else {
        raw_value = [...items];
      }
      sync_registry_key(prev_raw_value, raw_value);
      if (opt.silent) {
        return;
      }
      notify({ type: "refresh" }, opt);
    },
    assign(items: T[]) {
      // destroyInner();
      const prev_raw_value = raw_value;
      raw_value = items;
      sync_registry_key(prev_raw_value, raw_value);
      notify({ type: "refresh" });
    },
    filter(predicate: (item: T, index: number, array: T[]) => boolean) {
      return raw_value
        .filter(predicate)
        .map((item: any) => get_computed_value(item));
    },
    includes(item: T) {
      return raw_value.includes(item);
    },
    refresh() {
      notify({ type: "refresh" });
    },
    reverse() {
      Array.prototype.reverse.call(raw_value);
      notify({ type: "refresh" });
      return r;
    },
    sort(compareFn?: (a: T, b: T) => number) {
      Array.prototype.sort.call(raw_value, compareFn);
      notify({ type: "refresh" });
      return r;
    },
    fill(value: T, start?: number, end?: number) {
      Array.prototype.fill.call(raw_value, value, start, end);
      notify({ type: "refresh" });
      return r;
    },
    copyWithin(target: number, start: number, end?: number) {
      Array.prototype.copyWithin.call(raw_value, target, start, end);
      notify({ type: "refresh" });
      return r;
    },
    concat(...items: (ConcatArray<T> | T)[]) {
      return raw_value.concat(...items);
    },
    join(separator?: string) {
      return raw_value.join(separator);
    },
    slice(start?: number, end?: number) {
      return raw_value
        .slice(start, end)
        .map((item: any) => get_computed_value(item));
    },
    indexOf(v: T | Ref<T>, from_idx?: number) {
      if (isRef(v)) {
        return raw_value.indexOf(v.value, from_idx);
      }
      // First try direct reference lookup
      const idx = raw_value.indexOf(v, from_idx);
      if (idx !== -1) {
        return idx;
      }
      // If not found, try registry-based lookup (for reused items with different references)
      if (typeof v === "object" && v !== null) {
        const proxy = get(v);
        if (proxy) {
          const start = from_idx ?? 0;
          for (let i = start; i < raw_value.length; i++) {
            const item = raw_value[i];
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
      return raw_value.lastIndexOf(v, from_idx);
    },
    every(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return raw_value.every(predicate, thisArg);
    },
    some(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any,
    ) {
      return raw_value.some(predicate, thisArg);
    },
    forEach(
      callbackfn: (value: T, index: number, array: T[]) => void,
      thisArg?: any,
    ) {
      return raw_value.forEach(callbackfn, thisArg);
    },
    map<U>(
      callbackfn: (value: T, index: number, array: T[]) => U,
      thisArg?: any,
    ) {
      return raw_value.map(callbackfn, thisArg);
    },
    reduce(callbackfn: any, initialValue?: any) {
      return raw_value.reduce(callbackfn, initialValue);
    },
    reduceRight(callbackfn: any, initialValue?: any) {
      return raw_value.reduceRight(callbackfn, initialValue);
    },
    find(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      const idx = raw_value.findIndex(predicate, thisArg);
      if (idx === -1) {
        return null;
      }
      const vv = raw_value[idx];
      return get_computed_value(vv, idx);
    },
    findIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ) {
      return raw_value.findIndex(predicate, thisArg);
    },
    entries() {
      return raw_value.entries();
    },
    keys() {
      return raw_value.keys();
    },
    values() {
      return raw_value.values();
    },
    flat(depth?: number) {
      return raw_value.flat(depth);
    },
    flatMap(callback: any, thisArg?: any) {
      return raw_value.flatMap(callback, thisArg);
    },
    toString() {
      return raw_value.toString();
    },
    toLocaleString() {
      return raw_value.toLocaleString();
    },
    move(fromIndex: number, toIndex: number) {
      if (!checkIndex(fromIndex, "move")) return r;
      if (!checkIndex(toIndex, "move")) return r;
      if (fromIndex === toIndex) return r;
      if (
        fromIndex < 0 ||
        fromIndex >= raw_value.length ||
        toIndex < 0 ||
        toIndex > raw_value.length
      ) {
        return r;
      }
      const [item] = Array.prototype.splice.call(raw_value, fromIndex, 1);
      Array.prototype.splice.call(raw_value, toIndex, 0, item);
      notify({ type: "move", from: fromIndex, to: toIndex });
      return r;
    },
    up(index: number | DerivedRef<number> | Ref<number>) {
      const v = isRef(index) ? index.value : index;
      if (typeof v !== "number" || isNaN(v)) {
        warn(`up: expected number index, got ${JSON.stringify(v)} — ignoring`);
        return r;
      }
      if (v <= 0 || v >= raw_value.length) return r;
      return r.move(v, v - 1);
    },
    down(index: number | DerivedRef<number> | Ref<number>) {
      const v = isRef(index) ? index.value : index;
      if (typeof v !== "number" || isNaN(v)) {
        warn(`down: expected number index, got ${JSON.stringify(v)} — ignoring`);
        return r;
      }
      if (v < 0 || v >= raw_value.length - 1) return r;
      return r.move(v, v + 1);
    },
    swap(indexA: number, indexB: number) {
      if (!checkIndex(indexA, "swap")) return r;
      if (!checkIndex(indexB, "swap")) return r;
      if (indexA === indexB) return r;
      if (
        indexA < 0 ||
        indexA >= raw_value.length ||
        indexB < 0 ||
        indexB >= raw_value.length
      )
        return r;
      const temp = raw_value[indexA];
      raw_value[indexA] = raw_value[indexB];
      raw_value[indexB] = temp;
      notify({ type: "swap", from: indexA, to: indexB });
      return r;
    },
    moveToFirst(index: number) {
      return r.move(index, 0);
    },
    moveToLast(index: number) {
      return r.move(index, raw_value.length - 1);
    },
    toggle(item: T) {
      const idx = raw_value.indexOf(item);
      if (idx === -1) {
        r.push(item);
      } else {
        r.delete(idx);
      }
      return r;
    },
    removeBy(predicate: (item: T, index: number) => boolean) {
      for (let i = raw_value.length - 1; i >= 0; i--) {
        if (predicate(raw_value[i], i)) {
          Array.prototype.splice.call(raw_value, i, 1);
        }
      }
      notify({ type: "refresh" });
    },
    clear() {
      // destroyInner();
      raw_value.length = 0;
      notify({ type: "refresh" });
    },
    replace(oldItem: T, newItem: T) {
      const idx = raw_value.indexOf(oldItem);
      if (idx === -1) return false;
      Array.prototype.splice.call(raw_value, idx, 1, newItem);
      notify({ type: "update", index: idx, item: newItem });
      return true;
    },
    prepend(...items: T[]) {
      return r.unshift(...items);
    },
    first() {
      if (raw_value.length === 0) return undefined;
      return get_computed_value(raw_value[0], 0);
    },
    last() {
      if (raw_value.length === 0) return undefined;
      const idx = raw_value.length - 1;
      return get_computed_value(raw_value[idx], idx);
    },
    nth(index: number) {
      if (!checkIndex(index, "nth")) return undefined;
      const len = raw_value.length;
      const idx = index < 0 ? len + index : index;
      if (idx < 0 || idx >= len) return undefined;
      return get_computed_value(raw_value[idx], idx);
    },
    count(predicate?: (item: T, index: number) => boolean) {
      if (!predicate) return raw_value.length;
      let count = 0;
      for (let i = 0; i < raw_value.length; i++) {
        if (predicate(raw_value[i], i)) count++;
      }
      return count;
    },
    distinct(keyFn?: (item: T) => any) {
      const seen = new Set();
      const result: T[] = [];
      for (const item of raw_value) {
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
      for (const item of raw_value) {
        const key = keyFn(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
      return groups;
    },
    chunk(size: number) {
      if (size <= 0) return [];
      const chunks: T[][] = [];
      for (let i = 0; i < raw_value.length; i += size) {
        chunks.push(raw_value.slice(i, i + size));
      }
      return chunks;
    },
    partition(predicate: (item: T, index: number) => boolean) {
      const pass: T[] = [];
      const fail: T[] = [];
      for (let i = 0; i < raw_value.length; i++) {
        if (predicate(raw_value[i], i)) {
          pass.push(raw_value[i]);
        } else {
          fail.push(raw_value[i]);
        }
      }
      return [pass, fail] as [T[], T[]];
    },
    intersect(other: T[]) {
      const set = new Set(other);
      return raw_value.filter((item) => set.has(item));
    },
    union(...others: T[][]) {
      const seen = new Set();
      const result: T[] = [];
      for (const arr of [raw_value, ...others]) {
        for (const item of arr) {
          if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
          }
        }
      }
      return result;
    },
    symmetricDiff(other: T[]) {
      const setA = new Set(raw_value);
      const setB = new Set(other);
      const result: T[] = [];
      for (const item of raw_value) {
        if (!setB.has(item)) result.push(item);
      }
      for (const item of other) {
        if (!setA.has(item)) result.push(item);
      }
      return result;
    },
    sum(fn?: (item: T) => number) {
      let total = 0;
      for (const item of raw_value) {
        total += fn ? fn(item) : (item as any);
      }
      return total;
    },
    min(fn?: (item: T) => number) {
      if (raw_value.length === 0) return undefined;
      let minVal = fn ? fn(raw_value[0]) : (raw_value[0] as any);
      let result = raw_value[0];
      for (let i = 1; i < raw_value.length; i++) {
        const val = fn ? fn(raw_value[i]) : (raw_value[i] as any);
        if (val < minVal) {
          minVal = val;
          result = raw_value[i];
        }
      }
      return result;
    },
    max(fn?: (item: T) => number) {
      if (raw_value.length === 0) return undefined;
      let maxVal = fn ? fn(raw_value[0]) : (raw_value[0] as any);
      let result = raw_value[0];
      for (let i = 1; i < raw_value.length; i++) {
        const val = fn ? fn(raw_value[i]) : (raw_value[i] as any);
        if (val > maxVal) {
          maxVal = val;
          result = raw_value[i];
        }
      }
      return result;
    },
    shuffle() {
      for (let i = raw_value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = raw_value[i];
        raw_value[i] = raw_value[j];
        raw_value[j] = temp;
      }
      notify({ type: "refresh" });
      return r;
    },
    rotate(n: number) {
      const len = raw_value.length;
      if (len === 0) return r;
      const offset = ((n % len) + len) % len;
      if (offset === 0) return r;
      const rotated = [
        ...raw_value.slice(len - offset),
        ...raw_value.slice(0, len - offset),
      ];
      for (let i = 0; i < len; i++) {
        raw_value[i] = rotated[i];
      }
      notify({ type: "refresh" });
      return r;
    },
    compact() {
      return raw_value.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== false &&
          item !== 0 &&
          item !== "",
      );
    },
    take(n: number) {
      return raw_value.slice(0, n);
    },
    skip(n: number) {
      return raw_value.slice(n);
    },
    isEmpty() {
      return raw_value.length === 0;
    },
    at(index: number) {
      if (!checkIndex(index, "at")) return undefined;
      const idx = index < 0 ? raw_value.length + index : index;
      if (idx < 0 || idx >= raw_value.length) return undefined;
      return get_computed_value(raw_value[idx], idx);
    },
    toArray() {
      return raw_value.slice();
    },
    diff(v: T[]) {
      // if (v.length !== raw_value.length) {
      //   notify({ type: "refresh" });
      //   return;
      // }
      raw_value = v;
      notify({ type: "refresh" });
    },
    [Symbol.iterator]() {
      return raw_value[Symbol.iterator]();
    },
  };

  // if (hot && __hmr_key) {
  //   hot.data.__hmr_refs[__hmr_key] = r;
  // }

  // @ts-ignore
  return r;
}
