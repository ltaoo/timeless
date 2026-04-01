import {
  Subscriber,
  Ref,
  isRef,
  TimelessRefObject,
  TimelessRefObjectNullable,
} from "./types";
import { get, has } from "./registry";

function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== "object") return target;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      deepMerge(tgtVal, srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

export interface RefObject<T> extends Ref<T> {
  set(
    key: keyof T,
    item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
  ): void;
  get(key: keyof T): unknown;
  delete(key: keyof T): void;
  as(nextObj: T | ((cur: T) => T)): void;
  assign(updated: Partial<T>): void;
  refresh(): void;
  has(key: keyof T): boolean;
  keys(): (keyof T)[];
  values(): T[keyof T][];
  entries(): [keyof T, T[keyof T]][];
  isEmpty(): boolean;
  size(): number;
  pick<K extends keyof T>(...keys: K[]): Pick<T, K>;
  omit<K extends keyof T>(...keys: K[]): Omit<T, K>;
  toggle(key: keyof T): void;
  increment(key: keyof T, amount?: number): void;
  decrement(key: keyof T, amount?: number): void;
  clear(): void;
  merge(source: Partial<T>): void;
  clone(): T;
  renameKey(oldKey: keyof T, newKey: string): void;
  mapValues<U>(fn: (value: T[keyof T], key: keyof T) => U): Record<string, U>;
  toJSON(): T;
  getIn(path: string): unknown;
  setIn(path: string, value: unknown): void;
  hasIn(path: string): boolean;
  update(key: keyof T, fn: (current: T[keyof T]) => T[keyof T]): void;
}

export interface RefObjectNullable<T> extends Ref<T | null> {
  set(
    key: keyof T,
    item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
  ): void;
  get(key: keyof T): unknown;
  delete(key: keyof T): void;
  as(nextObj: T | ((cur: T | null) => T)): void;
  refresh(): void;
  has(key: keyof T): boolean;
  keys(): (keyof T)[];
  values(): T[keyof T][];
  entries(): [keyof T, T[keyof T]][];
  isEmpty(): boolean;
  size(): number;
  pick<K extends keyof T>(...keys: K[]): Pick<T, K> | null;
  omit<K extends keyof T>(...keys: K[]): Omit<T, K> | null;
  toggle(key: keyof T): void;
  increment(key: keyof T, amount?: number): void;
  decrement(key: keyof T, amount?: number): void;
  clear(): void;
  merge(source: Partial<T>): void;
  clone(): T | null;
  renameKey(oldKey: keyof T, newKey: string): void;
  mapValues<U>(fn: (value: T[keyof T], key: keyof T) => U): Record<string, U>;
  toJSON(): T | null;
  getIn(path: string): unknown;
  setIn(path: string, value: unknown): void;
  hasIn(path: string): boolean;
  update(key: keyof T, fn: (current: T[keyof T]) => T[keyof T]): void;
}

export function refObject<T extends Record<string, any>>(
  obj: T,
): TimelessRefObject<T>;
export function refObject<T extends Record<string, any>>(
  obj: T | null,
): TimelessRefObjectNullable<T>;
export function refObject<T extends Record<string, any>>(
  obj: T | null,
): TimelessRefObject<T> | TimelessRefObjectNullable<T> {
  let _v = obj;
  const deps: Subscriber[] = [];
  function notify(action: { type: string }) {
    for (let i = 0; i < deps.length; i += 1) {
      const ctx = deps[i];
      if (ctx.onChange) {
        ctx.onChange(_v);
      }
    }
  }
  const _inner: Partial<Record<keyof T, Ref<unknown>>> = {};
  const r = {
    __is_ref: true as const,
    _subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    _destroy() {
      deps.length = 0;
    },
    get value() {
      return _v;
    },
    isSame(v: unknown) {
      return Object.is(_v, v);
    },
    isStrictEqual(v: unknown) {
      return _v === v;
    },
    set(
      key: keyof T,
      item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
    ) {
      if (_v && typeof item === "function") {
        _v[key] = (item as (current: T[keyof T]) => T[keyof T])(_v[key]);
      } else {
        if (!_v) {
          _v = {} as T;
        }
        _v[key] = item as T[keyof T];
      }
      notify({ type: "update" });
    },
    get(key: keyof T) {
      if (!_v) {
        return null;
      }
      const vv = _v[key];
      if (isRef(vv)) {
        return vv;
      }
      if (typeof vv === "object" && vv !== null) {
        if (has(vv)) {
          return get(vv);
        }
        _inner[key] = refObject(vv);
        return _inner[key] ?? null;
      }
      console.warn("reactiveObject get", key);
    },
    delete(key: keyof T) {
      if (!_v) {
        return;
      }
      delete _v[key];
      notify({ type: "refresh" });
    },
    as(nextObj: T | ((cur: T | null) => T)) {
      if (typeof nextObj === "function") {
        if (_v) {
          Object.assign(_v, nextObj(_v));
        } else {
          _v = nextObj(_v);
        }
      } else {
        _v = nextObj;
      }
      notify({ type: "refresh" });
    },
    assign(updated: Partial<T>) {
      if (_v === null) {
        // @ts-ignore
        _v = updated;
      } else {
        Object.assign(_v, updated);
      }
      // Object.keys(updated).map((k) => {
      //   const v = updated[k];
      // });
      notify({ type: "refresh" });
    },
    refresh() {
      notify({ type: "refresh" });
    },
    has(key: keyof T) {
      if (!_v) return false;
      return key in _v;
    },
    keys() {
      if (!_v) return [];
      return Object.keys(_v) as (keyof T)[];
    },
    values() {
      if (!_v) return [];
      return Object.values(_v);
    },
    entries() {
      if (!_v) return [];
      return Object.entries(_v) as [keyof T, T[keyof T]][];
    },
    isEmpty() {
      if (!_v) return true;
      return Object.keys(_v).length === 0;
    },
    size() {
      if (!_v) return 0;
      return Object.keys(_v).length;
    },
    pick<K extends keyof T>(...keys: K[]) {
      if (!_v) return null as unknown as Pick<T, K>;
      const result = {} as Record<string, unknown>;
      for (const key of keys) {
        if (key in _v) {
          result[key as string] = _v[key];
        }
      }
      return result as unknown as Pick<T, K>;
    },
    omit<K extends keyof T>(...keys: K[]) {
      if (!_v) return null as unknown as Omit<T, K>;
      const result: Record<string, unknown> = { ..._v };
      for (const key of keys) {
        delete result[key as string];
      }
      return result as unknown as Omit<T, K>;
    },
    toggle(key: keyof T) {
      if (!_v) return;
      (_v as Record<keyof T, boolean>)[key] = !(_v as Record<keyof T, boolean>)[
        key
      ];
      notify({ type: "update" });
    },
    increment(key: keyof T, amount: number = 1) {
      if (!_v) return;
      (_v as Record<keyof T, number>)[key] = ((_v as Record<keyof T, number>)[
        key
      ] + amount) as T[keyof T] & number;
      notify({ type: "update" });
    },
    decrement(key: keyof T, amount: number = 1) {
      if (!_v) return;
      (_v as Record<keyof T, number>)[key] = ((_v as Record<keyof T, number>)[
        key
      ] - amount) as T[keyof T] & number;
      notify({ type: "update" });
    },
    clear() {
      if (!_v) return;
      for (const key of Object.keys(_v)) {
        delete (_v as Record<string, unknown>)[key];
      }
      notify({ type: "refresh" });
    },
    merge(source: Partial<T>) {
      if (!_v) {
        _v = { ...source } as T;
      } else {
        deepMerge(_v, source);
      }
      notify({ type: "refresh" });
    },
    clone() {
      if (!_v) return null as any;
      return JSON.parse(JSON.stringify(_v));
    },
    renameKey(oldKey: keyof T, newKey: string) {
      if (!_v) return;
      if (!(oldKey in _v)) return;
      if ((oldKey as string) === newKey) return;
      const value = _v[oldKey];
      delete _v[oldKey];
      (_v as any)[newKey] = value;
      notify({ type: "refresh" });
    },
    mapValues<U>(fn: (value: T[keyof T], key: keyof T) => U) {
      if (!_v) return {};
      const result: Record<string, U> = {};
      for (const key of Object.keys(_v)) {
        result[key] = fn(_v[key as keyof T], key as keyof T);
      }
      return result;
    },
    toJSON() {
      if (!_v) return null as any;
      return JSON.parse(JSON.stringify(_v));
    },
    getIn(path: string) {
      if (!_v) return undefined;
      const segments = path.split(".");
      let current: any = _v;
      for (const seg of segments) {
        if (current === null || current === undefined) return undefined;
        current = current[seg];
      }
      return current;
    },
    setIn(path: string, value: any) {
      if (!_v) {
        _v = {} as T;
      }
      const segments = path.split(".");
      let current: any = _v;
      for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (
          current[seg] === null ||
          current[seg] === undefined ||
          typeof current[seg] !== "object"
        ) {
          current[seg] = {};
        }
        current = current[seg];
      }
      current[segments[segments.length - 1]] = value;
      notify({ type: "refresh" });
    },
    hasIn(path: string) {
      if (!_v) return false;
      const segments = path.split(".");
      let current: any = _v;
      for (const seg of segments) {
        if (current === null || current === undefined || !(seg in current))
          return false;
        current = current[seg];
      }
      return true;
    },
    update(key: keyof T, fn: (current: any) => any) {
      if (!_v) return;
      _v[key] = fn(_v[key]);
      notify({ type: "update" });
    },
  };
  return r;
}
