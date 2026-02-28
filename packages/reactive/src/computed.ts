import { get, set } from "./store";
import { ref } from "./ref";
import { refarr } from "./refarr";
import { refobj } from "./refobj";
import { Subscriber, Ref, isRef } from "./types";

export function computed<T = any>(
  deps: Ref<any> | Record<string, any>,
  fn: (draft: any) => T,
): Ref<T> {
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
  //   _subscribe(ctx: Subscriber) {
  //     ctx.ignore = true;
  //   },
  //   get value() {
  //     return _v;
  //   },
  // };
  const computedRef: Ref<any> = (() => {
    const existing = get(deps);
    if (existing) {
      return existing;
    }
    const r = (() => {
      if (isRef(deps)) {
        return deps;
      }
      if (typeof deps === "object" && deps !== null) {
        return refobj(deps);
      }
      if (Array.isArray(deps)) {
        return refarr(deps);
      }
      return ref(deps);
    })();
    set(deps, r);
    return r;
  })();

  computedRef._subscribe({
    onChange() {
      // console.log("computed ref is changed");
      _local_value = fn(
        (() => {
          if (isRef(deps)) {
            return deps.value;
          }
          return deps;
        })(),
      );
      notify({ type: "refresh" });
    },
  });
  const res = {
    __is_ref: true as const,
    _subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    _destroy() {
      computedRef._destroy();
      _deps.length = 0;
    },
    get value() {
      return _local_value;
    },
  };

  return res;
}
