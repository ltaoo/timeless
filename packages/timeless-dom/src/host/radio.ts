import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMRadio = VNodeView<HTMLInputElement> & {
  t: "radio";
  render(): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setChecked(checked: boolean): void;
};

export function DOMRadio(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
  elm: TimelessElement;
}): DOMRadio {
  const t = "radio";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    buildChildren: common$.methods.buildChildren,
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
      $elm.type = "radio";
      $elm.checked = !!props.elm.state.value;
      if (props.elm.state.id) {
        $elm.id = props.elm.state.id;
      }
      if (props.elm.state.name) {
        $elm.name = props.elm.state.name;
      }
      common$.methods.set$elm($elm);
      common$.methods.applyState(props.elm.state, { initial: true });
      if (props.elm.state.tabindex !== undefined) {
        $elm.setAttribute("tabindex", props.elm.state.tabindex);
      }
      delete props.elm.state.value;
      common$.methods.setupEventListener(props.elm.events);
      const events = props.elm.events;
      $elm.addEventListener("click", function (event) {
        if (events && events.onChange) {
          events.onChange(event);
        }
      });
      if (events) {
        if (events.onFocus) {
          $elm.addEventListener("focus", events.onFocus);
        }
        if (events.onBlur) {
          $elm.addEventListener("blur", events.onBlur);
        }
      }
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      $elm.addEventListener("click", function (event) {
        if (events && events.onChange) {
          events.onChange(event);
        }
      });
      if (events) {
        if (events.onFocus) {
          $elm.addEventListener("focus", events.onFocus);
        }
        if (events.onBlur) {
          $elm.addEventListener("blur", events.onBlur);
        }
      }
    },
    setChecked(checked: boolean) {
      const $elm = common$.methods.get$elm();
      if (!$elm) {
        console.warn("DOMRadio setChecked: $elm is null");
        return;
      }
      if (!checked) {
        $elm.removeAttribute("checked");
      } else {
        $elm.setAttribute("checked", "checked");
      }
      $elm.checked = checked;
    },
  };
}

export function isDOMRadio(value: any): value is DOMRadio {
  return value.t === "radio";
}
