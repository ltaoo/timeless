import {
  TimelessElement,
  VNodeView,
  ViewStyleProperties,
  isElement,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";

let _batch_mode = false;
let _pending_mounted: (() => void)[] = [];
let _raf_scheduled = false;

export function HostElement(props: {
  t: string;
  $elm: null | any;
  build: (elm: TimelessElement) => VNodeView<any>;
}) {
  let $elm = props.$elm;

  /** 宿主平台的子节点列表 */
  let $children: any[] = [];
  /** 对宿主平台抽象的子节点列表 */
  let child_nodes: (VNodeView<any> | null)[] = [];
  /** Timeless 子列表 */
  let child_elements: (TimelessElement | null)[] = [];
  let _events: any = null;
  let $inactive_fragment: DocumentFragment | null = null;
  let $inactive_scroll: [Element, number, number][] = [];

  // console.log("create box");

  const methods = {
    set$elm(elm: HTMLElement | Text) {
      $elm = elm;
    },
    startBatch() {
      _batch_mode = true;
    },
    endBatch() {
      _batch_mode = false;
      if (_pending_mounted.length > 0 && !_raf_scheduled) {
        _raf_scheduled = true;
        requestAnimationFrame(() => {
          _raf_scheduled = false;
          const cbs = _pending_mounted;
          _pending_mounted = [];
          for (const cb of cbs) cb();
        });
      }
    },
    get$elm() {
      return $elm;
    },
    set$childrne(v: any[]) {
      $children = v;
    },
    setchildrenelement(v: (TimelessElement | null)[]) {
      child_elements = v;
    },
    setchildnode(v: (VNodeView<any> | null)[]) {
      child_nodes = v;
    },
    setStyle(
      style: ViewStyleProperties,
      opt: Partial<{ initial?: boolean }> = {},
    ) {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      const cssText = viewStyleToCssText(style);
      if (!opt.initial) {
        if (cssText) {
          $elm.style.cssText = cssText;
        } else {
          $elm.removeAttribute("style");
        }
      } else {
        if (cssText) {
          $elm.style.cssText = cssText;
        }
      }
    },
    setStyleSet(styleSet: string[], opt: Partial<{ initial?: boolean }> = {}) {
      // console.log(`[dom]${props.t} - setStyleSet`, $elm, styleSet, opt);
      if (!$elm || $elm.nodeType === 3 || !styleSet) {
        return;
      }
      if (!opt.initial) {
        if (styleSet.length === 0) {
          $elm.removeAttribute("class");
        } else {
          $elm.setAttribute("class", styleSet.join(" "));
        }
      } else {
        if (styleSet.length !== 0) {
          $elm.setAttribute("class", styleSet.join(" "));
        }
      }
    },
    setStyleValue(key: any, value: string) {
      // console.log(props.t + "[HostElement]setStyleValue", key, value, $elm);
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.style[key] = value;
    },
    setAttribute(key: string, value: string) {
      // console.log(props.t + "[dom]box - setAttribute", key, value, $elm);
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.removeAttribute(key);
    },
    getBoundingClientRect() {
      if (!$elm || !($elm instanceof HTMLElement)) {
        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };
      }
      return $elm.getBoundingClientRect();
    },
    blur() {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.blur();
    },
    focus() {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.focus();
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.addEventListener(type, handler, options);
      return function () {
        if (!$elm || $elm.nodeType === 3) {
          return;
        }
        $elm.removeEventListener(type, handler, options);
      };
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      if (!$elm || $elm.nodeType === 3) {
        return;
      }
      $elm.removeEventListener(type, handler, options);
    },
    setupEventListener(events: any) {
      if (!events || !$elm || $elm.nodeType === 3) {
        return;
      }
      if (events.onClick) {
        $elm.addEventListener("click", events.onClick);
      }
      if (events.onDoubleClick) {
        $elm.addEventListener("dblclick", events.onDoubleClick);
      }
      if (events.onMouseDown) {
        $elm.addEventListener("mousedown", events.onMouseDown);
      }
      if (events.onMouseUp) {
        $elm.addEventListener("mouseup", events.onMouseUp);
      }
      if (events.onPointerDown) {
        $elm.addEventListener("pointerdown", events.onPointerDown);
      }
      if (events.onPointerUp) {
        $elm.addEventListener("pointerup", events.onPointerUp);
      }
      if (events.onFocus) {
        $elm.addEventListener("focus", events.onFocus);
      }
      if (events.onBlur) {
        $elm.addEventListener("blur", events.onBlur);
      }
      if (events.onKeyDown) {
        $elm.addEventListener("keydown", events.onKeyDown);
      }
      if (events.onContextMenu) {
        $elm.addEventListener("contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        $elm.addEventListener("mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        $elm.addEventListener("mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        $elm.addEventListener("dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        $elm.addEventListener("drag", events.onDrag);
      }
      if (events.onDragEnd) {
        $elm.addEventListener("dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        $elm.addEventListener("dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        $elm.addEventListener("dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        $elm.addEventListener("dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        $elm.addEventListener("drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        $elm.addEventListener("animationend", events.onAnimationEnd);
      }
      if (events.onWheel) {
        $elm.addEventListener("wheel", events.onWheel);
      }
    },
    teardownEventListener(events: any) {
      if (!events || !$elm || $elm.nodeType === 3) {
        return;
      }
      _events = events;
      if (events.onClick) {
        $elm.removeEventListener("click", events.onClick);
      }
      if (events.onDoubleClick) {
        $elm.removeEventListener("dblclick", events.onDoubleClick);
      }
      if (events.onMouseDown) {
        $elm.removeEventListener("mousedown", events.onMouseDown);
      }
      if (events.onMouseUp) {
        $elm.removeEventListener("mouseup", events.onMouseUp);
      }
      if (events.onPointerDown) {
        $elm.removeEventListener("pointerdown", events.onPointerDown);
      }
      if (events.onFocus) {
        $elm.removeEventListener("focus", events.onFocus);
      }
      if (events.onBlur) {
        $elm.removeEventListener("blur", events.onBlur);
      }
      if (events.onKeyDown) {
        $elm.removeEventListener("keydown", events.onKeyDown);
      }
      if (events.onContextMenu) {
        $elm.removeEventListener("contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        $elm.removeEventListener("mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        $elm.removeEventListener("mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        $elm.removeEventListener("dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        $elm.removeEventListener("drag", events.onDrag);
      }
      if (events.onDragEnd) {
        $elm.removeEventListener("dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        $elm.removeEventListener("dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        $elm.removeEventListener("dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        $elm.removeEventListener("dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        $elm.removeEventListener("drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        $elm.removeEventListener("animationend", events.onAnimationEnd);
      }
    },
    applyState(
      state: TimelessElement["state"],
      opt: Partial<{ initial?: boolean }> = {},
    ) {
      if (!state) {
        return;
      }
      if (state.style) {
        methods.setStyle(state.style, opt);
      }
      if (state.styleSet) {
        methods.setStyleSet(state.styleSet, opt);
      }
      const attrs = state.attributes;
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
          if (value !== undefined) {
            methods.setAttribute(key, String(value));
          } else {
            methods.removeAttribute(key);
          }
        }
      }
      const dataset = state.dataset;
      if (dataset) {
        for (const [key, value] of Object.entries(dataset)) {
          const k = `data-${key}`;
          if (value !== undefined) {
            methods.setAttribute(k, String(value));
          } else {
            methods.removeAttribute(k);
          }
        }
      }
    },
    render(children: (TimelessElement | null)[] = []) {
      child_elements = [];
      const $fragment = document.createDocumentFragment();

      for (const child of children) {
        if (isElement(child)) {
          const child$ = props.build(child);
          const $child = child$.render();
          child_elements.push(child);
          child_nodes.push(child$);
          if ($child) {
            $children.push($child);
            $fragment.appendChild($child);
          }
        }
      }
      // console.log(props.t + "[]after render", child_elements);
      return $fragment;
    },
    handleElementsMounted() {
      // console.log(props.t + "[]box handleElements Mounted", child_elements);
      for (const child of child_elements) {
        if (child && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    handleElementUnmounted() {
      for (const child of child_elements) {
        if (child && child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
    get$children() {
      return $children;
    },
    getChildren() {
      return child_nodes;
    },
    setChildrenActive(active: boolean) {
      if (!$elm || $elm.nodeType !== 1) return;
      if (active) {
        if ($inactive_fragment) {
          $elm.appendChild($inactive_fragment);
          $inactive_fragment = null;
        }
        $elm.hidden = false;
        for (const [element, left, top] of $inactive_scroll) {
          element.scrollLeft = left;
          element.scrollTop = top;
        }
        $inactive_scroll.length = 0;
        return;
      }
      if ($inactive_fragment) return;
      $inactive_scroll.length = 0;
      // ponytail: scan once on deactivation; track scroll events only if large pages make this measurable.
      for (const element of [$elm, ...$elm.querySelectorAll("*")]) {
        if (element.scrollLeft || element.scrollTop) {
          $inactive_scroll.push([
            element,
            element.scrollLeft,
            element.scrollTop,
          ]);
        }
      }
      $elm.hidden = true;
      $inactive_fragment = document.createDocumentFragment();
      while ($elm.firstChild) {
        $inactive_fragment.appendChild($elm.firstChild);
      }
    },
    buildChildren(children?: (TimelessElement | null)[]) {
      const child_elements: (TimelessElement | null)[] = [];
      const child_host_nodes: any[] = [];
      const child_nodes: VNodeView<any>[] = [];
      // console.log("append children", children);
      const $fragment = document.createDocumentFragment();
      if (!children) {
        return { $fragment, child_elements, child_host_nodes, child_nodes };
      }
      for (let child of children) {
        if (!child) {
          continue;
        }
        if (isElement(child)) {
          child_elements.push(child);
          const child$ = props.build(child);
          if (!child$) {
            continue;
          }
          child_nodes.push(child$);
          const $child = child$.render();
          if ($child) {
            child_host_nodes.push($child);
            $fragment.appendChild($child);
          }
        }
      }
      return {
        $fragment,
        child_elements,
        child_host_nodes,
        child_nodes,
      };
    },
    // 这个应该叫 insert sibling 更合理
    insertChildren(
      children: (TimelessElement | null)[],
      opt?: { $parent: any; logger?: any },
    ) {
      const r = methods.buildChildren(children);
      const inserted_elements = [...r.child_elements];
      const $parent = opt?.$parent || methods.getParent();
      if ($parent) {
        if ($elm && $elm.nodeType === 3) {
          $parent.insertBefore(r.$fragment, $elm);
        } else {
          $parent.appendChild(r.$fragment);
        }
      }
      child_elements = r.child_elements as TimelessElement[];
      $children = r.child_host_nodes;
      child_nodes = r.child_nodes;
      const handle_inserted_elements_mounted = () => {
        for (const child of inserted_elements) {
          if (child?.onMounted) {
            child.onMounted({ target: child.$elm });
          }
        }
      };
      if (_batch_mode) {
        _pending_mounted.push(handle_inserted_elements_mounted);
      } else {
        setTimeout(handle_inserted_elements_mounted, 0);
      }
    },
    /**
     * 应该命名为 destroy children
     * 其实等同于 innerHTML = "" 即销毁全部内容
     */
    removeChildren(extra?: { $parent: any }) {
      const $parent = extra?.$parent || methods.getParent();
      if ($children.length === 0 && child_nodes.length === 0) {
        return;
      }
      const removed_elements = [...child_elements];

      for (let i = 0; i < child_nodes.length; i += 1) {
        const child_node = child_nodes[i];
        if (child_node) {
          child_node.removeChildren();
        }
      }

      // Remove child DOM nodes from parent
      if ($parent) {
        for (const $child of $children) {
          if ($child && $child.parentNode === $parent) {
            $parent.removeChild($child);
          }
        }
      }
      $children.length = 0;
      child_nodes.length = 0;
      child_elements.length = 0;
      // $elm = null;
      methods.teardownEventListener(_events);
      setTimeout(() => {
        // Call onUnmounted for all child elements
        for (const child of removed_elements) {
          if (child && child.onUnmounted) {
            child.onUnmounted();
          }
        }
      }, 0);
    },
    insert(
      idx: number,
      children: (TimelessElement | null)[],
      extra?: { $parent: any },
    ) {
      if (children.length === 0) {
        return;
      }
      const $parent = extra?.$parent || methods.getParent();
      if (!$parent) {
        return;
      }
      /**
       * 这里的 $elm 其实是 $anchor，一个 文本节点用于瞄定结尾位置
       * 比如 [Show({}), For({}), View({})] 这种场景，For 组件插入元素是在自己的「范围」内
       * 这个范围，无法靠 $children 来确定
       */
      const $reference = $children[idx];
      // console.log(
      //   props.t + "[dom]insert child",
      //   idx,
      //   children,
      //   $parent,
      //   $reference,
      //   [...$children],
      // );
      const inserted_elements: TimelessElement[] = [];
      const inserted_child: VNodeView[] = [];
      const inserted_host_nodes: any[] = [];
      const $fragment = document.createDocumentFragment();
      for (const child of children) {
        if (child) {
          const child$ = props.build(child);
          inserted_child.push(child$);
          const $child = child$.render();
          if ($child) {
            inserted_host_nodes.push($child);
            inserted_elements.push(child);
            $fragment.appendChild($child);
          }
        }
      }
      if ($reference) {
        $parent.insertBefore($fragment, $reference);
      } else if ($elm) {
        $parent.insertBefore($fragment, $elm);
      } else {
        $parent.appendChild($fragment);
      }
      $children.splice(idx, 0, ...inserted_host_nodes);
      child_elements.splice(idx, 0, ...inserted_elements);
      child_nodes.splice(idx, 0, ...inserted_child);
      if (_batch_mode) {
        const elements = [...inserted_elements];
        _pending_mounted.push(() => {
          for (const child of elements) {
            if (child.onMounted) child.onMounted({ target: child.$elm });
          }
        });
      } else {
        for (const child of inserted_elements) {
          if (child.onMounted) {
            child.onMounted({
              target: child.$elm,
            });
          }
        }
      }
    },
    remove(idx: number, count: number, extra?: { $parent: any }) {
      // console.log(props.t + "[box]remove", [...$children], child_elements);
      if (count === 0) {
        return;
      }
      const $parent = extra?.$parent || methods.getParent();
      if (!$parent) {
        console.warn("remove parent not found");
        return;
      }
      const $fragment = document.createDocumentFragment();
      const removed_elements: TimelessElement[] = [];
      for (let i = 0; i < count; i++) {
        const $child = $children[idx + i];
        if ($child) {
          // console.log(props.t + "[box]remove", idx + i, $child);
          $fragment.appendChild($child);
          const child_elm = child_elements[idx + i];
          if (child_elm) {
            removed_elements.push(child_elm);
          }
          // $parent.removeChild($child);
        }
      }
      $children.splice(idx, count);
      child_elements.splice(idx, count);
      child_nodes.splice(idx, count);
      setTimeout(() => {
        // console.log(
        //   "[dom]for - remove - before invoke onUnmounted",
        //   removed_elements,
        // );
        for (const child of removed_elements) {
          if (child && child.onUnmounted) {
            // console.log("invoke child.onUnmounted");
            child.onUnmounted();
          }
        }
      }, 0);
    },
    move(from: number, to: number) {
      const $parent = methods.getParent();
      if (!$parent) {
        console.warn("move parent not found");
        return;
      }
      const $from = $children[from];
      if (!$from) {
        console.warn("move node not found from", from);
        return;
      }
      // console.log("[timeless-dom]move node", from, to, $from);

      $children.splice(from, 1);
      $children.splice(to, 0, $from);

      const $to = $children[to + 1] || null;
      $parent.insertBefore($from, $to);
    },
    refresh(
      data: {
        children: (TimelessElement | null)[];
        added: { idx: number; elements: (TimelessElement | null)[] }[];
        removed: { idx: number; count: number }[];
        moved: { from: number; to: number }[];
      },
      extra?: { $parent: any },
    ) {
      const { added = [], removed = [], moved = [] } = data;
      if (added.length === 0 && removed.length === 0 && moved.length === 0) {
        return;
      }
      const $parent = extra?.$parent || methods.getParent();
      if (!$parent) {
        console.warn("refresh parent not found");
        return;
      }
      // console.log(props.t + "[dom]refresh - start", [...$children]);
      // 1. Remove (descending order to keep indices stable)
      const sorted_removed = [...removed].sort((a, b) => b.idx - a.idx);
      const removed_elements: (TimelessElement | null)[] = [];
      const removed_childs: any[] = [];
      const removed_child_nodes: (VNodeView<any> | null)[] = [];
      const fragment = document.createDocumentFragment();
      for (const { idx, count } of sorted_removed) {
        for (let i = 0; i < count; i++) {
          const $child = $children[idx + i];
          // console.log("remove $child", idx + i, $child);
          if ($child) {
            fragment.appendChild($child);
          }
        }
      }
      for (const { idx, count } of sorted_removed) {
        const childs = $children.splice(idx, count);
        removed_childs.push(...childs);
        const childs_elm = child_elements.splice(idx, count);
        removed_elements.push(...childs_elm);
        const childs_node = child_nodes.splice(idx, count);
        removed_child_nodes.push(...childs_node);
      }
      // Call onUnmounted for removed elements
      for (const child of removed_elements) {
        if (child && child.onUnmounted) {
          child.onUnmounted();
        }
      }

      // 2. Move
      if (moved.length > 0) {
        // moved.from 是原始数组下标，需映射到 remove 之后的下标
        const removedIdxs = removed.map((r) => r.idx).sort((a, b) => a - b);
        const entries = moved
          .map(({ from, to }) => {
            let shift = 0;
            for (const ri of removedIdxs) {
              if (ri < from) shift++;
              else break;
            }
            return { $node: $children[from - shift], to };
          })
          .sort((a, b) => a.to - b.to);

        for (const { $node, to } of entries) {
          if (!$node) continue;
          const currentFrom = $children.indexOf($node);
          if (currentFrom !== -1 && currentFrom !== to) {
            methods.move(currentFrom, to);
          }
        }
      }

      // 3. Insert added nodes
      for (const { idx, elements } of added) {
        methods.insert(idx, elements, extra);
      }
      // console.log("[dom]refresh - end", [...$children]);
    },
    setScrollTop(v: number) {
      if (!$elm) {
        return;
      }
      $elm.scrollTop = v;
    },
    getParent() {
      if (!$elm) {
        return null;
      }
      return $elm.parentElement;
    },
    destroy() {
      $elm = null;
      $inactive_fragment = null;
      $inactive_scroll.length = 0;
      $children.length = 0;
      child_nodes.length = 0;
      child_elements.length = 0;
      _events = null;
    },
    trackChild(
      dom: any,
      element: TimelessElement,
      vnode: VNodeView<any>,
      index: number,
    ) {
      $children.splice(index, 0, dom);
      child_elements.splice(index, 0, element);
      child_nodes.splice(index, 0, vnode);
    },
    untrackChild(index: number) {
      $children.splice(index, 1);
      child_elements.splice(index, 1);
      child_nodes.splice(index, 1);
    },
    replaceTrackedChild(
      index: number,
      dom: any,
      element: TimelessElement,
      vnode: VNodeView<any>,
    ) {
      if (index < $children.length) {
        $children[index] = dom;
        child_elements[index] = element;
        child_nodes[index] = vnode;
      } else {
        $children.splice(index, 0, dom);
        child_elements.splice(index, 0, element);
        child_nodes.splice(index, 0, vnode);
      }
    },
  };
  return {
    methods,
  };
}

/**
 * Count how many real DOM nodes an element produces when rendered.
 * Transparent components (show, fragment, for, match) don't produce wrapper nodes;
 * their children render directly into the parent.
 * Portal renders to document.body, not inline.
 * All other types produce exactly 1 DOM node.
 */
export function countRenderedNodes(elm: TimelessElement | null): number {
  if (!elm) return 0;
  const t = elm.t;
  if (
    t === "fragment" ||
    t === "portal" ||
    t === "show" ||
    t === "for" ||
    t === "match"
  ) {
    if (!elm.children) return 0;
    let count = 0;
    for (const child of elm.children) {
      count += countRenderedNodes(child);
    }
    return count;
  }
  return 1;
}

export function isFragment(elm: TimelessElement) {
  return ["fragment", "show", "for", "match"].includes(elm.t);
}
export function insertedAnchor(elm: TimelessElement) {
  return ["show", "for", "match"].includes(elm.t);
}
export function isEmptyNode(elm: TimelessElement) {
  return ["portal"].includes(elm.t);
}
