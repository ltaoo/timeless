import { debounce, throttle } from "@timeless/base";
import { get, release, set } from "./registry";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import {
  Subscriber,
  SubscriberWithId,
  DerivedRef,
  isRef,
  DepInfo,
} from "./types";
import { _current_disposables } from "./disposal";

type RefValue<R> = R extends { __is_ref: true; value: infer T } ? T : R;
type ComputedOptions = {
  debounce?: number;
  throttle?: number;
};

export function computed<D extends { __is_ref: true; value: any }, R>(
  deps: D,
  fn: (val: RefValue<D>) => R,
  options?: ComputedOptions,
): DerivedRef<R>;
export function computed<T extends object, R>(
  deps: T,
  fn: (val: T) => R,
  options?: ComputedOptions,
): DerivedRef<R>;
export function computed<T = any>(
  deps: any,
  fn: (t: any) => T,
  options?: ComputedOptions,
): DerivedRef<T> {
  let raw_value = fn(
    (() => {
      if (isRef(deps)) {
        return deps.value;
      }
      return deps;
    })(),
  );

  const _computed_deps: SubscriberWithId<any>[] = [];
  function _notify(action: { type: string }, extra?: Record<string, unknown>) {
    // console.log("[]computed invoke notify", action, _deps, extra);
    for (let i = 0; i < _computed_deps.length; i += 1) {
      const ctx = _computed_deps[i];
      if (ctx.onChange) {
        ctx.onChange(raw_value, extra);
      }
    }
  }
  let notify = _notify;
  if (typeof options?.throttle === "number") {
    notify = throttle(options.throttle, notify);
  }
  if (typeof options?.debounce === "number") {
    notify = debounce(options.debounce, notify);
  }
  const _computed_ref = (() => {
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
    onPatch(v, extra) {
      const r = fn(_computed_ref.value);
      if (r === raw_value) {
        return;
      }
      raw_value = r;
      notify({ type: "refresh" }, extra);
    },
    onChange(v, extra) {
      const r = fn(_computed_ref.value);
      // console.log(
      //   "[]computed invoke onChange",
      //   r,
      //   raw_value,
      //   r === raw_value,
      //   extra,
      // );
      if (r === raw_value) {
        return;
      }
      raw_value = r;
      notify({ type: "refresh" }, extra);
    },
  });
  const res = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      const trackCtx: SubscriberWithId<T> = ctx as SubscriberWithId<T>;
      _computed_deps.push(trackCtx);
      return function () {
        const idx = _computed_deps.indexOf(trackCtx);
        // console.log("[]computed invoke unsubscribe", idx);
        if (idx > -1) {
          _computed_deps.splice(idx, 1);
        }
        // console.log("[]computed invoke unsubscribe", _deps);
      };
    },
    destroy() {
      unsubscribe();
      release(deps);
      _computed_deps.length = 0;
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
    getDeps(): DepInfo[] {
      return _computed_deps.map((ctx) => ({
        trackId: ctx.__trackId || "unknown",
        trackInfo: ctx.__trackInfo,
      }));
    },
    dump() {
      // console.log("[reactive.dump] computed subscribers:", _deps.length);
      // _deps.forEach((ctx, i) => {
      //   console.log(
      //     `  [${i}] trackId: ${ctx.__trackId || "unknown"}`,
      //     ctx.__trackInfo || "",
      //   );
      // });
    },
  };

  // Register with owner's disposal tracking if active
  // if (_current_disposables) {
  //   _current_disposables.push(res.destroy);
  // }

  return res as DerivedRef<T>;
}
