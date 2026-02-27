import { ref, isComponent, isRef, Ref, Component } from "@timeless/reactive";

import { View, ViewProps } from "./view.js";

export function For<T>(
  props: ViewProps & {
    each: Ref<T[]>;
    render: (item: T, idx: number) => Component;
  },
) {
  const { each, render, ...restProps } = props;

  const view$ = View(restProps);
  const $elm = view$.$elm;
  let _mounted = false;
  $elm.setAttribute("for-wrapper", "true");
  let _each_items: T[] = [];
  let _children: (Component | null)[] = [];
  let _$elms: (HTMLElement | Text | null)[] = [];

  const _existing_map = new Map();
  // const _existing_map_by_id = new Map();

  const methods = {
    _render_item(item: T, index: number) {
      const rr: {
        node: null | Component;
        elm: null | HTMLElement | Text;
        empty?: boolean;
        delete?: boolean;
      } = (() => {
        const view$ = render(item, index);
        if (!view$) {
          return { node: null, elm: null, empty: true };
        }
        // is component
        // if (isComponent(view$)) {
        const elm = view$.render();
        return { node: view$, elm };
        // }
        // if (typeof view$ === "string" || typeof view$ === "number") {
        //   return { node: null, elm: document.createTextNode(String(view$)) };
        // }
        // return { node: null, elm: view$ };
      })();
      return rr;
    },
    _insert(index: number, items: any[]) {
      // console.log("[For]_insert - handle", index, items.length);
      for (let i = 0; i < items.length; i += 1) {
        (() => {
          const res = methods._render_item(items[i], index + i);
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
          if (res.elm) {
            $elm.appendChild(res.elm);
            if (
              isComponent(res.node) &&
              typeof res.node.onMounted === "function"
            ) {
              res.node.onMounted(res.elm);
            }
          }
        })();
        // _items.splice(index + i, 0, items[i]);
        // _children.splice(index + i, 0, res.node || res.elm);
        // _doms.splice(index + i, 0, res.elm);
      }
    },
    _remove(index: number, count: number) {
      for (let i = 0; i < count; i += 1) {
        const elm = _$elms[index];
        if (elm && elm.parentNode === $elm) {
          $elm.removeChild(elm);
        }
        const item = _each_items[index];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        _each_items.splice(index, 1);
        _children.splice(index, 1);
        _$elms.splice(index, 1);
      }
    },
    _update(index: number, item: any) {
      const res = methods._render_item(item, index);
      if (!res) return;
      if (res.delete) return;
      const old = _$elms[index];
      if (old && old.parentNode === $elm && res.elm) {
        $elm.replaceChild(res.elm, old);
      } else if (res.elm) {
        $elm.appendChild(res.elm);
        // if (res.onMounted) {
        //   res.onMounted();
        // }
      }

      const oldItem = _each_items[index];
      if (oldItem !== item && _existing_map.has(oldItem)) {
        _existing_map.delete(oldItem);
      }

      _each_items[index] = item;
      _children[index] = res.node;
      _$elms[index] = res.elm;
    },
    _refresh(v: T[]) {
      const new_items = v;
      const prev_items = _each_items;
      const prev_children = _children;
      const prev_elms = _$elms;

      const new_children: (Component | null)[] = [];
      const new_elms: (HTMLElement | Text | null)[] = [];
      const added_items: { node: Component; elm: HTMLElement | Text }[] = [];

      const old_map = new Map<T, number[]>();
      prev_items.forEach((item, index) => {
        let indices = old_map.get(item);
        if (!indices) {
          indices = [];
          old_map.set(item, indices);
        }
        indices.push(index);
      });

      for (let i = 0; i < new_items.length; i++) {
        const item = new_items[i];
        // console.log("loop", i, item);
        const prev_indices = old_map.get(item);

        if (prev_indices && prev_indices.length > 0) {
          const oldIndex = prev_indices.shift()!;
          new_children[i] = prev_children[oldIndex];
          new_elms[i] = prev_elms[oldIndex];
        } else {
          const res = methods._render_item(item, i);
          new_children[i] = res.node;
          new_elms[i] = res.elm;
          if (res.node && res.elm && isComponent(res.node)) {
            added_items.push({ node: res.node, elm: res.elm });
          }
        }
      }

      // Cleanup removed
      for (const indices of old_map.values()) {
        console.log("cleanup removed", indices);
        for (const index of indices) {
          const elm = prev_elms[index];
          if (elm && elm.parentNode === $elm) {
            $elm.removeChild(elm);
          }
          const comp = prev_children[index];
          if (comp && isComponent(comp)) {
            // @ts-ignore
            if (typeof comp.onUnmounted === "function") {
              comp.onUnmounted();
            }
          }
        }
      }

      // Reorder/Insert
      for (let i = 0; i < new_elms.length; i++) {
        const node = new_elms[i];
        (() => {
          if (!node) {
            return;
          }
          const cur_node = $elm.childNodes[i];
          if (node !== cur_node) {
            $elm.insertBefore(node, cur_node || null);
          }
        })();
      }

      // Trigger onMounted for new components
      for (const { node, elm } of added_items) {
        // @ts-ignore
        if (typeof node.onMounted === "function") {
          // @ts-ignore
          node.onMounted(elm);
        }
      }

      _each_items = new_items;
      _children = new_children;
      _$elms = new_elms;
    },
  };

  const ctx = {
    onPatch(change: any) {
      console.log("[headless]For - ctx.onPatch - handle patch", change);
      if (change.type === "insert") {
        methods._insert(change.index, change.items);
      }
      if (change.type === "remove") {
        methods._remove(change.index, change.count);
      }
      if (change.type === "update") {
        methods._update(change.index, change.item);
      }
    },
    onChange(v: T[]) {
      console.log("[headless]For - ctx.onChange - handle change", v);
      // $elm.innerHTML = "";
      // _each_items = [];
      // _children = [];
      // _$elms = [];
      if (!_mounted) {
        return;
      }
      methods._refresh(v);
    },
  };

  if (isRef(each)) {
    each._subscribe(ctx);
    // ctx.onChange(each.value);
  }

  return {
    t: "view",
    $elm,
    render() {
      // console.log('[For] render', each.value);
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < each.value.length; i += 1) {
        const item = each.value[i];
        console.log("", i, item);
        _each_items[i] = item;
        const res = render(item, i);
        (() => {
          if (!res) {
            _children[i] = null;
            return;
          }
          if (isComponent(res)) {
            _children[i] = res;
            const $sub = res.render();
            _$elms[i] = $sub;
            $fragment.appendChild($sub);
          } else {
            _children[i] = null;
          }
        })();
      }
      $elm.appendChild($fragment);
      _mounted = true;
      return $elm;
    },
  };
}
