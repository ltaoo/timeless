import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeImg = VNodeView<any> & {
  t: "img";
  render(): any;
};

export function NativeImg(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeImg {
  const t = "img";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "img",
    src: "" as string,
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
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
      if (props.elm.state.src) {
        $elm.src = String(props.elm.state.src);
      }
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });
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
