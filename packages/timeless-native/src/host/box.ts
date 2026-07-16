import {
  TimelessElement,
  VNodeRect,
  ViewStyleProperties,
  isElement,
} from "@timeless/timeless";

export interface BoxMethods {
  set$elm(elm: any): void;
  get$elm(): any;
  set$childrne(v: any[]): void;
  setchildrenelement(v: any[]): void;
  setchildnode(v: any[]): void;
  setStyle(
    style: ViewStyleProperties,
    opt?: Partial<{ initial?: boolean }>,
  ): void;
  setStyleSet(styleSet: string[], opt?: Partial<{ initial?: boolean }>): void;
  setStyleValue(key: any, value: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  blur(): void;
  focus(): void;
  getBoundingClientRect(): VNodeRect;
  addEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  setupEventListener(events: any): void;
  applyState(
    state: TimelessElement["state"],
    opt?: Partial<{ initial?: boolean }>,
  ): void;
  render(children?: (TimelessElement | null)[]): any;
  handleElementsMounted(): void;
  handleElementUnmounted(): void;
  getChildren(): any[];
  buildChildren(children?: (TimelessElement | null)[]): {
    $fragment: any;
    child_elements: (TimelessElement | null)[];
    child_host_nodes: any[];
    child_nodes: any[];
  };
  insertChildren(children: (TimelessElement | null)[]): void;
  removeChildren(): void;
  insert(idx: number, children: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  move(from: number, to: number): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; element: TimelessElement | null }[];
    removed: { idx: number }[];
    moved: { from: number; to: number }[];
  }): void;
  getParent(): any;
}

export function HostElement(props: {
  t: string;
  $elm: null | any;
  build: (elm: TimelessElement) => any;
}): { methods: BoxMethods } {
  let $elm = props.$elm;

  let child_host_nodes: any[] = [];
  let child_nodes: any[] = [];
  let child_elements: (TimelessElement | null)[] = [];

  const methods: BoxMethods = {
    set$elm(elm: any) {
      $elm = elm;
    },
    get$elm() {
      return $elm;
    },
    set$childrne(v: any[]) {
      child_host_nodes = v;
    },
    setchildrenelement(v: any[]) {
      child_elements = v;
    },
    setchildnode(v: any[]) {
      child_nodes = v;
    },
    getBoundingClientRect() {
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
    },
    setStyle(
      style: ViewStyleProperties,
      opt: Partial<{ initial?: boolean }> = {},
    ) {
      if (!$elm) {
        return;
      }
      const styleObj: Record<string, string> = {};
      Object.keys(style).forEach((key) => {
        const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        const v = style[key as keyof ViewStyleProperties];
        if (v !== undefined && v !== null) {
          styleObj[k] = String(v);
        }
      });
      $elm.style = styleObj;
      if (typeof $elm._onStyleChange === "function") {
        $elm._onStyleChange($elm.style);
      }
    },
    setStyleSet(styleSet: string[], opt: Partial<{ initial?: boolean }> = {}) {
      if (!$elm) {
        return;
      }
      if (styleSet.length === 0) {
        delete $elm.attrs.class;
      } else {
        $elm.attrs.class = styleSet.join(" ");
      }
    },
    setStyleValue(key: any, value: string) {
      if (!$elm) {
        return;
      }
      const k = String(key)
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();
      $elm.style[k] = value;
      if (typeof $elm._onStyleChange === "function") {
        $elm._onStyleChange($elm.style);
      }
    },
    setAttribute(key: string, value: string) {
      if (!$elm) {
        return;
      }
      $elm.attrs[key] = value;
      if (typeof $elm._onAttributeChange === "function") {
        $elm._onAttributeChange(key, value);
      }
    },
    removeAttribute(key: string) {
      if (!$elm) {
        return;
      }
      delete $elm.attrs[key];
      if (typeof $elm._onAttributeChange === "function") {
        $elm._onAttributeChange(key, null);
      }
    },
    blur() {},
    focus() {},
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      if (!$elm) {
        return;
      }
      $elm.listeners[type] = handler;
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      if (!$elm) {
        return;
      }
      delete $elm.listeners[type];
    },
    setupEventListener(events: any) {
      if (!events || !$elm) {
        return;
      }
      if (events.onClick) {
        $elm.listeners.click = events.onClick;
      }
      if (events.onDoubleClick) {
        $elm.listeners.dblclick = events.onDoubleClick;
      }
      if (events.onPointerDown) {
        $elm.listeners.pointerdown = events.onPointerDown;
      }
      if (events.onPointerUp) {
        $elm.listeners.pointerup = events.onPointerUp;
      }
      if (events.onFocus) {
        $elm.listeners.focus = events.onFocus;
      }
      if (events.onBlur) {
        $elm.listeners.blur = events.onBlur;
      }
      if (events.onKeyDown) {
        $elm.listeners.keydown = events.onKeyDown;
      }
      if (events.onContextMenu) {
        $elm.listeners.contextmenu = events.onContextMenu;
      }
      if (events.onMouseEnter) {
        $elm.listeners.mouseenter = events.onMouseEnter;
      }
      if (events.onMouseLeave) {
        $elm.listeners.mouseleave = events.onMouseLeave;
      }
      if (events.onDragStart) {
        $elm.listeners.dragstart = events.onDragStart;
      }
      if (events.onDrag) {
        $elm.listeners.drag = events.onDrag;
      }
      if (events.onDragEnd) {
        $elm.listeners.dragend = events.onDragEnd;
      }
      if (events.onDragEnter) {
        $elm.listeners.dragenter = events.onDragEnter;
      }
      if (events.onDragOver) {
        $elm.listeners.dragover = events.onDragOver;
      }
      if (events.onDragLeave) {
        $elm.listeners.dragleave = events.onDragLeave;
      }
      if (events.onDrop) {
        $elm.listeners.drop = events.onDrop;
      }
      if (events.onAnimationEnd) {
        $elm.listeners.animationend = events.onAnimationEnd;
      }
      if (events.onInput) {
        $elm.listeners.input = events.onInput;
      }
      if (events.onChange) {
        $elm.listeners.change = events.onChange;
      }
      if (typeof $elm._onEventChange === "function") {
        $elm._onEventChange($elm.listeners);
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
      if (!$elm) {
        return null;
      }
      child_elements = [];
      const child_host_nodes: any[] = [];
      const child_nodes: any[] = [];

      for (const child of children) {
        if (isElement(child)) {
          const child$ = props.build(child);
          const $child = child$.render();
          child_elements.push(child);
          child_nodes.push(child$);
          if ($child) {
            child_host_nodes.push($child);
            if ($elm.children) {
              $child.parentNode = $elm;
              $elm.children.push($child);
            }
          }
        }
      }

      return $elm;
    },
    handleElementsMounted() {
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
    getChildren() {
      return child_nodes;
    },
    buildChildren(children?: (TimelessElement | null)[]) {
      const child_elements: (TimelessElement | null)[] = [];
      const child_host_nodes: any[] = [];
      const child_nodes: any[] = [];

      if (!children) {
        return {
          $fragment: null,
          child_elements,
          child_host_nodes,
          child_nodes,
        };
      }

      for (const child of children) {
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
          }
        }
      }

      return {
        $fragment: null,
        child_elements,
        child_host_nodes,
        child_nodes,
      };
    },
    insertChildren(children: (TimelessElement | null)[]) {
      const r = methods.buildChildren(children);
      if ($elm && $elm.children) {
        for (const $child of r.child_host_nodes) {
          $child.parentNode = $elm;
          $elm.children.push($child);
        }
      }
      child_elements = r.child_elements as TimelessElement[];
      child_host_nodes = r.child_host_nodes;
      child_nodes = r.child_nodes;
      setTimeout(() => {
        methods.handleElementsMounted();
      }, 0);
    },
    removeChildren() {
      if (child_host_nodes.length === 0) {
        return;
      }
      for (const child of child_nodes) {
        if (child) {
          child.removeChildren();
        }
      }
      if ($elm && $elm.children) {
        for (const $child of child_host_nodes) {
          const idx = $elm.children.indexOf($child);
          if (idx !== -1) {
            $child.parentNode = null;
            $elm.children.splice(idx, 1);
          }
        }
      }
      methods.handleElementUnmounted();
      child_elements = [];
      child_host_nodes = [];
      child_nodes = [];
    },
    insert(idx: number, children: (TimelessElement | null)[]) {
      const inserted_elements: TimelessElement[] = [];
      const inserted_child: any[] = [];

      for (const child of children) {
        if (child) {
          const child$ = props.build(child);
          inserted_child.push(child$);
          const $child = child$.render();
          if ($child) {
            child_host_nodes.splice(idx, 0, $child);
            inserted_elements.push(child);
            if ($elm && $elm.children) {
              $child.parentNode = $elm;
              $elm.children.splice(idx, 0, $child);
            }
          }
        }
      }

      child_elements.splice(idx, 0, ...inserted_elements);
      child_nodes.splice(idx, 0, ...inserted_child);

      for (const child of inserted_elements) {
        if (child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    remove(idx: number, count: number) {
      const removed_elements: TimelessElement[] = [];

      for (let i = 0; i < count; i++) {
        const $child = child_host_nodes[idx + i];
        if ($child) {
          child_host_nodes.splice(idx + i, 1);
          const child_elm = child_elements[idx + i];
          if (child_elm) {
            removed_elements.push(child_elm);
          }
          if ($elm && $elm.children) {
            const childIdx = $elm.children.indexOf($child);
            if (childIdx !== -1) {
              $child.parentNode = null;
              $elm.children.splice(childIdx, 1);
            }
          }
        }
      }

      child_elements.splice(idx, count);
      child_nodes.splice(idx, count);

      setTimeout(() => {
        for (const child of removed_elements) {
          if (child && child.onUnmounted) {
            child.onUnmounted();
          }
        }
      }, 0);
    },
    move(from: number, to: number) {
      const $from = child_host_nodes[from];
      if (!$from) {
        return;
      }

      child_host_nodes.splice(from, 1);
      child_host_nodes.splice(to, 0, $from);

      if ($elm && $elm.children) {
        const $to = child_host_nodes[to + 1] || null;
        const fromIdx = $elm.children.indexOf($from);
        if (fromIdx !== -1) {
          $elm.children.splice(fromIdx, 1);
          if ($to) {
            const toIdx = $elm.children.indexOf($to);
            if (toIdx !== -1) {
              $elm.children.splice(toIdx, 0, $from);
            }
          } else {
            $elm.children.push($from);
          }
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

      const sorted_removed = [...removed].sort((a, b) => b.idx - a.idx);
      for (const { idx } of sorted_removed) {
        const $child = child_host_nodes[idx];
        if ($child) {
          child_host_nodes.splice(idx, 1);
          if ($elm && $elm.children) {
            const childIdx = $elm.children.indexOf($child);
            if (childIdx !== -1) {
              $elm.children.splice(childIdx, 1);
            }
          }
        }
      }

      if (moved.length > 0) {
        const removedIdxs = removed.map((r) => r.idx).sort((a, b) => a - b);
        const entries = moved
          .map(({ from, to }) => {
            let shift = 0;
            for (const ri of removedIdxs) {
              if (ri < from) shift++;
              else break;
            }
            return { $node: child_host_nodes[from - shift], to };
          })
          .sort((a, b) => a.to - b.to);

        for (const { $node, to } of entries) {
          if (!$node) continue;
          const currentFrom = child_host_nodes.indexOf($node);
          if (currentFrom !== -1 && currentFrom !== to) {
            methods.move(currentFrom, to);
          }
        }
      }

      for (const { idx, element } of added) {
        if (element) {
          const child$ = props.build(element);
          const $child = child$.render();
          if ($child) {
            const $reference = child_host_nodes[idx];
            if ($reference) {
              child_host_nodes.splice(idx, 0, $child);
              if ($elm && $elm.children) {
                const refIdx = $elm.children.indexOf($reference);
                if (refIdx !== -1) {
                  $elm.children.splice(refIdx, 0, $child);
                }
              }
            } else {
              child_host_nodes.push($child);
              if ($elm && $elm.children) {
                $elm.children.push($child);
              }
            }
          }
        }
      }
    },
    getParent() {
      return null;
    },
  };

  return {
    methods,
  };
}
