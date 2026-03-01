import { ref, isRef, Ref } from "@timeless/reactive";

import { View, ViewProps, TimelessElement, isElement } from "./view";

export function For<T>(
  props: ViewProps & {
    each: T[] | Ref<T[]>;
    render: (item: T, idx: number) => TimelessElement | null;
    key?: string;
  },
) {
  const { each, key, render, onMounted, onUnmounted, ...restProps } = props;

  const _key = key;
  let _mounted = false;
  let _values: T[] = [];
  let _elements: (TimelessElement | null)[] = [];
  let _$children: (HTMLElement | Text | DocumentFragment | null)[] = [];

  const view$ = View(restProps);
  const $elm = view$.$elm;
  $elm.setAttribute("for-wrapper", "true");

  const _existing_map = new Map();

  const methods = {
    _render_item(item: T, index: number) {
      const rr: {
        node: null | TimelessElement;
        elm: null | HTMLElement | Text | DocumentFragment;
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
      // const new_children: (TimelessElement | null)[] = new Array(items.length);
      // const new_elms: (HTMLElement | Text | null)[] = new Array(items.length);
      const $base = _$children[index];
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < items.length; i++) {
        const item_prepare_insert = items[i];
        _values.splice(index + i, 0, item_prepare_insert);
        // @todo index + i 改为是 Ref 类型
        const res = render(item_prepare_insert, index + i);
        (() => {
          _elements.splice(index + i, 0, res);
          if (!res) {
            return;
          }
          if (isElement(res)) {
            const $elm_prepare_insert = res.render();
            _$children.splice(index + i, 0, $elm_prepare_insert);
            if ($elm_prepare_insert) {
              $fragment.appendChild($elm_prepare_insert);
            }
          }
        })();
      }
      $elm.insertBefore($fragment, $base || null);
      // console.log("[headless]For - insert items", index, items, _$children);
    },
    _remove(index: number, count: number) {
      for (let i = 0; i < count; i += 1) {
        const elm = _$children[index + i];
        // console.log(i, index + i, elm, _$children);
        if (elm && elm.parentNode === $elm) {
          $elm.removeChild(elm);
        }
        const item = _values[index + i];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        _values.splice(index + i, 1);
        _elements.splice(index + i, 1);
        _$children.splice(index + i, 1);
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
      const old = _$children[index];
      if (old && old.parentNode === $elm && res.elm) {
        $elm.replaceChild(res.elm, old);
      } else if (res.elm) {
        $elm.appendChild(res.elm);
        // if (res.onMounted) {
        //   res.onMounted();
        // }
      }

      const oldItem = _values[index];
      if (oldItem !== item && _existing_map.has(oldItem)) {
        _existing_map.delete(oldItem);
      }

      _values[index] = item;
      _elements[index] = res.node;
      _$children[index] = res.elm;
    },
    _refresh(v: T[]) {
      const new_items = v;
      const prev_items = _values;
      const prev_elements = _elements;
      const prev_children = _$children;

      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(new_items.length);
      const new_children: (HTMLElement | Text | DocumentFragment | null)[] = new Array(
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
      const added_nodes: { node: TimelessElement; elm: HTMLElement | Text | DocumentFragment }[] = [];
      const updated_nodes: {
        node: TimelessElement;
        elm: HTMLElement | Text | DocumentFragment;
      }[] = [];
      const removed_nodes: {
        elm: HTMLElement | Text | DocumentFragment | null;
        component: TimelessElement | null;
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
            new_elements[i] = res.node;
            new_children[i] = res.elm;

            removed_nodes.push({
              elm: prev_children[oldIndex],
              component: prev_elements[oldIndex],
            });

            if (res.node && res.elm && isElement(res.node)) {
              added_nodes.push({ node: res.node, elm: res.elm });
              updated_nodes.push({ node: res.node, elm: res.elm });
            }
          } else {
            new_elements[i] = prev_elements[oldIndex];
            new_children[i] = prev_children[oldIndex];
          }
        } else {
          // Added (New)
          const res = methods._render_item(item, i);
          new_elements[i] = res.node;
          new_children[i] = res.elm;
          if (res.node && res.elm && isElement(res.node)) {
            added_nodes.push({ node: res.node, elm: res.elm });
          }
        }
      }

      // Remaining items in old_map are Removed
      for (const indices of old_map.values()) {
        for (const index of indices) {
          removed_nodes.push({
            elm: prev_children[index],
            component: prev_elements[index],
          });
        }
      }

      // console.log("1. removed_nodes", removed_nodes);
      // console.log("2. added_nodes", added_nodes);
      // console.log("3. updated_nodes", updated_nodes);
      // 4. Patch Phase: Apply to DOM

      // 4.1 Remove nodes
      for (const { elm, component } of removed_nodes) {
        if (elm && elm.parentNode === $elm) {
          $elm.removeChild(elm);
        }
        if (component && isElement(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
          }
        }
      }

      // 4.2 Reorder / Insert nodes
      for (let i = 0; i < new_children.length; i++) {
        const node = new_children[i];
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
      _values = new_items;
      _elements = new_elements;
      _$children = new_children;
    },
  };

  const ctx = {
    onPatch(change: any) {
      // console.log("[headless]For - ctx.onPatch - handle patch", change);
      if (change.type === "insert") {
        methods._insert(change.index, change.items);
      }
      if (change.type === "delete") {
        methods._remove(change.index, change.deleteCount);
      }
      if (change.type === "update") {
        methods._update(change.index, change.item);
      }
    },
    onChange(v: T[] = []) {
      // console.log('[headless]For - ctx.onChange', v);
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
      const nodes = (isRef(each) ? each.value : each) || [];
      // console.log("[For] render", nodes);
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        // console.log("before mounted", i, item);
        _values[i] = item;
        const res = render(item, i);
        (() => {
          if (!res) {
            _elements[i] = null;
            return;
          }
          if (isElement(res)) {
            _elements[i] = res;
            const $sub = res.render();
            _$children[i] = $sub;
            if ($sub) {
              $fragment.appendChild($sub);
            }
          } else {
            _elements[i] = null;
          }
        })();
      }
      $elm.appendChild($fragment);
      _mounted = true;
      if (onMounted) {
        onMounted($elm);
      }
      // console.log("2. mounted", _children);
      for (let i = 0; i < _elements.length; i += 1) {
        const component = _elements[i];
        if (isElement(component)) {
          if (typeof component.onMounted === "function") {
            component.onMounted(_$children[i] as any as HTMLElement);
          }
        }
      }
      return $elm;
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      for (let i = 0; i < _elements.length; i += 1) {
        const component = _elements[i];
        if (isElement(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
          }
        }
      }
      _mounted = false;
      _values = [];
      _elements = [];
      _$children = [];
      $elm.innerHTML = "";
    },
  };
}
