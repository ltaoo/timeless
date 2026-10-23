import {
  TimelessElement,
  VNodeRect,
  ViewStyleProperties,
  isElement,
} from "@timeless/timeless";
import {
  refreshNativeStyles,
  invalidateNativeStyles,
  requestNativeLayout,
  setNativeDefaultStyle,
  setNativeInlineStyle,
  setNativeStyleValue,
} from "../stylesheet";

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
  setDefaultStyle(style: Record<string, string>): void;
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
  get$children(): any[];
  teardownEventListener(events: any): void;
  trackChild(
    dom: any,
    element: TimelessElement,
    vnode: any,
    index: number,
  ): void;
  untrackChild(index: number): void;
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
      if ($elm) refreshNativeStyles($elm);
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
      if ($elm?._getBoundingClientRect) return $elm._getBoundingClientRect();
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
      setNativeInlineStyle($elm, styleObj);
    },
    setStyleSet(styleSet: string[], opt: Partial<{ initial?: boolean }> = {}) {
      if (!$elm) {
        return;
      }
      const previous = $elm.attrs.class ?? "";
      if (previous === styleSet.join(" ")) return;
      const before = { ...$elm, attrs: { ...$elm.attrs } };
      if (styleSet.length === 0) {
        delete $elm.attrs.class;
      } else {
        $elm.attrs.class = styleSet.join(" ");
      }
      invalidateNativeStyles(
        $elm,
        "classes",
        [...previous.split(/\s+/), ...styleSet],
        before,
      );
    },
    setDefaultStyle(style) {
      if ($elm) setNativeDefaultStyle($elm, style);
    },
    setStyleValue(key: any, value: string) {
      if (!$elm) {
        return;
      }
      const k = String(key)
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();
      setNativeStyleValue($elm, k, value);
    },
    setAttribute(key: string, value: string) {
      if (!$elm) {
        return;
      }
      if ($elm.attrs[key] === value) return;
      const before = { ...$elm, attrs: { ...$elm.attrs } };
      $elm.attrs[key] = value;
      invalidateNativeStyles($elm, "attributes", [key], before);
      if (typeof $elm._onAttributeChange === "function") {
        $elm._onAttributeChange(key, value);
      }
    },
    removeAttribute(key: string) {
      if (!$elm) {
        return;
      }
      if (!(key in $elm.attrs)) return;
      const before = { ...$elm, attrs: { ...$elm.attrs } };
      delete $elm.attrs[key];
      invalidateNativeStyles($elm, "attributes", [key], before);
      if (typeof $elm._onAttributeChange === "function") {
        $elm._onAttributeChange(key, null);
      }
    },
    blur() {
      $elm?._blur?.();
    },
    focus() {
      $elm?._focus?.();
    },
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
      if (events.onSubmit) $elm.listeners.submit = events.onSubmit;
      if (events.onReset) $elm.listeners.reset = events.onReset;
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
      if (events.onAnimationStart)
        $elm.listeners.animationstart = events.onAnimationStart;
      if (events.onScroll) $elm.listeners.scroll = events.onScroll;
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
    teardownEventListener(events: any) {
      if (!$elm || !events) return;
      for (const key of Object.keys(events)) {
        const type =
          key === "onDoubleClick" ? "dblclick" : key.slice(2).toLowerCase();
        if ($elm.listeners[type] === events[key]) delete $elm.listeners[type];
      }
    },
    get$children() {
      return child_host_nodes;
    },
    trackChild(dom, element, vnode, index) {
      child_host_nodes.splice(index, 0, dom);
      child_elements.splice(index, 0, element);
      child_nodes.splice(index, 0, vnode);
    },
    untrackChild(index) {
      child_host_nodes.splice(index, 1);
      child_elements.splice(index, 1);
      child_nodes.splice(index, 1);
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
      for (const [key, value] of Object.entries((state as any).dataset ?? {})) {
        if (value !== undefined)
          methods.setAttribute(
            key.startsWith("data-") ? key : `data-${key}`,
            String(value),
          );
      }
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
      child_host_nodes = [];
      child_nodes = [];

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

      refreshNativeStyles($elm);
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
        invalidateNativeStyles($elm, "structure", ["children"]);
      }
      child_elements = r.child_elements as TimelessElement[];
      child_host_nodes = r.child_host_nodes;
      child_nodes = r.child_nodes;
      requestNativeLayout();
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
          child.removeChildren?.();
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
      if ($elm) invalidateNativeStyles($elm, "structure", ["children"]);
      methods.handleElementUnmounted();
      child_elements = [];
      child_host_nodes = [];
      child_nodes = [];
      requestNativeLayout();
    },
    insert(idx: number, children: (TimelessElement | null)[]) {
      const inserted_elements: TimelessElement[] = [];
      const inserted_child: any[] = [];
      let host_index = idx;

      for (const child of children) {
        if (child) {
          const child$ = props.build(child);
          inserted_child.push(child$);
          const $child = child$.render();
          if ($child) {
            child_host_nodes.splice(host_index, 0, $child);
            inserted_elements.push(child);
            if ($elm && $elm.children) {
              $child.parentNode = $elm;
              $elm.children.splice(host_index, 0, $child);
            }
            host_index += 1;
          }
        }
      }

      if ($elm) invalidateNativeStyles($elm, "structure", ["children"]);
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
      const removed = child_host_nodes.splice(idx, count);
      const removed_elements = child_elements.splice(idx, count);
      child_nodes.splice(idx, count);
      for (const child of removed) {
        const index = $elm?.children?.indexOf(child) ?? -1;
        if (index !== -1) $elm.children.splice(index, 1);
        if (child) child.parentNode = null;
      }
      if ($elm) invalidateNativeStyles($elm, "structure", ["children"]);
      requestNativeLayout();
      setTimeout(() => {
        for (const element of removed_elements) element?.onUnmounted?.();
      }, 0);
    },
    move(from: number, to: number) {
      const $from = child_host_nodes[from];
      if (!$from) {
        return;
      }

      child_host_nodes.splice(from, 1);
      child_host_nodes.splice(to, 0, $from);
      child_elements.splice(to, 0, ...child_elements.splice(from, 1));
      child_nodes.splice(to, 0, ...child_nodes.splice(from, 1));
      requestNativeLayout();

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
        invalidateNativeStyles($elm, "structure", ["children"]);
      }
    },
    refresh(data: { children: (TimelessElement | null)[] }) {
      const previous = new Map(
        child_elements.map((element, index) => [
          element,
          { vnode: child_nodes[index], dom: child_host_nodes[index] },
        ]),
      );
      const next_elements: TimelessElement[] = [];
      const next_nodes: any[] = [];
      const next_hosts: any[] = [];
      const mounted: TimelessElement[] = [];
      for (const element of data.children) {
        if (!isElement(element)) continue;
        const cached = previous.get(element);
        const vnode = cached?.vnode ?? props.build(element);
        const dom = cached?.dom ?? vnode.render();
        next_elements.push(element);
        next_nodes.push(vnode);
        next_hosts.push(dom);
        if (!cached) mounted.push(element);
      }
      for (const dom of child_host_nodes) {
        if (dom && !next_hosts.includes(dom)) dom.parentNode = null;
      }
      child_elements = next_elements;
      child_nodes = next_nodes;
      child_host_nodes = next_hosts;
      if ($elm?.children) {
        $elm.children.splice(0, $elm.children.length, ...next_hosts);
        for (const child of next_hosts) child.parentNode = $elm;
        invalidateNativeStyles($elm, "structure", ["children"]);
      }
      requestNativeLayout();
      for (const element of mounted)
        element.onMounted?.({ target: element.$elm });
    },
    getParent() {
      return null;
    },
  };

  return {
    methods,
  };
}
