import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";
import { HostElement } from "./box";
import { refreshNativeStyles } from "../stylesheet";

export type NativeAspectRatio = VNodeView & {
  t: "aspect-ratio";
};

export function NativeAspectRatio(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): NativeAspectRatio {
  const $elm = {
    type: "aspect-ratio",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };
  const box$ = HostElement({ t: "view", $elm, build: props.build });

  const methods = box$.methods;

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
      box$.methods.setStyleValue(key, value);
    },
    setStyleSet(names: string[]) {
      box$.methods.setStyleSet(names);
    },
    setAttribute(key: string, value: string) {
      box$.methods.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      box$.methods.removeAttribute(key);
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
    render() {
      box$.methods.set$elm($elm);
      if (props.elm.state) {
        box$.methods.applyState(props.elm.state);
        if (props.elm.state.ratio !== undefined) {
          ($elm as any).ratio = props.elm.state.ratio;
        }
      }
      if (props.elm.events) {
        methods.setupEventListener(props.elm.events);
      }
      if (props.elm.children) {
        methods.render(props.elm.children);
      }
      refreshNativeStyles($elm);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm) {},
  };
}

export function isNativeAspectRatio(value: any): value is NativeAspectRatio {
  return value.t === "aspect-ratio";
}
