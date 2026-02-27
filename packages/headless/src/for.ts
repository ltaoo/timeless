import { ref, isRef, Ref } from "@timeless/reactive";

import { View, ViewProps, Component, isComponent } from "./view.js";

export function For<T>(
  props: ViewProps & {
    each: T[] | Ref<T[]>;
    render: (item: T, idx: number) => Component | null;
    key?: string;
  },
) {
  const { each, key, render, onMounted, onUnmounted, ...restProps } = props;

  const _key = key;
  let _mounted = false;
  let _each_items: T[] = [];
  let _children: (Component | null)[] = [];
  let _$elms: (HTMLElement | Text | null)[] = [];

  const view$ = View(restProps);
  const $elm = view$.$elm;
  $elm.setAttribute("for-wrapper", "true");

  const _existing_map = new Map();

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
    _insert(index: number, items: T[]) {
      const new_children: (Component | null)[] = new Array(items.length);
      const new_elms: (HTMLElement | Text | null)[] = new Array(items.length);

      // console.log("insert items", index, items);

      const $base = _$elms[index];
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        _each_items[index + i] = item;
        const res = render(item, index + i);
        (() => {
          if (!res) {
            _children[index + i] = null;
            return;
          }
          if (isComponent(res)) {
            _children[index + i] = res;
            const $sub = res.render();
            _$elms[index + i] = $sub;
            $fragment.appendChild($sub);
          } else {
            _children[index + i] = null;
          }
        })();
      }
      $elm.insertBefore($fragment, $base);
      // _each_items.splice(index, 0, ...items);
      // _children.splice(index, 0, ...new_children);
      // _$elms.splice(index, 0, ...new_elms);
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
      if (!res) {
        return;
      }
      if (res.delete) {
        return;
      }
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

      // 1. Prepare target state
      const new_children: (Component | null)[] = new Array(new_items.length);
      const new_elms: (HTMLElement | Text | null)[] = new Array(
        new_items.length,
      );

      // 2. Index old items for O(1) lookup
      const old_map = new Map<any, number[]>();
      prev_items.forEach((item, index) => {
        const k = _key && item ? (item as any)[_key] : item;
        let indices = old_map.get(k);
        if (!indices) {
          indices = [];
          old_map.set(k, indices);
        }
        indices.push(index);
      });

      // 3. Diff Phase: Identify operations
      const added_nodes: { node: Component; elm: HTMLElement | Text }[] = [];
      const updated_nodes: {
        node: Component;
        elm: HTMLElement | Text;
      }[] = [];
      const removed_nodes: {
        elm: HTMLElement | Text | null;
        component: Component | null;
      }[] = [];

      // Iterate new items -> Determine Reused vs Added
      for (let i = 0; i < new_items.length; i++) {
        const item = new_items[i];
        const k = _key && item ? (item as any)[_key] : item;
        const prev_indices = old_map.get(k);

        if (prev_indices && prev_indices.length > 0) {
          // Reused
          const oldIndex = prev_indices.shift()!;
          const oldItem = prev_items[oldIndex];

          if (item !== oldItem) {
            const res = methods._render_item(item, i);
            new_children[i] = res.node;
            new_elms[i] = res.elm;

            removed_nodes.push({
              elm: prev_elms[oldIndex],
              component: prev_children[oldIndex],
            });

            if (res.node && res.elm && isComponent(res.node)) {
              added_nodes.push({ node: res.node, elm: res.elm });
              updated_nodes.push({ node: res.node, elm: res.elm });
            }
          } else {
            new_children[i] = prev_children[oldIndex];
            new_elms[i] = prev_elms[oldIndex];
          }
        } else {
          // Added (New)
          const res = methods._render_item(item, i);
          new_children[i] = res.node;
          new_elms[i] = res.elm;
          if (res.node && res.elm && isComponent(res.node)) {
            added_nodes.push({ node: res.node, elm: res.elm });
          }
        }
      }

      // Remaining items in old_map are Removed
      for (const indices of old_map.values()) {
        for (const index of indices) {
          removed_nodes.push({
            elm: prev_elms[index],
            component: prev_children[index],
          });
        }
      }

      console.log("1. removed_nodes", removed_nodes);
      console.log("2. added_nodes", added_nodes);
      console.log("3. updated_nodes", updated_nodes);
      // 4. Patch Phase: Apply to DOM

      // 4.1 Remove nodes
      for (const { elm, component } of removed_nodes) {
        if (elm && elm.parentNode === $elm) {
          $elm.removeChild(elm);
        }
        if (component && isComponent(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
          }
        }
      }

      // 4.2 Reorder / Insert nodes
      for (let i = 0; i < new_elms.length; i++) {
        const node = new_elms[i];
        if (!node) continue;
        const cur_node = $elm.childNodes[i];
        if (node !== cur_node) {
          $elm.insertBefore(node, cur_node || null);
        }
      }

      // 4.3 Trigger Lifecycle (Mounted)
      for (const { node, elm } of added_nodes) {
        if (typeof node.onMounted === "function") {
          node.onMounted(elm);
        }
      }

      // 5. Update State
      _each_items = new_items;
      _children = new_children;
      _$elms = new_elms;
    },
  };

  const ctx = {
    onPatch(change: any) {
      // console.log("[headless]For - ctx.onPatch - handle patch", change);
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
      if (!_mounted) {
        return;
      }
      methods._refresh(v);
    },
  };

  if (isRef(each)) {
    each._subscribe(ctx);
  }
  return {
    t: "view",
    $elm,
    render() {
      const nodes = isRef(each) ? each.value : each;
      console.log("[For] render", nodes);
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        // console.log("before mounted", i, item);
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
      if (onMounted) {
        onMounted($elm);
      }
      // console.log("2. mounted", _children);
      for (let i = 0; i < _children.length; i += 1) {
        const component = _children[i];
        if (isComponent(component)) {
          if (typeof component.onMounted === "function") {
            component.onMounted(_$elms[i] as any as HTMLElement);
          }
        }
      }
      return $elm;
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const component = _children[i];
        if (isComponent(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
          }
        }
      }
      _mounted = false;
      _each_items = [];
      _children = [];
      _$elms = [];
      $elm.innerHTML = "";
    },
  };
}
