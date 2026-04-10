import { Subscriber, Ref, DerivedRef, isRef } from "./types";

type UnwrapRef<T> =
  T extends Ref<infer V>
    ? V extends Ref<any>
      ? UnwrapRef<V>
      : V
    : T extends DerivedRef<infer V>
      ? V extends DerivedRef<any>
        ? UnwrapRef<V>
        : V
      : T;

export function derive<T extends readonly any[], R>(
  deps: readonly [...T],
  fn: (
    ...args: { [K in keyof T]: UnwrapRef<T[K]> } & { length: T["length"] }
  ) => R,
): DerivedRef<R>;
export function derive<T extends Record<string, any>, R>(
  deps: T,
  fn: (args: { [K in keyof T]: UnwrapRef<T[K]> }) => R,
): DerivedRef<R>;

export function derive<T>(deps: any, fn: any): DerivedRef<T> {
  const _deps: Subscriber<T>[] = [];
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

  function notify() {
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(raw_value);
      }
    }
  }

  const onChange = () => {
    const args = get_values();
    const next_value = is_array ? fn(...args) : fn(args);
    if (raw_value === next_value) {
      return;
    }
    raw_value = next_value;
    notify();
  };
  const unsubscribe_list: (() => void)[] = [];
  dep_refs.forEach((ref) => {
    if (isRef(ref)) {
      const unsubscribe = ref.subscribe({ onPatch: onChange, onChange });
      unsubscribe_list.push(unsubscribe);
    }
  });

  return {
    __is_ref: true as const,
    subscribe(ctx: Subscriber<T>) {
      _deps.push(ctx);
      return function () {
        _deps.splice(_deps.indexOf(ctx), 1);
      };
    },
    destroy() {
      unsubscribe_list.forEach((unsubscribe) => unsubscribe());
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
}
