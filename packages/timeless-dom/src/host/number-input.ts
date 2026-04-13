import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMNumberInput = VNodeView<HTMLInputElement> & {
  t: "number-input";
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setValue(value: string): void;
  focus(): void;
  blur(): void;
};

export function DOMNumberInput(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
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
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
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
