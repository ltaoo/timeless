import { Subscriber, Ref, isRef } from "./types";
import { get, has } from "./registry";

export interface RefObject<T> extends Ref<T> {
  set(key: keyof T, item: any): void;
  get(key: keyof T): any;
  delete(key: keyof T): void;
  as(nextObj: T | ((cur: T) => T)): void;
  assign(updated: Partial<T>): void;
  refresh(): void;
}

export interface RefObjectNullable<T> extends Ref<T | null> {
  set(key: keyof T, item: any): void;
  get(key: keyof T): any;
  delete(key: keyof T): void;
  as(nextObj: T | ((cur: T | null) => T)): void;
  refresh(): void;
}

export function refObject<T extends Record<string, any>>(obj: T): RefObject<T>;
export function refObject<T extends Record<string, any>>(
  obj: T | null,
): RefObjectNullable<T>;
export function refObject<T extends Record<string, any>>(obj: T | null) {
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
  const _inner: Partial<Record<keyof T, Ref<any>>> = {};
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
    set(key: keyof T, item: any) {
      let vv = item;
      if (_v && typeof item === "function") {
        vv = item(_v[key]);
      }
      if (!_v) {
        _v = {} as T;
      }
      _v[key] = vv;
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
  };
  return r;
}
