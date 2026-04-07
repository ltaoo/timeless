import {
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/primitive";

export interface NativeInput {
  t: "input";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
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
  render(elm: TimelessElement): any;
}

export function NativeInput(props: {
  build: (elm: TimelessElement) => any;
}): NativeInput {
  const $elm = {
    type: "input",
    value: "" as string,
    placeholder: "" as string,
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const styleObj: Record<string, string> = {};
      Object.keys(style).forEach((key) => {
        const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        const v = style[key as keyof ViewStyleProperties];
        if (v !== undefined && v !== null) {
          styleObj[k] = String(v);
        }
      });
      $elm.style = styleObj;
    },
    setupEventListener(events: any) {
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
    },
  };

  return {
    t: "input",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return false;
    },
    getChildNodes() {
      return [];
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    setAttribute(key: string, value: string) {
      $elm.attrs[key] = value;
      if (key === "value") {
        $elm.value = value;
      }
      if (key === "placeholder") {
        $elm.placeholder = value;
      }
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
    render(elm: TimelessElement) {
      if (elm.props?.style) {
        methods.setStyle(elm.props.style);
      }
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
      return $elm;
    },
  };
}

export function isNativeInput(value: any): value is NativeInput {
  return value.t === "input";
}
