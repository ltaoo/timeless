import { TimelessElement, VNodeView } from "@timeless/timeless";

import { requestNativeLayout } from "../stylesheet";

import { HostElement, BoxMethods } from "./box";

export type NativeScrollView = VNodeView<any> & {
  t: "scroll-view";
  render(): any;
  scrollTop: number;
  scrollLeft: number;
  readonly scrollHeight: number;
  readonly scrollWidth: number;
};

export function NativeScrollView(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeScrollView {
  const t = "scroll-view";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "scroll-view",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    horizontal: "auto",
    vertical: "auto",
    scrollTop: 0,
    scrollLeft: 0,
    scrollRequest: null as { top?: number; left?: number } | null,
    scrollHeight: 0,
    scrollWidth: 0,
    contentWidth: props.elm.state.contentWidth,
    contentHeight: props.elm.state.contentHeight,
  };

  const methods: BoxMethods = box$.methods;

  return {
    ...methods,
    t,
    get $elm() {
      return $elm;
    },
    get scrollTop() {
      return $elm.scrollTop;
    },
    set scrollTop(value: number) {
      $elm.scrollTop = value;
      $elm.scrollRequest = { ...$elm.scrollRequest, top: value };
      requestNativeLayout();
    },
    get scrollLeft() {
      return $elm.scrollLeft;
    },
    set scrollLeft(value: number) {
      $elm.scrollLeft = value;
      $elm.scrollRequest = { ...$elm.scrollRequest, left: value };
      requestNativeLayout();
    },
    get scrollHeight() {
      return $elm.scrollHeight;
    },
    get scrollWidth() {
      return $elm.scrollWidth;
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
      methods.setStyleValue(key, value);
    },
    setStyleSet(names: string[]) {
      methods.setStyleSet(names);
    },
    setAttribute(key: string, value: string) {
      methods.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      methods.removeAttribute(key);
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
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });

      methods.setDefaultStyle({ display: "flex" });
      methods.setDefaultStyle({ "flex-direction": "column" });
      methods.setDefaultStyle({ overflow: "auto" });

      if (props.elm.state.horizontal) {
        $elm.horizontal = props.elm.state.horizontal;
        if (props.elm.state.horizontal === "hidden") {
          methods.setDefaultStyle({ "overflow-x": "hidden" });
        } else if (props.elm.state.horizontal === "visible") {
          methods.setDefaultStyle({ "overflow-x": "visible" });
        }
      }
      if (props.elm.state.vertical) {
        $elm.vertical = props.elm.state.vertical;
        if (props.elm.state.vertical === "hidden") {
          methods.setDefaultStyle({ "overflow-y": "hidden" });
        } else if (props.elm.state.vertical === "visible") {
          methods.setDefaultStyle({ "overflow-y": "visible" });
        }
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

export function isNativeScrollView(value: any): value is NativeScrollView {
  return value?.t === "scroll-view";
}
