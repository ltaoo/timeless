function ref(v) {
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
function isRef(v) {
  return v && typeof v === "object" && v.__isRef;
}
function computed(deps, consumer) {
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

function classnames(classname) {
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
    },
    add(v) {
      if (_names.includes(v)) {
        return;
      }
      _names.push(v);
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

function View(props = {}, children) {
  const {
    type = "div",
    style,
    class: tmpcn,
    dataset,
    onClick,
    ...restProps
  } = props;
  const $elm = document.createElement(type);

  Object.keys(restProps).forEach((k) => {
    $elm.setAttribute(k, props[k]);
  });
  Object.keys(dataset || {}).forEach((k) => {
    $elm.setAttribute(`data-${k}`, dataset[k]);
  });

  const class$ = (() => {
    if (!tmpcn) {
      return classnames("");
    }
    if (tmpcn.__CN) {
      return tmpcn;
    }
    if (tmpcn.__isRef) {
      return classnames(tmpcn);
    }
    return classnames(tmpcn);
  })();
  // console.log("class$", class$);
  class$.listen({
    onChange(v) {
      $elm.className = v.join(" ");
    },
  });
  $elm.className = class$.toString();
  $elm.style = style;
  if (onClick) {
    $elm.addEventListener("click", function (event) {
      if (onClick) {
        onClick(event);
      }
    });
  }

  let _children = children ?? [];

  return {
    t: "view",
    $elm,
    class$,
    append(node) {
      _children.push(node);
    },
    setContent(html) {
      $elm.innerHTML = html;
    },
    render() {
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        // console.log("[View]render", i, node);
        if (node.t === "show") {
        }
        const result = node.render();
        $elm.appendChild(result);
      }
      $elm.className = class$.toString();
      return $elm;
    },
  };
}
/**
 * @param {Ref<any> | string} state
 */
function Txt(state) {
  let _text = (() => {
    if (state && typeof state === "object" && state.__isRef) {
      state._subscribe({
        onChange(v) {
          $elm.textContent = v;
        },
      });
      return state.value;
    }
    return state;
  })();
  const $elm = document.createTextNode(_text);
  return {
    t: "text",
    render() {
      return $elm;
    },
  };
}
function Head2(props, children) {
  const class$ = classnames("flex");
  const node$ = View(
    {
      type: "h2",
      class: class$.toString(),
    },
    children,
  );
  return {
    t: "view",
    append(node) {
      return node$.append(node);
    },
    setContent(v) {
      return node$.setContent(v);
    },
    render() {
      return node$.render();
    },
  };
}
function Paragraph(props, children) {
  const class$ = classnames();
  const node$ = View(
    {
      type: "p",
      class: class$.toString(),
    },
    children,
  );
  return {
    t: "view",
    append(node) {
      return node$.append(node);
    },
    setContent(v) {
      return node$.setContent(v);
    },
    render() {
      return node$.render();
    },
  };
}
function Flex(props, children) {
  // const class$ = ViewClassname("flex");
  const view$ = View({ class: "flex" }, children);
  if (props.justify) {
    view$.class$.add(` justify-${props.justify}`);
  }
  if (props.items) {
    view$.class$.add(` items-${props.items}`);
  }
  if (props.class) {
    view$.class$.append(props.class);
  }
  return {
    t: "view",
    append(node) {
      return view$.append(node);
    },
    setContent(v) {
      return view$.setContent(v);
    },
    render() {
      return view$.render();
    },
  };
}
function Button(props, children) {
  const { class: classname = "", ...restProps } = props;
  const node$ = View(
    {
      type: "button",
      class: classname,
      ...restProps,
    },
    children,
  );
  return {
    t: "view",
    append(node) {
      return node$.append(node);
    },
    setContent(v) {
      return node$.setContent(v);
    },
    render() {
      return node$.render();
    },
  };
}
function For(props) {
  const { each, render, ...restProps } = props;
  const view$ = View(restProps);
  const $container = view$.$elm;
  $container.setAttribute("for-wrapper", "true");
  let _items = [];
  let _children = [];
  let _doms = [];
  const existingMap = new WeakMap();
  function _render_item(item, index) {
    // console.log("render item ", item);
    if (typeof item === "string") {
      // 这是直接传入 固定数组 的场景，比如 each: ["一", "二", "三"]
      const node = render(item, index);
      if (!node) {
        return null;
      }
      if (typeof node.render === "function") {
        const elm = node.render();
        return { node, elm };
      }
      return { node: null, elm: node };
    }
    // 这个是因为 Show 如果 children 有 For，就会出现重复元素
    if (existingMap.has(item)) {
      return null;
    }
    existingMap.set(item, true);
    const node = render(item, index);
    if (!node) {
      return null;
    }
    if (typeof node.render === "function") {
      const elm = node.render();
      return { node, elm };
    }
    return { node: null, elm: node };
  }
  function _insert(index, items) {
    // console.log("[For]_insert - handle", index, items.length);
    for (let i = 0; i < items.length; i += 1) {
      (() => {
        const res = _render_item(items[i], index + i);
        if (!res) {
          return;
        }
        // const refElm = $container.childNodes[index + i] || null;
        // $container.insertBefore(res.elm, refElm);
        // console.log(
        //   "[For]_insert - before appendChild",
        //   i,
        //   $container.innerHTML,
        // );
        $container.appendChild(res.elm);
      })();
      // _items.splice(index + i, 0, items[i]);
      // _children.splice(index + i, 0, res.node || res.elm);
      // _doms.splice(index + i, 0, res.elm);
    }
  }
  function _remove(index, count) {
    for (let i = 0; i < count; i += 1) {
      const elm = _doms[index];
      if (elm && elm.parentNode === $container) {
        $container.removeChild(elm);
      }
      _items.splice(index, 1);
      _children.splice(index, 1);
      _doms.splice(index, 1);
    }
  }
  function _update(index, item) {
    const res = _render_item(item, index);
    if (!res) return;
    const old = _doms[index];
    if (old && old.parentNode === $container) {
      $container.replaceChild(res.elm, old);
    } else {
      $container.appendChild(res.elm);
    }
    _items[index] = item;
    _children[index] = res.node || res.elm;
    _doms[index] = res.elm;
  }
  const ctx = {
    onPatch(change) {
      console.log("[For]ctx.onPatch - handle change", change);
      if (!change || !change.type) {
        return;
      }
      if (change.type === "insert") {
        _insert(change.index, change.items || []);
        return;
      }
      if (change.type === "remove") {
        _remove(change.index, change.count || 0);
        return;
      }
      if (change.type === "update") {
        _update(change.index, change.item);
        return;
      }
      if (change.type === "reset") {
        // full rebuild
        while ($container.firstChild) {
          $container.removeChild($container.firstChild);
        }
        _items = [];
        _children = [];
        _doms = [];
        const items = each.value;
        for (let i = 0; i < items.length; i += 1) {
          (() => {
            const res = _render_item(items[i], i);
            if (!res) {
              return;
            }
            $container.appendChild(res.elm);
            // _items.push(items[i]);
            // _children.push(res.node || res.elm);
            // _doms.push(res.elm);
          })();
        }
      }
    },
    onChange() {},
  };
  return {
    t: "for",
    append(node) {
      // _children.push(node);
    },
    setContent(v) {},
    render() {
      const items = (() => {
        if (isRef(each)) {
          each._subscribe(ctx);
          return each.value;
        }
        // 直接传数组的场景，固定渲染一些值
        return each || [];
      })();
      // console.log("[For]render - handle", items);
      // console.log(items);
      // _items = items.slice();
      // _children = [];
      // _doms = [];
      // console.log("in For before items.length for", items);
      for (let i = 0; i < items.length; i += 1) {
        (() => {
          const res = _render_item(items[i], i);
          if (!res) {
            return;
          }
          $container.appendChild(res.elm);
          // _children.push(res.node || res.elm);
          // _doms.push(res.elm);
        })();
      }
      return $container;
    },
  };
}
function Show(props) {
  const { when, children, fallback } = props;

  let _children = children;
  let _fallback = fallback;
  let _whenRef = when;
  let _prevCondition = null;

  const view$ = View({}, []);
  const cache = {};

  _whenRef._subscribe({
    onPatch() {
      render();
    },
  });

  function render() {
    const condition = isRef(when) ? when.value : when();
    if (condition === _prevCondition) {
      // 就是没有变化
      return;
    }
    _prevCondition = condition;
    const nodes = condition ? _children : _fallback;
    if (!nodes) {
      return;
    }
    const cachedFragment = cache[condition];
    if (cachedFragment) {
      view$.$elm.innerHTML = "";
      view$.$elm.appendChild(cachedFragment);
      return;
    }
    const $fragment = document.createDocumentFragment();
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node && typeof node.render === "function") {
        $fragment.appendChild(node.render());
      } else if (node) {
        $fragment.appendChild(node);
      }
    }
    cache[condition] = $fragment;
    view$.$elm.innerHTML = "";
    view$.$elm.appendChild($fragment);
  }

  return {
    t: "show",
    append(node) {
      _children.push(node);
    },
    setContent(v) {},
    render() {
      render();
      // view$.append();
      // return ;
      return view$.$elm;
    },
  };
}
function DangerouslyInnerHTML(html) {
  const $elm = document.createElement("div");
  return {
    t: "html",
    render() {
      $elm.innerHTML = html;
      return $elm;
    },
  };
}
