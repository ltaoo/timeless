import {
  Signal,
  ref,
  Ref,
  Subscriber,
  isRef,
  // isClassName,
} from "@timeless/reactive";
// import { ClassNameRef, } from './clas'

export type ClassNameRef = {
  __cn_ref: true;
  subscribe(ctx: Subscriber): void;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
};

export function isClassName(v: unknown): v is ClassNameRef {
  if (v === null || v === undefined) {
    return false;
  }
  if ((v as Record<string, unknown>).__cn_ref) {
    return true;
  }
  return false;
}

export function classNames(
  items: (string | Ref<string> | ClassNameRef | undefined)[],
): ClassNameRef {
  const sources: (string | Ref<string> | ClassNameRef | undefined)[] = [];
  // const manualAdds = new Set<string>();
  const _deps: Subscriber[] = [];
  function notify(action: { type: string }) {
    // console.log("cn notify", action, _deps);
    for (let i = 0; i < _deps.length; i += 1) {
      const ctx = _deps[i];
      if (ctx.onChange) {
        ctx.onChange(_names);
      }
    }
  }
  let _names: string[] = [];
  function recompute() {
    const next: string[] = [];
    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      (() => {
        if (!source) {
          return;
        }
        if (typeof source === "string") {
          const segments = source.split(" ");
          for (let j = 0; j < segments.length; j += 1) {
            const v = segments[j];
            if (v && !next.includes(v)) {
              next.push(v);
            }
          }
          return;
        }
        if (isRef(source)) {
          const v = source.value;
          if (typeof v === "string") {
            const segments = v.split(" ");
            for (let j = 0; j < segments.length; j += 1) {
              const vv = segments[j];
              if (vv && !next.includes(vv)) {
                next.push(vv);
              }
            }
          }
          return;
        }
        if (isClassName(source)) {
          const v = source.toString();
          if (typeof v === "string") {
            const segments = v.split(" ");
            for (let j = 0; j < segments.length; j += 1) {
              const vv = segments[j];
              if (vv && !next.includes(vv)) {
                next.push(vv);
              }
            }
          }
        }
      })();
    }
    // manualAdds.forEach((v) => {
    //   if (!next.includes(v)) {
    //     next.push(v);
    //   }
    // });
    _names = next;
    notify({ type: "refresh" });
    // ctx.onChange(_names);
  }
  function addSourceFromItem(
    item: string | Ref<string> | ClassNameRef | undefined,
  ) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push(item);
      return;
    }
    if (isClassName(item)) {
      sources.push(item);
      item.subscribe({
        onChange() {
          recompute();
        },
      });
      return;
    }
    if (isRef(item)) {
      sources.push(item as Ref<string>);
      item.subscribe({
        onChange() {
          recompute();
        },
      });
    }
  }
  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      addSourceFromItem(items[i]);
    }
  }
  recompute();
  return {
    __cn_ref: true as const,
    subscribe(ctx: Subscriber) {
      _deps.push(ctx);
    },
    del(v: string) {
      // manualAdds.delete(v);
      _names = _names.filter((vv) => vv !== v);
      notify({ type: "del" });
      // ctx.onChange(_names);
    },
    add(v: string) {
      if (!_names.includes(v)) {
        // manualAdds.add(v);
        _names.push(v);
        notify({ type: "del" });
      }
    },
    append(c: string) {
      const segments = c.split(" ");
      for (let i = 0; i < segments.length; i += 1) {
        const v = segments[i];
        this.add(v);
      }
    },
    toString() {
      return _names.filter(Boolean).join(" ");
    },
  };
}

export function join(v: (string | Signal<string>)[]): Signal<string> {
  const sources = Array.isArray(v) ? v : [];
  function recompute() {
    let next = "";
    for (let i = 0; i < sources.length; i += 1) {
      const item = sources[i];
      if (typeof item === "string") {
        next += item;
      } else if (isRef(item)) {
        next += item.value ?? "";
      }
    }
    return next;
  }

  const r = ref(recompute());
  let destroyed = false;

  for (let i = 0; i < sources.length; i += 1) {
    const item = sources[i];
    if (isRef(item)) {
      item.subscribe({
        onChange() {
          if (destroyed) return;
          const next = recompute();
          if (!r.isStrictEqual(next)) {
            r.set(next);
          }
        },
      });
    }
  }

  const origin_destroy = r.destroy;
  r.destroy = () => {
    destroyed = true;
    origin_destroy();
  };

  return r;
}
