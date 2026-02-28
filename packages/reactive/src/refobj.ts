import { Subscriber, Ref, isRef } from "./types";
import { get, has } from "./store";

export function refobj<T extends Record<string, any>>(obj: T | null) {
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
        _inner[key] = refobj(vv);
        return _inner[key] ?? null;
      }
      console.warn("refobj get", key);
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
        _v = nextObj(_v);
      } else {
        _v = nextObj;
      }
      notify({ type: "refresh" });
    },
    refresh() {
      notify({ type: "refresh" });
    },
  };
  return r;
}
