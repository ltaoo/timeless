import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMCheckbox = VNodeView<HTMLInputElement> & {
  t: "checkbox";
  render(elm: TimelessElement): HTMLInputElement;
};

export function DOMCheckbox(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
}): DOMCheckbox {
  const t = "checkbox";
  const $elm = document.createElement("input");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "input";
    },
    // get $elm() {
    //   return $elm;
    // },
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
      // $elm.style.backgroundColor = "transparent";
      // console.log("[DOMCheckbox] render", elm.value);
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      $elm.type = "checkbox";
      $elm.checked = !!elm.state.value;
      if (elm.state.id) {
        $elm.id = elm.state.id;
      }
      if (elm.state.name) {
        $elm.name = elm.state.name;
      }
      common$.methods.applyState(elm.state);
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
          // canvas.addEventListener($elm, "focus", events.onFocus);
          $elm.addEventListener("focus", events.onFocus);
        }
        if (events.onBlur) {
          // canvas.addEventListener($elm, "blur", events.onBlur);
          $elm.addEventListener("blur", events.onBlur);
        }
        if (events.onKeyDown) {
          // canvas.addEventListener($elm, "keydown", events.onKeyDown);
          $elm.addEventListener("keydown", events.onKeyDown);
        }
      }
      return $elm;
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent() {
      return $elm.parentElement;
    },
  };
}

export function isDOMCheckbox(value: any): value is DOMCheckbox {
  return value.t === "checkbox";
}
