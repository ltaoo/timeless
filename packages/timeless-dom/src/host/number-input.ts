import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMNumberInput = VNodeView<HTMLInputElement> & {
  t: "number-input";
  render(): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setValue(value: string): void;
  focus(): void;
  blur(): void;
};

export function DOMNumberInput(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
  elm: TimelessElement;
}): DOMNumberInput {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "number-input";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "input";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("input");
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      $elm.type = "text";
      if (props.elm.state.id !== undefined) {
        $elm.id = props.elm.state.id;
      }
      if (props.elm.state.name) {
        $elm.name = props.elm.state.name;
      }
      if (props.elm.state.value !== undefined) {
        $elm.value = props.elm.state.value;
      }
      if (props.elm.state.placeholder !== undefined) {
        $elm.placeholder = props.elm.state.placeholder;
      }
      if (props.elm.state.disabled !== undefined) {
        $elm.disabled = props.elm.state.disabled;
      }
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
      const events = props.elm.events;
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
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
    setValue(value: string) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.value = value;
      }
    },
    focus() {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.focus();
      }
    },
    blur() {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.blur();
      }
    },
  };
}

export function isDOMNumberInput(value: any): value is DOMNumberInput {
  return value.t === "number-input";
}
