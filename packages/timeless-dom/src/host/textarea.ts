import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMTextarea = VNodeView<HTMLTextAreaElement> & {
  t: "textarea";
  isDocumentFragment(): boolean;
  setValue(value: string): void;
  focus(): void;
  blur(): void;
  render(elm: TimelessElement): HTMLTextAreaElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMTextarea(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMTextarea {
  const t = "textarea";
  const $elm = document.createElement("textarea");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "input";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle: common$.methods.setStyle,
    setStyleValue: common$.methods.setStyleValue,
    setStyleSet: common$.methods.setStyleSet,
    setAttribute: common$.methods.setAttribute,
    removeAttribute: common$.methods.removeAttribute,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    setValue(value: string) {
      $elm.value = value;
    },
    focus() {
      $elm.focus();
    },
    blur() {
      $elm.blur();
    },
    render(elm: TimelessElement) {
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      common$.methods.applyState(elm.state, { initial: true });
      $elm.value = elm.state.value;
      if (elm.state.id) {
        $elm.id = elm.state.id;
      }
      if (elm.state.name) {
        $elm.name = elm.state.name;
      }
      if (elm.state.placeholder) {
        $elm.placeholder = elm.state.placeholder;
      }
      if (elm.state.disabled) {
        $elm.disabled = elm.state.disabled;
      }
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      if (events) {
        if (events.onInput) {
          $elm.addEventListener("input", events.onInput);
        }
        if (events.onChange) {
          $elm.addEventListener("change", events.onChange);
        }
        if (events.onFocus) {
          $elm.addEventListener("focus", events.onFocus);
        }
        if (events.onBlur) {
          $elm.addEventListener("blur", events.onBlur);
        }
        if (events.onKeyDown) {
          $elm.addEventListener("keydown", events.onKeyDown);
        }
      }
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      // common$.methods.hydrate(elm, $dom);
    },
    getChildren: common$.methods.getChildren,
    appendChildren() {},
    insertChildren() {},
    removeChildren() {},
    getParent() {
      return $elm.parentElement;
    },
  };
}

export function isDOMTextarea(value: any): value is DOMTextarea {
  return value.t === "textarea";
}
