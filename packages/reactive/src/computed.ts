import { get, set } from "./registry";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import { Subscriber, Ref, DerivedRef, isRef } from "./types";

type RefValue<R> = R extends { __is_ref: true; value: infer T } ? T : R;

export function computed<D extends { __is_ref: true; value: any }, R>(
  deps: D,
  fn: (val: RefValue<D>) => R,
): DerivedRef<R>;
export function computed<T extends object, R>(
  deps: T,
  fn: (val: T) => R,
): DerivedRef<R>;
export function computed<T = any>(deps: any, fn: (t: any) => T): DerivedRef<T> {
  // const dep = global_refs.get(deps);
  // if (dep) {
  //   return dep;
  // }
  let raw_value = fn(
    (() => {
      if (isRef(deps)) {
        return deps.value;
      }
      return deps;
    })(),
  );

  const _deps: Subscriber<T>[] = [];
  function notify(action: { type: string }) {
    // console.log("computed notify", action, _deps);
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(raw_value);
      }
    }
  }
  const _computed_ref: DerivedRef<any> = (() => {
    const existing = get(deps);
    if (existing) {
      return existing;
    }
    const r = (() => {
      if (isRef(deps)) {
        return deps;
      }
      if (Array.isArray(deps)) {
        return refArray(deps);
      }
      if (typeof deps === "object" && deps !== null) {
        return refObject(deps);
      }
      return ref(deps);
    })();
    set(deps, r);
    return r;
  })();

  const unsubscribe = _computed_ref.subscribe({
    onPatch() {
      const r = fn(_computed_ref.value);
      // console.log("[reactive]computed - on patch", r, raw_value === r);
      if (r === raw_value) {
        return;
      }
      raw_value = r;
      notify({ type: "refresh" });
    },
    onChange() {
      const r = fn(_computed_ref.value);
      // console.log("[reactive]computed - on change", r, raw_value === r);
      if (r === raw_value) {
        return;
      }
      raw_value = r;
      notify({ type: "refresh" });
    },
  });
  const res = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      _deps.push(ctx);
      return function () {
        _deps.splice(_deps.indexOf(ctx), 1);
      };
    },
    destroy() {
      unsubscribe();
      _deps.length = 0;
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
  };

  return res;
}
