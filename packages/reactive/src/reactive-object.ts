import {
  Subscriber,
  SubscriberWithId,
  Ref,
  isRef,
  TimelessRefObject,
  TimelessRefObjectNullable,
  DepInfo,
} from "./types";
import { get, has } from "./registry";
import { __hmr_get_hot } from "./hmr";

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
  as(nextObj: T | ((cur: T) => T), extra?: Record<string, unknown>): void;
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
  diff(v: T): void;
}

export interface RefObjectNullable<T> extends Ref<T> {
  set(
    key: keyof T,
    item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
  ): void;
  get(key: keyof T): unknown;
  delete(key: keyof T): void;
  as(
    v: T | ((cur: T | null) => T) | null,
    extra?: Record<string, unknown>,
  ): void;
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
  __hmr_key?: string,
): TimelessRefObject<T>;
export function refObject<T extends Record<string, any>>(
  obj: T | null,
  __hmr_key?: string,
): TimelessRefObjectNullable<T>;
export function refObject<T extends Record<string, any>>(
  obj: T | null,
  __hmr_key?: string,
): TimelessRefObject<T> | TimelessRefObjectNullable<T> {
  const hot = __hmr_key ? __hmr_get_hot() : null;

  if (hot?.data?.__hmr_refs?.[__hmr_key!]) {
    obj = hot.data.__hmr_refs[__hmr_key!].value;
  }

  let raw_value = obj;
  const deps: SubscriberWithId<T>[] = [];
  function notify(action: { type: string }, extra?: Record<string, unknown>) {
    // console.log("[reactive]reactive-object - notify", deps.length);
    for (let i = 0; i < deps.length; i += 1) {
      const ctx = deps[i];
      if (ctx.onChange) {
        ctx.onChange(raw_value as T);
      }
    }
  }
  const _inner: Partial<Record<keyof T, Ref<unknown>>> = {};
  const r = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      const trackCtx = ctx as SubscriberWithId<T>;
      deps.push(trackCtx);
      return function () {
        const idx = deps.indexOf(trackCtx);
        if (idx > -1) deps.splice(idx, 1);
      };
    },
    destroy() {
      deps.length = 0;
    },
    get value() {
      return raw_value;
    },
    isSame(v: unknown) {
      return Object.is(raw_value, v);
    },
    isStrictEqual(v: unknown) {
      return raw_value === v;
    },
    set(
      key: keyof T,
      item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
    ) {
      if (raw_value && typeof item === "function") {
        raw_value[key] = (item as (current: T[keyof T]) => T[keyof T])(
          raw_value[key],
        );
      } else {
        if (!raw_value) {
          raw_value = {} as T;
        }
        raw_value[key] = item as T[keyof T];
      }
      notify({ type: "update" });
    },
    get(key: keyof T) {
      if (!raw_value) {
        return null;
      }
      const vv = raw_value[key];
      if (isRef(vv)) {
        return vv;
      }
      if (typeof vv === "object" && vv !== null) {
        if (has(vv)) {
          return get(vv);
        }
        // @ts-ignore
        _inner[key] = refObject(vv);
        return _inner[key] ?? null;
      }
      console.warn("reactiveObject get", key);
    },
    delete(key: keyof T) {
      if (!raw_value) {
        return;
      }
      delete raw_value[key];
      notify({ type: "refresh" });
    },
    as(nextObj: T | ((cur: T | null) => T), extra?: Record<string, unknown>) {
      if (typeof nextObj === "function") {
        if (raw_value) {
          Object.assign(raw_value, nextObj(raw_value));
        } else {
          raw_value = nextObj(raw_value);
        }
      } else {
        raw_value = nextObj;
      }
      notify({ type: "refresh" }, extra);
    },
    assign(updated: Partial<T>) {
      if (raw_value === null) {
        // @ts-ignore
        raw_value = updated;
      } else {
        Object.assign(raw_value, updated);
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
      if (!raw_value) return false;
      return key in raw_value;
    },
    keys() {
      if (!raw_value) return [];
      return Object.keys(raw_value) as (keyof T)[];
    },
    values() {
      if (!raw_value) return [];
      return Object.values(raw_value);
    },
    entries() {
      if (!raw_value) return [];
      return Object.entries(raw_value) as [keyof T, T[keyof T]][];
    },
    isEmpty() {
      if (!raw_value) return true;
      return Object.keys(raw_value).length === 0;
    },
    size() {
      if (!raw_value) return 0;
      return Object.keys(raw_value).length;
    },
    pick<K extends keyof T>(...keys: K[]) {
      if (!raw_value) return null as unknown as Pick<T, K>;
      const result = {} as Record<string, unknown>;
      for (const key of keys) {
        if (key in raw_value) {
          result[key as string] = raw_value[key];
        }
      }
      return result as unknown as Pick<T, K>;
    },
    omit<K extends keyof T>(...keys: K[]) {
      if (!raw_value) return null as unknown as Omit<T, K>;
      const result: Record<string, unknown> = { ...raw_value };
      for (const key of keys) {
        delete result[key as string];
      }
      return result as unknown as Omit<T, K>;
    },
    toggle(key: keyof T) {
      if (!raw_value) return;
      (raw_value as Record<keyof T, boolean>)[key] = !(
        raw_value as Record<keyof T, boolean>
      )[key];
      notify({ type: "update" });
    },
    increment(key: keyof T, amount: number = 1) {
      if (!raw_value) return;
      (raw_value as Record<keyof T, number>)[key] = ((
        raw_value as Record<keyof T, number>
      )[key] + amount) as T[keyof T] & number;
      notify({ type: "update" });
    },
    decrement(key: keyof T, amount: number = 1) {
      if (!raw_value) return;
      (raw_value as Record<keyof T, number>)[key] = ((
        raw_value as Record<keyof T, number>
      )[key] - amount) as T[keyof T] & number;
      notify({ type: "update" });
    },
    clear() {
      if (!raw_value) return;
      for (const key of Object.keys(raw_value)) {
        delete (raw_value as Record<string, unknown>)[key];
      }
      notify({ type: "refresh" });
    },
    merge(source: Partial<T>) {
      if (!raw_value) {
        raw_value = { ...source } as T;
      } else {
        deepMerge(raw_value, source);
      }
      notify({ type: "refresh" });
    },
    clone() {
      if (!raw_value) return null as any;
      return JSON.parse(JSON.stringify(raw_value));
    },
    renameKey(oldKey: keyof T, newKey: string) {
      if (!raw_value) return;
      if (!(oldKey in raw_value)) return;
      if ((oldKey as string) === newKey) return;
      const value = raw_value[oldKey];
      delete raw_value[oldKey];
      (raw_value as any)[newKey] = value;
      notify({ type: "refresh" });
    },
    mapValues<U>(fn: (value: T[keyof T], key: keyof T) => U) {
      if (!raw_value) return {};
      const result: Record<string, U> = {};
      for (const key of Object.keys(raw_value)) {
        result[key] = fn(raw_value[key as keyof T], key as keyof T);
      }
      return result;
    },
    toJSON() {
      if (!raw_value) return null as any;
      return JSON.parse(JSON.stringify(raw_value));
    },
    getIn(path: string) {
      if (!raw_value) return undefined;
      const segments = path.split(".");
      let current: any = raw_value;
      for (const seg of segments) {
        if (current === null || current === undefined) return undefined;
        current = current[seg];
      }
      return current;
    },
    setIn(path: string, value: any) {
      if (!raw_value) {
        raw_value = {} as T;
      }
      const segments = path.split(".");
      let current: any = raw_value;
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
      if (!raw_value) return false;
      const segments = path.split(".");
      let current: any = raw_value;
      for (const seg of segments) {
        if (current === null || current === undefined || !(seg in current))
          return false;
        current = current[seg];
      }
      return true;
    },
    update(key: keyof T, fn: (current: any) => any) {
      if (!raw_value) return;
      raw_value[key] = fn(raw_value[key]);
      notify({ type: "update" });
    },
    diff(v: T) {
      if (raw_value === null) {
        if (v !== null) {
          raw_value = v;
          notify({ type: "update" });
        }
        return;
      }
      if (v === null) {
        if (raw_value !== null) {
          raw_value = v;
          notify({ type: "update" });
          return;
        }
      }
      const keys = Object.keys(v);
      const prev_keys = Object.keys(raw_value);
      if (keys.length !== prev_keys.length) {
        raw_value = v;
        notify({ type: "update" });
        return;
      }
      for (let i = 0; i < keys.length; i += 1) {
        const k = keys[i];
        const vv = v[k];
        const prev_value = raw_value[k];
        // console.log(
        //   "------------ check the value is change?",
        //   k,
        //   vv,
        //   prev_value,
        // );
        if (typeof vv === "string") {
          if (vv !== prev_value) {
            Object.assign(raw_value, { [k]: vv });
            notify({ type: "update" });
          }
        }
        if (typeof vv === "number") {
          if (vv !== prev_value) {
            Object.assign(raw_value, { [k]: vv });
            notify({ type: "update" });
          }
        }
        if (Array.isArray(vv)) {
          Object.assign(raw_value, { [k]: vv });
          // get(prev_value)?.diff(vv);
          notify({ type: "update" });
        }
        if (typeof vv === "object") {
          Object.assign(raw_value, { [k]: vv });
          // get(prev_value)?.diff(vv);
          notify({ type: "update" });
        }
      }
    },
    getDeps(): DepInfo[] {
      return deps.map((ctx) => ({
        trackId: ctx.__trackId || "unknown",
        trackInfo: ctx.__trackInfo,
      }));
    },
    dump() {
      console.log("[reactive.dump] refObject subscribers:", deps.length);
      deps.forEach((ctx, i) => {
        console.log(
          `  [${i}] trackId: ${ctx.__trackId || "unknown"}`,
          ctx.__trackInfo || "",
        );
      });
    },
  };

  if (hot && __hmr_key) {
    hot.data.__hmr_refs[__hmr_key] = r;
  }

  return r;
}
