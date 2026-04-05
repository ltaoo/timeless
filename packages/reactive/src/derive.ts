import { Subscriber, Ref, isRef } from "./types";

type UnwrapRef<T> = T extends Ref<infer V>
  ? V extends Ref<any>
    ? UnwrapRef<V>
    : V
  : T;

export function derive<T extends readonly any[], R>(
  deps: readonly [...T],
  fn: (...args: { [K in keyof T]: UnwrapRef<T[K]> } & { length: T["length"] }) => R,
): Ref<R>;
export function derive<T extends Record<string, any>, R>(
  deps: T,
  fn: (args: { [K in keyof T]: UnwrapRef<T[K]> }) => R,
): Ref<R>;
export function derive(deps: any, fn: any): Ref<any> {
  const _deps: Subscriber[] = [];
  let _local_value: any;

  const isSingleRef = isRef(deps);
  const isArray = isSingleRef || Array.isArray(deps);
  const depRefs: any[] = isSingleRef
    ? [deps]
    : Array.isArray(deps)
      ? (deps as any[])
      : Object.values(deps);

  const getValues = () => {
    if (isSingleRef) {
      return [(deps as Ref<any>).value];
    }
    if (isArray) {
      return (deps as any[]).map((r) => (isRef(r) ? r.value : r));
    }
    const res: any = {};
    for (const key in deps) {
      const val = deps[key];
      res[key] = isRef(val) ? val.value : val;
    }
    return res;
  };

  _local_value = isArray ? fn(...getValues()) : fn(getValues());

  function notify() {
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(_local_value);
      }
    }
  }

  const onChange = () => {
    const args = getValues();
    _local_value = isArray ? fn(...args) : fn(args);
    notify();
  };

  depRefs.forEach((ref) => {
    if (isRef(ref)) {
      ref.subscribe({ onChange });
    }
  });

  return {
    __is_ref: true as const,
    subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    destroy() {
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
}
