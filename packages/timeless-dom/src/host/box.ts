import {
  TimelessElement,
  VNodeView,
  ViewStyleProperties,
  isElement,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";

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

  const methods = {
    set$elm(elm: HTMLElement | Text) {
      $elm = elm;
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
      if (!$elm || $elm instanceof Text) {
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
      if (!$elm || $elm instanceof Text || !styleSet) {
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
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.style[key] = value;
    },
    setAttribute(key: string, value: string) {
      // console.log(props.t + "[dom]box - setAttribute", key, value, $elm);
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      if (!$elm || $elm instanceof Text) {
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
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.blur();
    },
    focus() {
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.focus();
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.addEventListener(type, handler, options);
      return function () {
        if (!$elm || $elm instanceof Text) {
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
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.removeEventListener(type, handler, options);
    },
    setupEventListener(events: any) {
      if (!events || !$elm || $elm instanceof Text) {
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
    },
    teardownEventListener(events: any) {
      if (!events || !$elm || $elm instanceof Text) {
        return;
      }
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
    },
    render(children: (TimelessElement | null)[] = []) {
      child_elements = [];
      const $fragment = document.createDocumentFragment();
      for (const child of children) {
        if (isElement(child)) {
          const child$ = props.build(child);
          const $child = child$.render(child);
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
      console.log(props.t + "[]box handleElements Mounted", child_elements);
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
          const $child = child$.render(child);
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
    insertChildren(children: (TimelessElement | null)[]) {
      const r = methods.buildChildren(children);
      const $parent = methods.getParent();
      console.log(
        "[HostElement.insertChildren]",
        props.t,
        "$elm=",
        $elm,
        "$parent=",
        $parent,
        "fragment children=",
        r.$fragment.childNodes.length,
      );
      if ($parent) {
        if ($elm && $elm instanceof Text) {
          $parent.insertBefore(r.$fragment, $elm);
        } else {
          $parent.appendChild(r.$fragment);
        }
      }
      child_elements = r.child_elements as TimelessElement[];
      $children = r.child_host_nodes;
      child_nodes = r.child_nodes;
      setTimeout(() => {
        console.log(props.t + "[]invoke children onMounted function");
        methods.handleElementsMounted();
      }, 0);
    },
    removeChildren() {
      if ($children.length === 0 && child_nodes.length === 0) {
        return;
      }
      const $parent = methods.getParent();
      // console.log(props.t + "[]removeChildren", $parent, child_host_nodes);
      // hydrate 加载的，没有 child_nodes，导致通过该方法销毁的子元素没有 onUnmounted 方法
      for (const child of child_nodes) {
        if (child) {
          child.removeChildren();
        }
      }
      if ($parent) {
        for (const $child of $children) {
          if ($child === $elm) {
            continue;
          }
          if ($child && $child.parentElement === $parent) {
            $parent.removeChild($child);
          }
        }
      }
      // console.log(
      //   props.t + "[]removeChildren invoke onUnmounted",
      //   child_elements,
      // );
      methods.handleElementUnmounted();
      child_elements = [];
      $children = [];
      child_nodes = [];
    },
    insert(idx: number, children: (TimelessElement | null)[]) {
      const $parent = methods.getParent();
      const inserted_elements: TimelessElement[] = [];
      const inserted_child: VNodeView[] = [];
      const $reference = $children[idx] || $elm;
      console.log("[dom]insert child", idx, children, $parent, $reference);
      if (!$parent) {
        return;
      }
      for (const child of children) {
        if (child) {
          const child$ = props.build(child);
          inserted_child.push(child$);
          // console.log("[dom]For - insert - $child", child$, idx, $reference);
          const $child = child$.render(child);
          if ($child) {
            if ($reference) {
              $children.splice(idx, 0, $child);
              inserted_elements.push(child);
              $parent.insertBefore($child, $reference);
            } else {
              $children.push($child);
              inserted_elements.push(child);
              $parent.appendChild($child);
            }
          }
        }
      }
      child_elements.splice(idx, 0, ...inserted_elements);
      child_nodes.splice(idx, 0, ...inserted_child);
      // console.log("[dom]for - insert", inserted_elements);
      for (const child of inserted_elements) {
        if (child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    remove(idx: number, count: number) {
      // console.log("[dom]for - remove", child_elements);
      const $parent = methods.getParent();
      if (!$parent) {
        console.warn("remove parent not found");
        return;
      }
      const removed_elements: TimelessElement[] = [];
      for (let i = 0; i < count; i++) {
        const $child = $children[idx + i];
        if ($child && $child.parentElement === $parent) {
          $children.splice(idx + i, 1);
          const child_elm = child_elements[idx + i];
          if (child_elm) {
            removed_elements.push(child_elm);
          }
          $parent.removeChild($child);
        }
      }
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
      console.log("[timeless-dom]move node", from, to, $from);

      $children.splice(from, 1);
      $children.splice(to, 0, $from);

      const $to = $children[to + 1] || null;
      $parent.insertBefore($from, $to);
    },
    refresh(data: {
      children: (TimelessElement | null)[];
      added: { idx: number; elements: (TimelessElement | null)[] }[];
      removed: { idx: number }[];
      moved: { from: number; to: number }[];
    }) {
      const { added, removed, moved } = data;
      const $parent = methods.getParent();
      if (!$parent) {
        console.warn("refresh parent not found");
        return;
      }
      // 1. Remove (descending order to keep indices stable)
      const sorted_removed = [...removed].sort((a, b) => b.idx - a.idx);
      for (const { idx } of sorted_removed) {
        const $child = $children[idx];
        if ($child) {
          $parent.removeChild($child);
        }
        $children.splice(idx, 1);
      }

      // 2. Move
      if (moved.length > 0) {
        // for (let i = 0; i < moved.length; i++) {
        //   const { from, to } = moved[i];
        // }
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
        methods.insert(idx, elements);
        // if (element) {
        //   const child$ = props.build(element);
        //   const $child = child$.render(element);
        //   if ($child) {
        //     const $reference = $children[idx];
        //     if ($reference) {
        //       $children.splice(idx, 0, $child);
        //       const $parent = $reference.parentElement;
        //       if ($parent) {
        //         $parent.insertBefore($child, $reference);
        //       }
        //     } else {
        //       $children.push($child);
        //       $parent.appendChild($child);
        //     }
        //   }
        // }
      }
    },
    getParent() {
      if (!$elm) {
        return null;
      }
      return $elm.parentElement;
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
  if (t === "show" || t === "fragment" || t === "for" || t === "match") {
    if (!elm.children) return 0;
    let count = 0;
    for (const child of elm.children) {
      count += countRenderedNodes(child);
    }
    return count;
  }
  if (t === "portal") return 0;
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
