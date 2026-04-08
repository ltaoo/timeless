import { TimelessElement, ViewStyleProperties } from "@timeless/timeless";

export interface NativeImg {
  t: "img";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setSrc(v: string): void;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  render(elm: TimelessElement): any;
}

export function NativeImg(props: {
  build: (elm: TimelessElement) => any;
}): NativeImg {
  const $elm = {
    type: "img",
    src: "" as string,
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };

  const methods = {
    setSrc(v: string) {
      $elm.src = v;
    },
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
      if (events.onClick) {
        $elm.listeners.click = events.onClick;
      }
      if (events.onLoad) {
        $elm.listeners.load = events.onLoad;
      }
      if (events.onError) {
        $elm.listeners.error = events.onError;
      }
    },
  };

  return {
    t: "img",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return [];
    },
    setSrc(v: string) {
      methods.setSrc(v);
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    render(elm: TimelessElement) {
      if (elm.value) {
        methods.setSrc(elm.value as string);
      }
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

export function isNativeImg(value: any): value is NativeImg {
  return value.t === "img";
}
