console.log("reactive.version 1.4.0");

const global_refs = new Map<any, Ref<any>>();
export function uncomputed(ref: Ref<any>) {
  global_refs.delete(ref);
}
// @ts-ignore
window._global_refs = global_refs;

export function ref<T = any>(v: T) {
  let _local_value = v;
  const deps: Subscriber[] = [];
  function notify(action: {
    type: string;
    index?: number;
    deleteCount?: number;
    item?: any;
    items?: any;
  }) {
    for (let i = 0; i < deps.length; i += 1) {
      const ctx = deps[i];
      (() => {
        if (action.type === "insert") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (action.type === "update") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (ctx.onChange) {
          ctx.onChange(_local_value);
        }
      })();
    }
  }
  const r = {
    __is_ref: true as const,
    get value() {
      return _local_value;
    },
    _subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    as(value: T | ((cur: T) => T)) {
      if (typeof value === "function") {
        _local_value = (value as (cur: T) => T)(_local_value);
      } else {
        _local_value = value;
      }
      notify({ type: "refresh" });
    },
  };
  return r;
}

export function refarr<T>(items: T[], opt: Partial<{ key: any }> = {}) {
  let _v = items;
  const deps: Subscriber[] = [];
  function notify(action: {
    type: string;
    index?: number;
    deleteCount?: number;
    item?: any;
    items?: any;
  }) {
    for (let i = 0; i < deps.length; i += 1) {
      const ctx = deps[i];
      (() => {
        if (action.type === "insert") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (action.type === "update") {
          if (ctx.onPatch) {
            ctx.onPatch(action);
          }
          return;
        }
        if (ctx.onChange) {
          ctx.onChange(_v);
        }
      })();
    }
  }
  const _inner = [];
  const r = {
    __is_ref: true as const,
    _subscribe(ctx: Subscriber) {
      deps.push(ctx);
    },
    key: opt.key,
    get value() {
      return _v;
    },
    get(idx: number) {
      const vv = _v[idx];
      if (isRef(vv)) {
        return vv;
      }
      if (typeof vv === "object" && vv !== null) {
        if (global_refs.has(vv)) {
          return global_refs.get(vv);
        }
        _inner[idx] = refobj(vv);
      }
    },
    set(idx: number, item: any) {
      Array.prototype.splice.call(_v, idx, 1, item);
      notify({ type: "update", index: idx, item });
    },
    splice(idx: number, dcount: number, ...items: any[]) {
      Array.prototype.splice.call(_v, idx, dcount, ...items);
      notify({ type: "refresh" });
    },
    insert(idx: number, ...items: any[]) {
      Array.prototype.splice.call(_v, idx, 0, ...items);
      notify({
        type: "insert",
        index: idx,
        deleteCount: 0,
        items,
      });
    },
    push(...items: any[]) {
      Array.prototype.push.call(_v, ...items);
      notify({
        type: "insert",
        index: _v.length - items.length,
        deleteCount: 0,
        items,
      });
    },
    unshift(...items: any[]) {
      Array.prototype.unshift.call(_v, ...items);
      notify({
        type: "insert",
        index: 0,
        deleteCount: 0,
        items,
      });
    },
    filter(predicate: (item: T, index: number, array: T[]) => boolean) {
      return _v.filter(predicate);
    },
    includes(item: T) {
      return _v.includes(item);
    },
    as(items: T[] | ((cur: T[]) => T[])) {
      if (typeof items === "function") {
        _v = items(_v);
      } else {
        _v = items;
      }
      notify({ type: "refresh" });
    },
    refresh() {
      notify({ type: "refresh" });
    },
  };
  return r;
}
export function refobj<T extends Record<string, any>>(obj: T) {
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
    get value() {
      return _v;
    },
    set(key: keyof T, item: any) {
      let vv = item;
      if (typeof item === "function") {
        vv = item(_v[key]);
      }
      _v[key] = vv;
      notify({ type: "update" });
    },
    get(key: keyof T) {
      const vv = _v[key];
      if (isRef(vv)) {
        return vv;
      }
      if (typeof vv === "object" && vv !== null) {
        if (global_refs.has(vv)) {
          return global_refs.get(vv);
        }
        _inner[key] = refobj(vv);
        return _inner[key];
      }
      console.warn("refobj get", key);
    },
    delete(key: keyof T) {
      delete _v[key];
      notify({ type: "refresh" });
    },
    as(nextObj: T | ((cur: T) => T)) {
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

export type Ref<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  value: T;
};
export type Component = ViewReturn;

export function computed<T = any>(
  deps: Ref<any> | Record<string, any>,
  fn: (draft: Record<string, any>) => T,
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
    const existing = global_refs.get(deps);
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
    global_refs.set(deps, r);
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
    get value() {
      return _local_value;
    },
  };

  return res;
  // const isArr = Array.isArray(deps);
  // const depsArr: Ref<T>[] = isArr
  //   ? deps
  //   : Object.values(deps).filter((v): v is Ref<T> => v != null);
  // const getArgs = () => {
  //   if (isArr) {
  //     return depsArr.map((d) => d.value);
  //   }
  //   const obj: Record<string, any> = {};
  //   for (const [k, v] of Object.entries(deps)) {
  //     if (v) obj[k] = v.value;
  //   }
  //   return [obj];
  // };
  // const r = ref<T>(fn(...getArgs()));
  // for (let i = 0; i < depsArr.length; i += 1) {
  //   depsArr[i]._subscribe({
  //     onChange() {
  //       r.as(fn(...getArgs()));
  //     },
  //     ignore: true,
  //   });
  // }
  // return r;
}

export function isRef(v: any): v is Ref<any> {
  if (v === null) {
    return false;
  }
  if (v === undefined) {
    return false;
  }
  if (v.__is_ref) {
    return true;
  }
  return false;
}

export function isClassName(v: any): v is ClassNameRef {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.__cn_ref) {
    return true;
  }
  return false;
}

export function isComponent(v: any): v is ViewReturn {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.t && v.$elm) {
    return true;
  }
  return false;
}

interface CnSource {
  type: "string" | "ref" | "cn";
  value: any;
}

interface CnContext {
  onChange(names: string[]): void;
}

export function cn(
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
  function addSourceFromItem(item: any) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push(item);
      return;
    }
    if (isClassName(item)) {
      sources.push(item);
      item._subscribe({
        onChange() {
          recompute();
        },
      });
      return;
    }
    if (isRef(item)) {
      sources.push(item);
      item._subscribe({
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
    _subscribe(ctx: Subscriber) {
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

export interface ClassNameRef {
  __cn_ref: true;
  _subscribe(ctx: Subscriber): void;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
}

export interface ViewReturn {
  t: string;
  $elm: HTMLElement | Text;
  render(): HTMLElement | Text;
  onMounted?(el: HTMLElement | Text): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export type ViewChild = ViewReturn;
export type ViewChildren = ViewChild[];

// export interface ViewProps {
//   type?: string;
//   id?: string | Ref<string> | any;
//   style?: string | Ref<string> | any;
//   class?: string | Ref<string> | ViewClassname | any;
//   dataset?: Record<string, string>;
//   onMounted?(el: any): void;
//   beforeUnmounted?(el: any): void;
//   onUnmounted?(el: any): void;
//   onClick?(e: any): void;
//   onFocus?(e: any): void;
//   onBlur?(e: any): void;
//   key?: any;
// }

interface Subscriber {
  onChange: (v: any) => void;
  onPatch?: (c: any) => void;
  ignore?: boolean;
}
