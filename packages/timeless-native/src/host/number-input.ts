import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement, BoxMethods } from "./box";

export type NativeNumberInput = VNodeView<any> & {
  t: "number-input";
  render(): any;
  setValue(value: string): void;
  focus(): void;
  blur(): void;
};

export function NativeNumberInput(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeNumberInput {
  const t = "number-input";
  const box$ = HostElement({ t, $elm: null, build: props.build });

  const $elm = {
    type: "number-input",
    value: "" as string,
    placeholder: "" as string,
    disabled: false,
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
    render() {
      methods.set$elm($elm);
      methods.applyState(props.elm.state, { initial: true });
      methods.setupEventListener(props.elm.events);

      if (props.elm.state.id !== undefined) {
        $elm.attrs.id = props.elm.state.id;
      }
      if (props.elm.state.name) {
        $elm.attrs.name = props.elm.state.name;
      }
      if (props.elm.state.value !== undefined) {
        $elm.value = String(props.elm.state.value);
      }
      if (props.elm.state.placeholder !== undefined) {
        $elm.placeholder = String(props.elm.state.placeholder);
      }
      if (props.elm.state.disabled !== undefined) {
        $elm.disabled = props.elm.state.disabled;
      }

      const events = props.elm.events;
      if (events) {
        if (events.onInput) {
          $elm.listeners.input = events.onInput;
        }
        if (events.onChange) {
          $elm.listeners.change = events.onChange;
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
      }

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      methods.set$elm($dom);
      methods.setupEventListener(elm.events);
    },
    setValue(value: string) {
      $elm.value = value;
    },
    focus() {},
    blur() {},
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

export function isNativeNumberInput(value: any): value is NativeNumberInput {
  return value.t === "number-input";
}
