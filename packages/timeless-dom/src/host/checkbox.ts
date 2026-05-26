import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMCheckbox = VNodeView<HTMLInputElement> & {
  t: "checkbox";
  render(elm: TimelessElement): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setChecked(checked: boolean): void;
};

export function DOMCheckbox(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
}): DOMCheckbox {
  const t = "checkbox";
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
    render(elm: TimelessElement) {
      const $elm = document.createElement("input");
      console.log('[dom]create checkbox', elm.state);
      // $elm.style.backgroundColor = "transparent";
      // console.log("[DOMCheckbox] render", elm.value);
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      $elm.type = "checkbox";
      if (elm.state !== undefined) {
        $elm.checked = !!elm.state.checked;
        if (elm.state.checked) {
          $elm.setAttribute("checked", "checked");
        }
      }
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
      common$.methods.setupEventListener(elm.events);
      const events = elm.events;
      $elm.addEventListener("click", function (event) {
        // event.preventDefault();
        if (events && events.onChange) {
          events.onChange(event);
        }
      });
      if (events) {
        // const onChange = events.onChange;
        // if (onChange) {
        //   $elm.addEventListener("change", function (event) {
        //     event.preventDefault();
        //     onChange(event);
        //   });
        // }
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
        console.log("click", event);
        // event.preventDefault();
        if (events && events.onChange) {
          events.onChange(event);
        }
      });
      if (events) {
        // const onChange = events.onChange;
        // if (onChange) {
        //   $elm.addEventListener("change", function (event) {
        //     event.preventDefault();
        //     onChange(event);
        //   });
        // }
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
        console.warn("DOMInput setValue: $elm is null");
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

export function isDOMCheckbox(value: any): value is DOMCheckbox {
  return value.t === "checkbox";
}
