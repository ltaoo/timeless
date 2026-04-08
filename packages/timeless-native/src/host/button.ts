import {
  isElement,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

export interface NativeButton {
  t: "button";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  render(elm: TimelessElement): any;
}

export function NativeButton(props: {
  build: (elm: TimelessElement) => any;
}): NativeButton {
  const $elm = {
    type: "button",
    children: [] as any[],
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
      if (events.onClick) {
        $elm.listeners.click = events.onClick;
      }
      if (events.onPointerDown) {
        $elm.listeners.pointerdown = events.onPointerDown;
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
      if (events.onMouseEnter) {
        $elm.listeners.mouseenter = events.onMouseEnter;
      }
      if (events.onMouseLeave) {
        $elm.listeners.mouseleave = events.onMouseLeave;
      }
    },
  };

  return {
    t: "button",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return $elm.children;
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    setStyleSet(name: string) {
      $elm.attrs.class = name;
    },
    setAttribute(key: string, value: string) {
      $elm.attrs[key] = value;
    },
    removeAttribute(key: string) {
      delete $elm.attrs[key];
    },
    render(elm: TimelessElement) {
      if (elm.props?.style) {
        methods.setStyle(elm.props.style);
      }
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
      if (elm.children) {
        for (const child of elm.children) {
          if (isElement(child)) {
            const $sub = props.build(child);
            if ($sub && $sub.$elm) {
              $elm.children.push($sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
  };
}

export function isNativeButton(value: any): value is NativeButton {
  return value.t === "button";
}
