import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMFilePicker = VNodeView<HTMLInputElement> & {
  t: "file-picker";
  setValue(file: File): void;
  focus(): void;
  blur(): void;
  render(): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMFilePicker(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElement("input");
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      // console.log("[dom]file-picker - render create file-picker");
      $elm.type = "file";
      //       $elm.value = props.elm.state.value;
      if (props.elm.state.id) {
        $elm.id = props.elm.state.id;
      }
      if (props.elm.state.name) {
        $elm.name = props.elm.state.name;
      }
      if (props.elm.state.placeholder) {
        $elm.placeholder = props.elm.state.placeholder;
      }
      if (props.elm.state.disabled) {
        $elm.disabled = props.elm.state.disabled;
      }
      if (props.elm.state.accept) {
        $elm.accept = props.elm.state.accept;
      }
      if (props.elm.state.multiple) {
        $elm.multiple = props.elm.state.multiple;
      }
      common$.methods.set$elm($elm);
      common$.methods.applyState(props.elm.state, { initial: true });
      common$.methods.setupEventListener(props.elm.events);
      const events = props.elm.events;
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
