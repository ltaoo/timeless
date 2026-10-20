import { TimelessElement, VNodeView } from "@timeless/timeless";

import { requestNativeLayout } from "../stylesheet";

import { HostElement, BoxMethods } from "./box";

export type NativeCheckbox = VNodeView<any> & {
  t: "checkbox";
  render(): any;
  setChecked(checked: boolean): void;
  setIndeterminate(value: boolean): void;
};

export function NativeCheckbox(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeCheckbox {
  const t = "checkbox";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "checkbox",
    checked: false,
    indeterminate: false,
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
      methods.setStyleValue(key, value);
    },
    setStyleSet(names: string[]) {
      methods.setStyleSet(names);
    },
    setAttribute(key: string, value: string) {
      methods.setAttribute(key, value);
      if (key === "checked") $elm.checked = String(value) !== "false";
      if (key === "indeterminate")
        $elm.indeterminate = String(value) !== "false";
      requestNativeLayout();
    },
    removeAttribute(key: string) {
      methods.removeAttribute(key);
      if (key === "checked") $elm.checked = false;
      if (key === "indeterminate") $elm.indeterminate = false;
      requestNativeLayout();
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
      methods.setupEventListener(props.elm.events);

      $elm.checked = !!props.elm.state.checked;
      $elm.indeterminate = !!props.elm.state.indeterminate;
      if (props.elm.state.readonly) methods.setAttribute("readonly", "");
      if (props.elm.state.id) {
        $elm.attrs.id = props.elm.state.id;
      }
      if (props.elm.state.name) {
        $elm.attrs.name = props.elm.state.name;
      }

      const events = props.elm.events;
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
    setIndeterminate(value: boolean) {
      $elm.indeterminate = value;
      requestNativeLayout();
    },
    setChecked(checked: boolean) {
      $elm.checked = checked;
      requestNativeLayout();
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

export function isNativeCheckbox(value: any): value is NativeCheckbox {
  return value.t === "checkbox";
}
