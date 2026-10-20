import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";
import { HostElement } from "./box";
import { refreshNativeStyles } from "../stylesheet";

export type NativeView = VNodeView & {
  t: "view";
};

export function NativeView(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): NativeView {
  const $elm = {
    type: "view",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
    parentNode: null as any,
    _onStyleChange: null as ((style: Record<string, string>) => void) | null,
    _onAttributeChange: null as
      | ((key: string, value: string | null) => void)
      | null,
    _onEventChange: null as ((listeners: Record<string, any>) => void) | null,
    _onChildInserted: null as ((index: number, child: any) => void) | null,
    _onChildRemoved: null as ((index: number) => void) | null,
    _onChildReplaced: null as ((index: number, newChild: any) => void) | null,
  };
  const box$ = HostElement({ t: "view", $elm, build: props.build });

  const methods = box$.methods;

  return {
    ...box$.methods,
    t: "view",
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
      }
      if (props.elm.events) {
        methods.setupEventListener(props.elm.events);
      }
      if (props.elm.children) {
        box$.methods.render(props.elm.children);
      }
      refreshNativeStyles($elm);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm) {},
  };
}

export function isNativeView(value: any): value is NativeView {
  return value.t === "view";
}
