import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeScrollView = VNodeView<any> & {
  t: "scroll-view";
  render(elm: TimelessElement): any;
};

export function NativeScrollView(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
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
      $elm.style["overflow"] = "auto";

      if (elm.state.horizontal) {
        $elm.horizontal = elm.state.horizontal;
        if (elm.state.horizontal === "hidden") {
          $elm.style["overflow-x"] = "hidden";
        } else if (elm.state.horizontal === "visible") {
          $elm.style["overflow-x"] = "visible";
        }
      }
      if (elm.state.vertical) {
        $elm.vertical = elm.state.vertical;
        if (elm.state.vertical === "hidden") {
          $elm.style["overflow-y"] = "hidden";
        } else if (elm.state.vertical === "visible") {
          $elm.style["overflow-y"] = "visible";
        }
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

export function isNativeScrollView(value: any): value is NativeScrollView {
  return value?.t === "scroll-view";
}
