import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeButton = VNodeView<any> & {
  t: "button";
  render(): any;
};

export function NativeButton(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeButton {
  const t = "button";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "button",
    children: [] as any[],
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
      return "button";
    },
    isDocumentFragment() {
      return true;
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
    getBoundingClientRect() {
      return methods.getBoundingClientRect();
    },
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });
      methods.setDefaultStyle({
        "background-color": "#eeeeee",
        "border-radius": "6px",
        "padding-top": "6px",
        "padding-bottom": "6px",
        "padding-left": "12px",
        "padding-right": "12px",
      });
      methods.setupEventListener(props.elm.events);
      if (props.elm.children) {
        methods.render(props.elm.children);
      }
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
