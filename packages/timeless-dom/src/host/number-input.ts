import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMNumberInput = VNodeView<HTMLInputElement> & {
  t: "number-input";
  setValue(value: string): void;
  focus(): void;
  blur(): void;
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMNumberInput(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
}): DOMNumberInput {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "number-input";
  const common$ = HostElement({ $elm: null, t, build: props.build });

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
    render(elm: TimelessElement) {
      const $elm = document.createElement("input");
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      $elm.type = "text";
      if (elm.state.id !== undefined) {
        $elm.id = elm.state.id;
      }
      if (elm.state.name) {
        $elm.name = elm.state.name;
      }
      if (elm.state.value !== undefined) {
        $elm.value = elm.state.value;
      }
      if (elm.state.placeholder !== undefined) {
        $elm.placeholder = elm.state.placeholder;
      }
      if (elm.state.disabled !== undefined) {
        $elm.disabled = elm.state.disabled;
      }
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
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
    hydrate(elm: TimelessElement, $elm: HTMLInputElement) {
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent: common$.methods.getParent,
    setValue(value: string) {
      // $elm.value = value;
    },
    focus() {
      // $elm.focus();
    },
    blur() {
      // $elm.blur();
    },
  };
}

export function isDOMNumberInput(value: any): value is DOMNumberInput {
  return value.t === "number-input";
}
