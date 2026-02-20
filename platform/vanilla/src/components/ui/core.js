/**
 * @template [T=any]
 * @typedef {Object} Ref
 * @property {T} value
 * @property {true} __isRef
 * @property {function({ onChange?: (v: T) => void, onPatch?: (c: any) => void, ignore?: boolean }): void} _subscribe
 */

/**
 * @typedef {Object} ViewClassname
 * @property {function(string): void} del
 * @property {function(string): void} add
 * @property {function(string): void} append
 * @property {function(): string} toString
 * @property {function(any): void} listen
 */

/**
 * @typedef {Object} ViewReturn
 * @property {string} t
 * @property {HTMLElement|Text} $elm
 * @property {function(): (HTMLElement|Text)} render
 * @property {function(HTMLElement|Text): void} [onMounted]
 * @property {function(): void} [beforeUnmounted]
 * @property {function(): void} [onUnmounted]
 */

/**
 * @typedef {ViewReturn} ViewChild
 */

/**
 * @typedef {ViewChild[]} ViewChildren
 */

/**
 * @typedef {Object} ViewProps
 * @property {string} [type]
 * @property {string | Ref<string> | any} [id]
 * @property {string | Ref<string> | any} [style]
 * @property {string | Ref<string> | ViewClassname | any} [class]
 * @property {Record<string, string>} [dataset]
 * @property {function(any): void} [onMounted]
 * @property {function(any): void} [beforeUnmounted]
 * @property {function(any): void} [onUnmounted]
 * @property {function(any): void} [onClick]
 * @property {function(any): void} [onFocus]
 * @property {function(any): void} [onBlur]
 * @property {any} [key]
 */

export function ref(v) {
  let _v = v;
  const deps = [];
  function notify(patch) {
    for (let i = 0; i < deps.length; i += 1) {
      const dep = deps[i];
      if (dep.onPatch) {
        dep.onPatch(patch);
      } else if (dep.onChange) {
        dep.onChange(_v);
      }
    }
  }
  function wrap_arr(arr) {
    const proxy = new Proxy(arr, {
      get(target, prop, receiver) {
        if (prop === "push") {
          return function (...items) {
            const start = target.length;
            const r = Array.prototype.push.apply(target, items);
            notify({ type: "insert", index: start, items });
            return r;
          };
        }
        if (prop === "unshift") {
          return function (...items) {
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
          return function (start, deleteCount, ...items) {
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
      set(target, prop, value, receiver) {
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
  const ref = {
    /** @type {any} */
    __isRef: true,
    get value() {
      return _v;
    },
    set value(next_v) {
      if (typeof next_v === "function") {
        _v = next_v(_v);
      } else {
        _v = next_v;
      }
      if (Array.isArray(_v)) {
        _v = wrap_arr(_v);
      }
      notify({ type: "reset" });
    },
    _subscribe(ctx) {
      if (ctx && !ctx.ignore) {
        deps.push(ctx);
      }
    },
  };
  return ref;
}

export function isRef(v) {
  return v && typeof v === "object" && v.__isRef;
}

export function computed(deps, consumer) {
  let depsObj = null;
  let computeFn = null;
  if (typeof deps === "function") {
    computeFn = deps;
  } else {
    depsObj = deps || {};
    computeFn = consumer;
  }
  const computed_ref = {
    /** @type {any} */
    __isRef: true,
    _deps: [],
    _subscribers: [],
    _addDep(dep) {
      if (!this._deps.includes(dep)) {
        this._deps.push(dep);
        dep._subscribe({
          onPatch: () => {
            recompute();
          },
        });
      }
    },
    get value() {
      return _value;
    },
    set value(next) {
      _value = next;
      notifySubscribers();
    },
    _subscribe(ctx) {
      if (ctx && !ctx.ignore) {
        this._subscribers.push(ctx);
      }
    },
  };
  function createDepsProxy() {
    if (!depsObj) return undefined;
    return new Proxy(depsObj, {
      get(target, prop) {
        const ref = target[prop];
        if (isRef(ref)) {
          computed_ref._addDep(ref);
          return ref.value;
        }
        return ref;
      },
    });
  }
  function compute() {
    const result = computeFn(createDepsProxy());
    return result;
  }
  let _value = compute();
  function notifySubscribers() {
    for (let i = 0; i < computed_ref._subscribers.length; i += 1) {
      const sub = computed_ref._subscribers[i];
      if (sub.onPatch) {
        sub.onPatch({ type: "reset" });
      } else if (sub.onChange) {
        sub.onChange(_value);
      }
    }
  }
  function recompute() {
    _value = compute();
    notifySubscribers();
  }
  return computed_ref;
}
export function isComponent(v) {
  return v && typeof v.render === "function";
}
export function classnames(classname) {
  let ctx = {
    onChange(names) {},
  };
  let _names = (() => {
    if (classname) {
      if (typeof classname === "object" && classname.__isRef) {
        classname._subscribe({
          onChange(v) {
            _names = String(v).split(" ");
            // console.log("[]the className is changed, ", _names);
            ctx.onChange(_names);
          },
        });
        return String(classname.value).split(" ");
      }
      // console.log("[]classnames", classname);
      return classname.split(" ");
    }
    return [];
  })();
  return {
    __CN: true,
    del(v) {
      _names = _names.filter((vv) => vv !== v);
      ctx.onChange(_names);
    },
    add(v) {
      if (_names.includes(v)) {
        return;
      }
      _names.push(v);
      ctx.onChange(_names);
    },
    append(c) {
      const segments = c.split(" ");
      for (let i = 0; i < segments.length; i += 1) {
        const v = segments[i];
        this.add(v);
      }
    },
    listen(c) {
      ctx = c;
    },
    toString() {
      // console.log("[]classnames.toString", _names);
      return _names.filter(Boolean).join(" ");
    },
  };
}
