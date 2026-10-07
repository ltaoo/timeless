import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMInput = VNodeView<HTMLInputElement> & {
  t: "input";
  setValue(value: string): void;
  render(): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMInput(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
  elm: TimelessElement;
}): DOMInput {
  const t = "input";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "input";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("input");
      $elm.type = "text";
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
      common$.methods.set$elm($elm);
      common$.methods.applyState(props.elm.state, { initial: true });
      if (props.elm.state.maxLength !== undefined) {
        $elm.setAttribute("max-length", props.elm.state.maxLength);
      }
      if (props.elm.state.tabindex !== undefined) {
        $elm.setAttribute("tabindex", props.elm.state.tabindex);
      }
      if (props.elm.state.autoComplete !== undefined) {
        $elm.setAttribute("autocomplete", props.elm.state.autoComplete);
      }
      // $elm.style.width = "100%";
      // console.log("[dom]input render - before setupEvent", props.elm.events);
      common$.methods.setupEventListener(props.elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLInputElement) {
      console.log("[dom]host/input hydrate", $elm, elm.state.value);
      common$.methods.set$elm($elm);
      // $elm.style.width = "100%";
      common$.methods.setupEventListener(elm.events);
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
