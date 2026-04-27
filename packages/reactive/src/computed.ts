import { get, set } from "./registry";
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
  let raw_value = fn(
    (() => {
      if (isRef(deps)) {
        return deps.value;
      }
      return deps;
    })(),
  );

  const _deps: SubscriberWithId<any>[] = [];
  function notify(action: { type: string }, extra?: Record<string, unknown>) {
    console.log("[]computed invoke notify", action, _deps, extra);
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(raw_value, extra);
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
      console.log("[]computed invoke onChange", r, raw_value, r === raw_value, extra);
      if (r === raw_value) {
        return;
      }
      raw_value = r;
      notify({ type: "refresh" }, extra);
    },
  });
  const res: DerivedRef<any> = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      const trackCtx: SubscriberWithId<T> = ctx as SubscriberWithId<T>;
      _deps.push(trackCtx);
      return function () {
        const idx = _deps.indexOf(trackCtx);
        // console.log("[]computed invoke unsubscribe", idx);
        if (idx > -1) {
          _deps.splice(idx, 1);
        }
        // console.log("[]computed invoke unsubscribe", _deps);
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
    getDeps(): DepInfo[] {
      return _deps.map((ctx) => ({
        trackId: ctx.__trackId || "unknown",
        trackInfo: ctx.__trackInfo,
      }));
    },
    dump() {
      console.log("[reactive.dump] computed subscribers:", _deps.length);
      _deps.forEach((ctx, i) => {
        console.log(
          `  [${i}] trackId: ${ctx.__trackId || "unknown"}`,
          ctx.__trackInfo || "",
        );
      });
    },
  };

  return res as DerivedRef<T>;
}
