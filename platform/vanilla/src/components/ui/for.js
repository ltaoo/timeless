import { View } from "./view.js";
import { isComponent, isRef } from "./core.js";
import { Show } from "./show.js";

export function For(props) {
  const { each, render, ...restProps } = props;
  const view$ = View(restProps);
  const $elm = view$.$elm;
  $elm.setAttribute("for-wrapper", "true");
  let _items = [];
  let _children = [];
  let _doms = [];
  const _existing_map = new Map();
  // const _existing_map_by_id = new Map();
  function _render_item(item, index) {
    const rr = (() => {
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
  function _insert(index, items) {
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
  function _remove(index, count) {
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
  function _update(index, item) {
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
    onPatch(change) {
      // console.log("[baseui]For - ctx.onPatch - handle change", change);
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
        const remaining_items = [];
        const items = each.value;
        for (let i = 0; i < items.length; i += 1) {
          (() => {
            const item = items[i];
            const existing = _existing_map.get(item);
            // console.log(
            //   "[baseui]For - render_item1",
            //   _existing_map.size,
            //   item,
            //   existing,
            // );
            if (existing) {
              _existing_map.delete(item);
              remaining_items.push([item, existing]);
              return;
            }
            const res = _render_item(items[i], i);
            if (!res) {
              return;
            }
            remaining_items.push([item, res]);
            $elm.appendChild(res.elm);
          })();
        }
        _existing_map.forEach((res, item) => {
          if (res.elm) {
            // console.log("[baseui]For - before remove deleted item", item);
            $elm.removeChild(res.elm);
          }
        });
        _existing_map.clear();
        for (const [item, res] of remaining_items) {
          _existing_map.set(item, res);
        }
      }
    },
    onChange() {},
  };
  let _nodes = [];

  return {
    t: "for",
    $elm: $elm,
    onMounted() {
      // console.log("[baseui]For - onMounted", nodes);
      if (props.onMounted) {
        props.onMounted();
      }
      // for (const node of nodes) {
      //   if (typeof node.onMounted === "function") {
      //     node.onMounted();
      //   }
      // }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isComponent(node) && typeof node.onUnmounted === "function") {
          node.onUnmounted();
        }
      }
      for (let i = 0; i < _nodes.length; i += 1) {
        const node = _nodes[i];
        if (isComponent(node) && typeof node.onUnmounted === "function") {
          node.onUnmounted();
        }
      }
      _nodes = [];
      $elm.innerHTML = "";
    },
    append(node) {
      // _children.push(node);
    },
    setContent(v) {},
    render() {
      for (let i = 0; i < _nodes.length; i += 1) {
        const node = _nodes[i];
        if (isComponent(node) && typeof node.onUnmounted === "function") {
          node.onUnmounted();
        }
      }
      _nodes = [];
      $elm.innerHTML = "";

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
          const item = items[i];
          // const existing = _existing_map.get(item);
          // console.log(
          //   "[baseui]For - render_item1",
          //   _existing_map.size,
          //   item,
          //   existing,
          // );
          // if (existing) {
          //   _existing_map.delete(item);
          //   return;
          // }
          const res = _render_item(item, i);
          if (!res) {
            return;
          }
          // if (res.existing) {
          //   return;
          // }
          // added_items.push([item, res]);
          _existing_map.set(item, res);
          $elm.appendChild(res.elm);
          if (res.node && isComponent(res.node)) {
            _nodes.push(res.node);
          }
        })();
        // 这里到底要不要调用？
        // for (const node of nodes) {
        //   node.onMounted();
        // }
      }
      return $elm;
    },
  };
}
