import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMInput = VNodeView<HTMLInputElement> & {
  t: "input";
  setValue(value: string): void;
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMInput(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
}): DOMInput {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "input";
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
      $elm.type = "text";
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
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      $elm.style.width = "100%";
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      $elm.addEventListener("input", function (event) {
        event.preventDefault();
        if (events && events.onInput) {
          events.onInput(event);
        }
      });
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
      console.log("[dom]host/input hydrate", $elm, elm.state.value);
      common$.methods.set$elm($elm);
      $elm.style.width = "100%";
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      $elm.addEventListener("input", function (event) {
        console.log("handle input in hydrate");
        event.preventDefault();
        if (events && events.onInput) {
          events.onInput(event);
        }
      });
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
    },
    setValue(value: string) {
      const $elm = common$.methods.get$elm();
      if (!$elm) {
        console.warn("DOMInput setValue: $elm is null");
        return;
      }
      $elm.value = value;
    },
  };
}

export function isDOMInput(value: any): value is DOMInput {
  return value.t === "input";
}
