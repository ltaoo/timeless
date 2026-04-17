import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeTabView = VNodeView<any> & {
  t: "tab-view";
  render(elm: TimelessElement): any;
};

export function NativeTabView(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): NativeTabView {
  const t = "tab-view";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "tab-view",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    activeIndex: 0,
    position: "top",
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
    render(elm: TimelessElement) {
      methods.set$elm($elm);
      methods.applyState(elm.state, { initial: true });

      $elm.style["display"] = "flex";
      $elm.style["flex-direction"] = "column";

      if (elm.state.activeIndex !== undefined) {
        $elm.activeIndex = elm.state.activeIndex;
      }
      if (elm.state.position !== undefined) {
        $elm.position = elm.state.position;
      }

      if (elm.children) {
        methods.render(elm.children);
      }
      methods.setupEventListener(elm.events);

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

export type NativeTabPane = VNodeView<any> & {
  t: "tab-pane";
  render(elm: TimelessElement): any;
};

export function NativeTabPane(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): NativeTabPane {
  const t = "tab-pane";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "tab-pane",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    label: "",
    icon: "",
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
    render(elm: TimelessElement) {
      methods.set$elm($elm);
      methods.applyState(elm.state, { initial: true });

      $elm.style["flex"] = "1";

      if (elm.state.label !== undefined) {
        $elm.label = elm.state.label;
      }
      if (elm.state.icon !== undefined) {
        $elm.icon = elm.state.icon;
      }

      if (elm.children) {
        methods.render(elm.children);
      }
      methods.setupEventListener(elm.events);

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

export function isNativeTabView(value: any): value is NativeTabView {
  return value?.t === "tab-view";
}

export function isNativeTabPane(value: any): value is NativeTabPane {
  return value?.t === "tab-pane";
}
