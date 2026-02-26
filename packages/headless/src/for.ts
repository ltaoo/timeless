import { View } from "./view.js";
import { isComponent, isRef } from "@timeless/reactive";
import { Show } from "./show.js";

export function For(props: any) {
  const { each, render, ...restProps } = props;
  const view$ = View(restProps);
  const $elm = view$.$elm;
  $elm.setAttribute("for-wrapper", "true");
  let _items: any[] = [];
  let _children: any[] = [];
  let _doms: any[] = [];
  const _existing_map = new Map();
  // const _existing_map_by_id = new Map();
  function _render_item(item: any, index: number) {
    const rr: any = (() => {
      const node = render(item, index);
      if (!node) {
        return { node: null, elm: null, empty: true };
      }
      if (typeof node.render === "function") {
        const elm = node.render();
        return { node, elm };
      }
      if (typeof node === "string" || typeof node === "number") {
        return { node: null, elm: document.createTextNode(String(node)) };
      }
      return { node: null, elm: node };
    })();
    return rr;
  }
  function _insert(index: number, items: any[]) {
    // console.log("[For]_insert - handle", index, items.length);
    for (let i = 0; i < items.length; i += 1) {
      (() => {
        const res = _render_item(items[i], index + i);
        if (!res) {
          return;
        }
        if (res.delete) {
          return;
        }
        // const refElm = $container.childNodes[index + i] || null;
        // $container.insertBefore(res.elm, refElm);
        // console.log(
        //   "[For]_insert - before appendChild",
        //   i,
        //   $container.innerHTML,
        // );
        $elm.appendChild(res.elm);
        if (isComponent(res.node) && typeof res.node.onMounted === "function") {
          res.node.onMounted();
        }
      })();
      // _items.splice(index + i, 0, items[i]);
      // _children.splice(index + i, 0, res.node || res.elm);
      // _doms.splice(index + i, 0, res.elm);
    }
  }
  function _remove(index: number, count: number) {
    for (let i = 0; i < count; i += 1) {
      const elm = _doms[index];
      if (elm && elm.parentNode === $elm) {
        $elm.removeChild(elm);
      }
      const item = _items[index];
      if (_existing_map.has(item)) {
        _existing_map.delete(item);
      }
      _items.splice(index, 1);
      _children.splice(index, 1);
      _doms.splice(index, 1);
    }
  }
  function _update(index: number, item: any) {
    const res = _render_item(item, index);
    if (!res) return;
    if (res.delete) return;
    const old = _doms[index];
    if (old && old.parentNode === $elm) {
      $elm.replaceChild(res.elm, old);
    } else {
      $elm.appendChild(res.elm);
      if (res.onMounted) {
        res.onMounted();
      }
    }

    const oldItem = _items[index];
    if (oldItem !== item && _existing_map.has(oldItem)) {
      _existing_map.delete(oldItem);
    }

    _items[index] = item;
    _children[index] = res.node || res.elm;
    _doms[index] = res.elm;
  }
  const ctx = {
    onPatch(change: any) {
      // console.log("[baseui]For - ctx.onPatch - handle change", change);
      if (change.type === "insert") {
        _insert(change.index, change.items);
      }
      if (change.type === "remove") {
        _remove(change.index, change.count);
      }
      if (change.type === "update") {
        _update(change.index, change.item);
      }
    },
    onChange(v: any) {
      // console.log("[baseui]For - ctx.onChange - handle change", v);
      $elm.innerHTML = "";
      _items = [];
      _children = [];
      _doms = [];
      _insert(0, v);
    },
  };

  if (isRef(each)) {
    each._subscribe(ctx);
    ctx.onChange(each.value);
  } else {
    ctx.onChange(each);
  }

  return view$;
}
