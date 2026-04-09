import {
  TimelessElement,
  VNodeView,
  ViewStyleProperties,
  isElement,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";

export function HostElement(props: {
  t: string;
  $elm: null | HTMLElement | Text;
  build: (elm: TimelessElement) => VNodeView<any>;
}) {
  const { $elm } = props;

  /** 宿主平台的子节点列表 */
  let child_host_nodes: any[] = [];
  /** 对宿主平台抽象的子节点列表 */
  let child_nodes: VNodeView<any>[] = [];
  /** Timeless 子列表 */
  let child_elements: TimelessElement[] = [];

  const methods = {
    getChildren() {
      return child_nodes;
    },
    setStyle(style: ViewStyleProperties) {
      if (!$elm || $elm instanceof Text) {
        return;
      }
      const cssText = viewStyleToCssText(style);
      if (cssText) {
        $elm.style.cssText = cssText;
      }
    },
    setStyleSet(styleSet: string[]) {
      if (!$elm || $elm instanceof Text || !styleSet || styleSet.length === 0) {
        return;
      }
      $elm.className = styleSet.join(" ");
    },
    setStyleValue(key: any, value: string) {
      if (!$elm || $elm instanceof Text) {
        return;
      }
      $elm.style[key] = value;
    },
    setAttribute(key: string, value: string) {
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
    applyState(state: TimelessElement["state"]) {
      if (!state) {
        return;
      }
      if (state.style) {
        methods.setStyle(state.style);
      }
      if (state.styleSet) {
        methods.setStyleSet(state.styleSet);
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
          child_elements.push(child);
          const child$ = props.build(child);
          child_nodes.push(child$);
          const $child = child$.render(child);
          if ($child) {
            child_host_nodes.push($child);
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
        if (child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    handleElementUnmounted() {
      for (const child of child_elements) {
        if (child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
    appendChildren(children: (TimelessElement | null)[]) {
      // console.log("append children", children);
      const $fragment = document.createDocumentFragment();
      child_elements = [];
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
      // for (let child of child_elements) {
      //   if (child.onMounted) {
      //     child.onMounted({
      //       target: child.$elm,
      //     });
      //   }
      // }
      return $fragment;
    },
    insertChildren(children: (TimelessElement | null)[]) {
      const $fragment = this.appendChildren(children);
      const $parent = methods.getParent();
      if ($parent) {
        $parent.appendChild($fragment);
      }
      for (let child of child_elements) {
        if (child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    removeChildren() {
      if (child_host_nodes.length === 0) {
        return;
      }
      const $parent = methods.getParent();
      console.log(props.t + "[]removeChildren", $parent, child_host_nodes);
      for (const child of child_nodes) {
        if (child) {
          child.removeChildren();
        }
      }
      if ($parent) {
        for (const $child of child_host_nodes) {
          if ($child && $child.parentElement === $parent) {
            $parent.removeChild($child);
          }
        }
      }
      // console.log(
      //   props.t + "[]removeChildren invoke onUnmounted",
      //   child_elements,
      // );
      for (let child of child_elements) {
        if (child.onUnmounted) {
          child.onUnmounted();
        }
      }
      child_elements = [];
      child_host_nodes = [];
      child_nodes = [];
    },
    insert(idx: number, children: (TimelessElement | null)[]) {
      const $parent = methods.getParent();
      // console.log("[dom]For - insert", idx, children, $parent);
      if (!$parent) {
        // console.warn("[dom]For - insert - $parent is null");
        return;
      }
      for (const child of children) {
        if (child) {
          const child$ = props.build(child);
          const $reference = child_host_nodes[idx];
          // console.log("[dom]For - insert - $child", child$, idx, $reference);
          const $child = child$.render(child);
          if ($child) {
            if ($reference) {
              child_host_nodes.splice(idx, 0, $child);
              $parent.insertBefore($child, $reference);
            } else {
              child_host_nodes.push($child);
              $parent.appendChild($child);
            }
          }
        }
      }
    },
    remove(idx: number, count: number) {
      // console.log("[dom]For - remove", idx, count, child_host_nodes);
      const $parent = methods.getParent();
      if (!$parent) {
        return;
      }
      for (let i = 0; i < count; i++) {
        const $child = child_host_nodes[idx + i];
        if ($child) {
          child_host_nodes.splice(idx + i, 1);
          $parent.removeChild($child);
        }
      }
    },
    refresh(data: {
      children: (TimelessElement | null)[];
      added: { idx: number; element: TimelessElement | null }[];
      removed: { idx: number }[];
      moved: { from: number; to: number }[];
    }) {
      const { added, removed, moved } = data;
      const $parent = methods.getParent();
      if (!$parent) {
        return;
      }
      // 1. Remove (descending order to keep indices stable)
      const sorted_removed = [...removed].sort((a, b) => b.idx - a.idx);
      for (const { idx } of sorted_removed) {
        const $child = child_host_nodes[idx];
        if ($child) {
          $parent.removeChild($child);
        }
        child_host_nodes.splice(idx, 1);
      }

      // 2. Move (detach moved nodes, rebuild order, reinsert)
      if (moved.length > 0) {
        const move_entries = moved.map(({ from, to }) => ({
          $node: child_host_nodes[from],
          to,
        }));

        const moved_from_set = new Set(moved.map((m) => m.from));
        const remaining = child_host_nodes.filter(
          (_, i) => !moved_from_set.has(i),
        );

        // Insert moved nodes at their target positions (ascending order)
        const sorted_moves = [...move_entries].sort((a, b) => a.to - b.to);
        const result: ChildNode[] = [...remaining];
        for (const { $node, to } of sorted_moves) {
          if ($node) {
            result.splice(to, 0, $node);
          }
        }

        // Reinsert all children in correct order before anchor
        for (const $node of result) {
          if ($node) {
            $parent.insertBefore($node, $elm);
          }
        }

        child_host_nodes = [];
        child_host_nodes.push(...result);
      }

      // 3. Insert added nodes
      for (const { idx, element } of added) {
        if (element) {
          const child$ = props.build(element);
          const $child = child$.render(element);
          if ($child) {
            const $reference = child_host_nodes[idx];
            if ($reference) {
              child_host_nodes.splice(idx, 0, $child);
              const $parent = $reference.parentElement;
              if ($parent) {
                $parent.insertBefore($child, $reference);
              }
            } else {
              child_host_nodes.push($child);
              $parent.appendChild($child);
            }
          }
        }
      }
    },
    getParent() {
      if (!$elm) {
        return null;
      }
      return $elm.parentElement;
    },
  };
  return {
    methods,
  };
}
