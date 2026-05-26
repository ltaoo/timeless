import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMRadio = VNodeView<HTMLInputElement> & {
  t: "radio";
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setChecked(checked: boolean): void;
};

export function DOMRadio(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
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
    render(elm: TimelessElement) {
      const $elm = document.createElement("input");
      $elm.type = "radio";
      $elm.checked = !!elm.state.value;
      if (elm.state.id) {
        $elm.id = elm.state.id;
      }
      if (elm.state.name) {
        $elm.name = elm.state.name;
      }
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      if (elm.state.tabindex !== undefined) {
        $elm.setAttribute("tabindex", elm.state.tabindex);
      }
      delete elm.state.value;
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
