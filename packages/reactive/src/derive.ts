import { debounce, throttle } from "@timeless/base";

import { Subscriber, Ref, DerivedRef, isRef } from "./types";
import { _current_disposables } from "./disposal";

type ComputedOptions = {
  debounce?: number;
  throttle?: number;
};

type UnwrapRef<T> = T extends { __is_ref: true; value: infer V }
  ? V extends { __is_ref: true; value: any }
    ? UnwrapRef<V>
    : V
  : T;

export function derive<T extends readonly any[], R>(
  deps: readonly [...T],
  fn: (
    ...args: { [K in keyof T]: UnwrapRef<T[K]> } & { length: T["length"] }
  ) => R,
  options?: ComputedOptions,
): DerivedRef<R>;
export function derive<T extends Record<string, any>, R>(
  deps: T,
  fn: (args: { [K in keyof T]: UnwrapRef<T[K]> }) => R,
  options?: ComputedOptions,
): DerivedRef<R>;

export function derive<T>(
  deps: any,
  fn: any,
  options?: ComputedOptions,
): DerivedRef<T> {
  const _derive_deps: Subscriber<T>[] = [];
  let raw_value: any;

  const is_single_ref = isRef(deps);
  const is_array = is_single_ref || Array.isArray(deps);
  const dep_refs: any[] = is_single_ref
    ? [deps]
    : Array.isArray(deps)
      ? (deps as any[])
      : Object.values(deps);

  const get_values = () => {
    if (is_single_ref) {
      return [(deps as Ref<any>).value];
    }
    if (is_array) {
      return (deps as any[]).map((r) => (isRef(r) ? r.value : r));
    }
    const res: any = {};
    for (const key in deps) {
      const val = deps[key];
      res[key] = isRef(val) ? val.value : val;
    }
    return res;
  };

  raw_value = is_array ? fn(...get_values()) : fn(get_values());

  function _notify(v: unknown, extra?: Record<string, unknown>) {
    for (let i = 0; i < _derive_deps.length; i += 1) {
      const ctx = _derive_deps[i];
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

  const onChange = (v: unknown, extra?: Record<string, unknown>) => {
    // console.log("derive handle change", v, extra);
    const args = get_values();
    const next_value = is_array ? fn(...args) : fn(args);
    if (raw_value === next_value) {
      return;
    }
    raw_value = next_value;
    notify(null, extra);
  };
  const unsubscribe_list: (() => void)[] = [];
  dep_refs.forEach((ref) => {
    if (isRef(ref)) {
      const unsubscribe = ref.subscribe({ onPatch: onChange, onChange });
      unsubscribe_list.push(unsubscribe);
    }
  });

  const res: DerivedRef<T> = {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      _derive_deps.push(ctx);
      return function () {
        _derive_deps.splice(_derive_deps.indexOf(ctx), 1);
      };
    },
    destroy() {
      unsubscribe_list.forEach((unsubscribe) => unsubscribe());
      _derive_deps.length = 0;
      unsubscribe_list.length = 0;
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
    diff(v) {},
  };

  // Register with owner's disposal tracking if active
  // if (_current_disposables) {
  //   _current_disposables.push(res.destroy);
  // }

  return res;
}
