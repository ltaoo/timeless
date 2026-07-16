import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeSplitView = VNodeView<any> & {
  t: "split-view";
  render(): any;
};

export function NativeSplitView(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeSplitView {
  const t = "split-view";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "split-view",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    direction: "horizontal",
    defaultSizes: [50, 50] as number[],
    minSizes: [10, 10] as number[],
    maxSizes: [90, 90] as number[],
  };

  const methods: BoxMethods = box$.methods;

  return {
    ...methods,
    t,
    get $elm() {
      return $elm;
    },
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle(style: any) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    setStyleSet(set: string[]) {
      $elm.attrs.class = set.join(" ");
    },
    setAttribute(key: string, value: string) {
      $elm.attrs[key] = value;
    },
    removeAttribute(key: string) {
      delete $elm.attrs[key];
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $elm.listeners[type] = handler;
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      delete $elm.listeners[type];
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
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });

      $elm.style["display"] = "flex";
      $elm.style["flex-direction"] =
        props.elm.state.direction === "horizontal" ? "row" : "column";

      if (props.elm.state.direction) {
        $elm.direction = props.elm.state.direction;
      }
      if (props.elm.state.sizes) {
        $elm.defaultSizes = props.elm.state.sizes;
      }
      if (props.elm.state.minSizes) {
        $elm.minSizes = props.elm.state.minSizes;
      }
      if (props.elm.state.maxSizes) {
        $elm.maxSizes = props.elm.state.maxSizes;
      }

      if (props.elm.children) {
        methods.render(props.elm.children);
      }
      methods.setupEventListener(props.elm.events);

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      methods.set$elm($dom);
      methods.setupEventListener(elm.events);
    },
    buildChildren(children: (TimelessElement | null)[]) {
      return methods.buildChildren(children);
    },
    insertChildren(children: (TimelessElement | null)[]) {
      methods.insertChildren(children);
    },
    removeChildren() {
      methods.removeChildren();
    },
    getParent() {
      return null;
    },
    get$elm() {
      return $elm;
    },
    getChildren() {
      return methods.getChildren();
    },
  };
}

export type NativeSplitPane = VNodeView<any> & {
  t: "split-pane";
  render(): any;
};

export function NativeSplitPane(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeSplitPane {
  const t = "split-pane";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "split-pane",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    size: 50,
    minSize: 10,
    maxSize: 90,
    collapsible: false,
    collapsedSize: 0,
  };

  const methods: BoxMethods = box$.methods;

  return {
    ...methods,
    t,
    get $elm() {
      return $elm;
    },
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle(style: any) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    setStyleSet(set: string[]) {
      $elm.attrs.class = set.join(" ");
    },
    setAttribute(key: string, value: string) {
      $elm.attrs[key] = value;
    },
    removeAttribute(key: string) {
      delete $elm.attrs[key];
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $elm.listeners[type] = handler;
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      delete $elm.listeners[type];
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
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });

      $elm.style["flex"] = `${(props.elm.state.size || 50) / 100}`;

      if (props.elm.state.size !== undefined) {
        $elm.size = props.elm.state.size;
      }
      if (props.elm.state.minSize !== undefined) {
        $elm.minSize = props.elm.state.minSize;
      }
      if (props.elm.state.maxSize !== undefined) {
        $elm.maxSize = props.elm.state.maxSize;
      }
      if (props.elm.state.collapsible !== undefined) {
        $elm.collapsible = props.elm.state.collapsible;
      }
      if (props.elm.state.collapsedSize !== undefined) {
        $elm.collapsedSize = props.elm.state.collapsedSize;
      }

      if (props.elm.children) {
        methods.render(props.elm.children);
      }
      methods.setupEventListener(props.elm.events);

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      methods.set$elm($dom);
      methods.setupEventListener(elm.events);
    },
    buildChildren(children: (TimelessElement | null)[]) {
      return methods.buildChildren(children);
    },
    insertChildren(children: (TimelessElement | null)[]) {
      methods.insertChildren(children);
    },
    removeChildren() {
      methods.removeChildren();
    },
    getParent() {
      return null;
    },
    get$elm() {
      return $elm;
    },
    getChildren() {
      return methods.getChildren();
    },
  };
}

export function isNativeSplitView(value: any): value is NativeSplitView {
  return value?.t === "split-view";
}

export function isNativeSplitPane(value: any): value is NativeSplitPane {
  return value?.t === "split-pane";
}
