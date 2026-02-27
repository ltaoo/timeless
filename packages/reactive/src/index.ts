// export interface Ref<T = any> {
//   value: T;
//   __is_ref: true;
//   _subscribe(opts: {
//     onChange?: (v: T) => void;
//     onPatch?: (c: any) => void;
//     ignore?: boolean;
//   }): void;
// }

export interface ViewClassname {
  __CN: true;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
  listen(c: any): void;
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
  onChange?: (v: any) => void;
  onPatch?: (c: any) => void;
  ignore?: boolean;
}

console.log("reactive.version 1.3.0");

export function ref<T = any>(v: T) {
  let _v: any = v;
  const deps: Subscriber[] = [];
  function notify(patch?: any) {
    for (let i = 0; i < deps.length; i += 1) {
      const dep = deps[i];
      if (dep.onPatch) {
        dep.onPatch(patch);
      } else if (dep.onChange) {
        dep.onChange(_v);
      }
    }
  }
  function wrap_arr(arr: any[]) {
    const proxy = new Proxy(arr, {
      get(target: any, prop: string | symbol, receiver: any) {
        // console.log("[]proxy arr", prop);
        if (prop === "push") {
          return function (...items: any[]) {
            const start = target.length;
            const r = Array.prototype.push.apply(target, items);
            notify({ type: "insert", index: start, items });
            return r;
          };
        }
        if (prop === "unshift") {
          return function (...items: any[]) {
            const r = Array.prototype.unshift.apply(target, items);
            notify({ type: "insert", index: 0, items });
            return r;
          };
        }
        if (prop === "pop") {
          return function () {
            const idx = target.length - 1;
            const r = Array.prototype.pop.apply(target);
            notify({ type: "remove", index: idx, count: 1 });
            return r;
          };
        }
        if (prop === "shift") {
          return function () {
            const r = Array.prototype.shift.apply(target);
            notify({ type: "remove", index: 0, count: 1 });
            return r;
          };
        }
        if (prop === "splice") {
          console.log("[]invoke splice in arr");
          return function (
            start: number,
            deleteCount: number,
            ...items: any[]
          ) {
            const r = Array.prototype.splice.call(
              target,
              start,
              deleteCount,
              ...items,
            );
            if (deleteCount && deleteCount > 0) {
              notify({ type: "remove", index: start, count: deleteCount });
            }
            if (items && items.length > 0) {
              notify({ type: "insert", index: start, items });
            }
            return r;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target: any, prop: string | symbol, value: any, receiver: any) {
        if (prop === "length") {
          const oldLen = target.length;
          const r = Reflect.set(target, prop, value, receiver);
          if (value < oldLen) {
            notify({ type: "remove", index: value, count: oldLen - value });
          }
          return r;
        }
        const idx = Number(prop);
        const exists = idx >= 0 && idx < target.length;
        const r = Reflect.set(target, prop, value, receiver);
        if (!Number.isNaN(idx)) {
          if (exists) {
            notify({ type: "update", index: idx, item: value });
          } else {
            notify({ type: "insert", index: idx, items: [value] });
          }
        }
        return r;
      },
    });
    return proxy;
  }
  if (Array.isArray(_v)) {
    _v = wrap_arr(_v);
  }
  const r = {
    __is_ref: true as const,
    get value() {
      return _v;
    },
    set value(newValue: any) {
      if (typeof newValue === "function") {
        _v = newValue(_v);
      } else {
        _v = newValue;
      }
      if (Array.isArray(_v)) {
        _v = wrap_arr(_v);
      }
      notify();
    },
    _subscribe(opts: Subscriber) {
      deps.push(opts);
      if (!opts.ignore && opts.onChange) {
        opts.onChange(_v);
      }
    },
    splice(idx: number, dcount: number, ...items: any[]) {
      const r = Array.prototype.splice.call(_v, idx, dcount, ...items);
      notify({ type: "insert", index: idx, deleteCount: dcount, items });
      return r;
    },
  };
  return r;
}

export type Ref<T> = ReturnType<typeof ref<T>>;

export function computed<T = any>(
  deps: Ref<T>[] | Record<string, Ref<T> | undefined>,
  fn: (...args: any[]) => T,
): Ref<T> {
  const isArr = Array.isArray(deps);
  const depsArr: Ref<T>[] = isArr
    ? deps
    : Object.values(deps).filter((v): v is Ref<T> => v != null);
  const getArgs = () => {
    if (isArr) {
      return depsArr.map((d) => d.value);
    }
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(deps)) {
      if (v) obj[k] = v.value;
    }
    return [obj];
  };
  const r = ref<T>(fn(...getArgs()));
  for (let i = 0; i < depsArr.length; i += 1) {
    depsArr[i]._subscribe({
      onChange() {
        r.value = fn(...getArgs());
      },
      ignore: true,
    });
  }
  return r;
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

export function isComponent(v: any): v is ViewReturn {
  if (v === null) {
    return false;
  }
  if (v === undefined) {
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

export function cn(...items: any[]): ViewClassname {
  const sources: CnSource[] = [];
  const manualAdds = new Set<string>();
  let _names: string[] = [];
  let ctx: CnContext = {
    onChange() {},
  };
  function recompute() {
    const next: string[] = [];
    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      if (source.type === "string") {
        const segments = source.value.split(" ");
        for (let j = 0; j < segments.length; j += 1) {
          const v = segments[j];
          if (v && !next.includes(v)) {
            next.push(v);
          }
        }
      }
      if (source.type === "ref") {
        const v = source.value.value;
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
      if (source.type === "cn") {
        const v = source.value.toString();
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
    }
    manualAdds.forEach((v) => {
      if (!next.includes(v)) {
        next.push(v);
      }
    });
    _names = next;
    ctx.onChange(_names);
  }
  function addSourceFromItem(item: any) {
    if (!item && item !== "") {
      return;
    }
    if (typeof item === "string") {
      sources.push({ type: "string", value: item });
      return;
    }
    if (item && item.__CN) {
      sources.push({ type: "cn", value: item });
      item.listen({
        onChange() {
          recompute();
        },
      });
      return;
    }
    if (item && isRef(item)) {
      sources.push({ type: "ref", value: item });
      item._subscribe({
        onChange() {
          recompute();
        },
        onPatch() {
          recompute();
        },
      });
    }
  }
  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      addSourceFromItem(items[i]);
    }
  } else if (items !== undefined) {
    addSourceFromItem(items);
  }
  recompute();
  return {
    __CN: true as const,
    del(v: string) {
      manualAdds.delete(v);
      _names = _names.filter((vv) => vv !== v);
      ctx.onChange(_names);
    },
    add(v: string) {
      if (!_names.includes(v)) {
        manualAdds.add(v);
        _names.push(v);
        ctx.onChange(_names);
      }
    },
    append(c: string) {
      const segments = c.split(" ");
      for (let i = 0; i < segments.length; i += 1) {
        const v = segments[i];
        this.add(v);
      }
    },
    listen(c: any) {
      ctx = c;
    },
    toString() {
      return _names.filter(Boolean).join(" ");
    },
  };
}

export const classnames = cn;
