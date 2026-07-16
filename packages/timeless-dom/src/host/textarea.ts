import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMTextarea = VNodeView<HTMLTextAreaElement> & {
  t: "textarea";
  isDocumentFragment(): boolean;
  setValue(value: string): void;
  focus(): void;
  blur(): void;
  render(): HTMLTextAreaElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMTextarea(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): DOMTextarea {
  const t = "textarea";
  const $elm = document.createElement("textarea");
  const common$ = HostElement({ $elm, t, build: props.build });

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
    setValue(value: string) {
      $elm.value = value;
    },
    render() {
      // $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      common$.methods.applyState(props.elm.state, { initial: true });
      $elm.value = props.elm.state.value;
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
      common$.methods.setupEventListener(props.elm.events);
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
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMTextarea(value: any): value is DOMTextarea {
  return value.t === "textarea";
}
