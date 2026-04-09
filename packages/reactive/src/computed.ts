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
  let _local_value = fn(
    (() => {
      if (isRef(deps)) {
        return deps.value;
      }
      return deps;
    })(),
  );

  const _deps: Subscriber[] = [];
  function notify(action: { type: string }) {
    // console.log("computed notify", action, _deps);
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(_local_value);
      }
    }
  }

  // const computedRef = {
  //   __is_ref: true as const,
  //   subscribe(ctx: Subscriber) {
  //     ctx.ignore = true;
  //   },
  //   get value() {
  //     return _v;
  //   },
  // };
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

  _computed_ref.subscribe({
    onPatch() {
      _local_value = fn(_computed_ref.value);
      notify({ type: "refresh" });
    },
    onChange() {
      // console.log("computed ref is changed");
      _local_value = fn(_computed_ref.value);
      notify({ type: "refresh" });
    },
  });
  const res = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    destroy() {
      _computed_ref.destroy();
      _deps.length = 0;
    },
    get value() {
      return _local_value;
    },
    isSame(v: unknown) {
      return Object.is(_local_value, v);
    },
    isStrictEqual(v: unknown) {
      return _local_value === v;
    },
  };

  return res;
}
