import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMCheckbox = VNodeView<HTMLInputElement> & {
  t: "checkbox";
  render(): HTMLInputElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setChecked(checked: boolean): void;
};

export function DOMCheckbox(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLInputElement>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElement("input");
      console.log('[dom]create checkbox', props.elm.state);
      // $elm.style.backgroundColor = "transparent";
      // console.log("[DOMCheckbox] render", elm.value);
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      $elm.type = "checkbox";
      if (props.elm.state !== undefined) {
        $elm.checked = !!props.elm.state.checked;
        if (props.elm.state.checked) {
          $elm.setAttribute("checked", "checked");
        }
      }
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
      common$.methods.setupEventListener(props.elm.events);
      const events = props.elm.events;
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
