import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMFilePicker = VNodeView<HTMLInputElement> & {
  t: "file-picker";
  setValue(file: File): void;
  focus(): void;
  blur(): void;
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMFilePicker(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
}): DOMFilePicker {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "file-picker";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "input";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("input");
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      // console.log("[dom]file-picker - render create file-picker");
      $elm.type = "file";
      //       $elm.value = elm.state.value;
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
      if (elm.state.accept) {
        $elm.accept = elm.state.accept;
      }
      if (elm.state.multiple) {
        $elm.multiple = elm.state.multiple;
      }
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      if (events) {
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
    setValue(value: File) {
      //       $elm.value = value;
    },
    focus() {
      //       $elm.focus();
    },
    blur() {
      //       $elm.blur();
    },
  };
}

export function isDOMFilePicker(value: any): value is DOMFilePicker {
  return value.t === "file-picker";
}
