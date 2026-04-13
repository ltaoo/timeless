import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeRadio = VNodeView<any> & {
  t: "radio";
  render(elm: TimelessElement): any;
  setChecked(checked: boolean): void;
};

export function NativeRadio(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): NativeRadio {
  const t = "radio";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "radio",
    checked: false,
    value: "" as string,
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
      return "input";
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
      methods.setupEventListener(elm.events);

      $elm.checked = !!elm.state.value;
      if (elm.state.id) {
        $elm.attrs.id = elm.state.id;
      }
      if (elm.state.name) {
        $elm.attrs.name = elm.state.name;
      }

      const events = elm.events;
      if (events && events.onChange) {
        $elm.listeners.click = events.onChange;
      }
      if (events && events.onFocus) {
        $elm.listeners.focus = events.onFocus;
      }
      if (events && events.onBlur) {
        $elm.listeners.blur = events.onBlur;
      }

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      methods.set$elm($dom);
      methods.setupEventListener(elm.events);
    },
    setChecked(checked: boolean) {
      $elm.checked = checked;
    },
    buildChildren: methods.buildChildren,
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

export function isNativeRadio(value: any): value is NativeRadio {
  return value.t === "radio";
}
