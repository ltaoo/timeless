import {
  isElement,
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";
import { HostElement } from "./box";

export type NativeAspectRatio = VNodeView & {
  t: "aspect-ratio";
};

export function NativeAspectRatio(props: {
  build: (elm: TimelessElement) => VNodeView;
}): NativeAspectRatio {
  const $elm = {
    type: "aspect-ratio",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };
  const box$ = HostElement({ t: "view", $elm, build: props.build });

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
      if (events.onContextMenu) {
        $elm.listeners.contextmenu = events.onContextMenu;
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
    ...box$.methods,
    t: "aspect-ratio",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return true;
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: string, value: string) {
      const k = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      $elm.style[k] = value;
    },
    setStyleSet(name: string[]) {
      $elm.attrs.class = name.join(" ");
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
    render(elm: TimelessElement) {
      box$.methods.set$elm($elm);
      if (elm.state) {
        box$.methods.applyState(elm.state);
        if (elm.state.ratio !== undefined) {
          ($elm as any).ratio = elm.state.ratio;
        }
      }
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
      if (elm.children) {
        // Extract inheritable text styles from parent view
        const inheritableKeys = [
          "font-size",
          "font-weight",
          "font-style",
          "font-family",
          "color",
          "text-align",
          "text-decoration",
          "line-height",
          "letter-spacing",
        ];
        const inherited_style: Record<string, string> = {};
        for (const key of inheritableKeys) {
          if ($elm.style[key]) {
            inherited_style[key] = $elm.style[key];
          }
        }
        for (const child of elm.children) {
          if (isElement(child)) {
            const child$ = props.build(child);
            const $child = child$.render(child);
            if (child$ && $child) {
              // Propagate inherited text styles to text children
              if (
                $child.type === "text" &&
                Object.keys(inherited_style).length > 0
              ) {
                $child.style = { ...inherited_style, ...$child.style };
              }
              // Children fill the aspect-ratio container (like CSS absolute inset-0).
              // Remove explicit width/height so they don't conflict with fill constraints.
              if ($child.style) {
                delete $child.style["width"];
                delete $child.style["height"];
              }
              $elm.children.push($child);
            }
          }
        }
      }
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm) {},
  };
}

export function isNativeAspectRatio(value: any): value is NativeAspectRatio {
  return value.t === "aspect-ratio";
}
