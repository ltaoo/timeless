import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMSelect = VNodeView<HTMLDivElement> & {
  t: "select";
  render(elm: TimelessElement): HTMLSelectElement;
  hydrate(elm: TimelessElement, $elm: HTMLElement): void;
};

export function DOMSelect(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSelect {
  const t = "select";
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
      const $elm = document.createElement("select");

      common$.methods.applyState(elm.state, { initial: true });
      const r = common$.methods.buildChildren(elm.children);
      const $placeholder = document.createElement("option");
      $placeholder.value = "";
      $placeholder.innerText = elm.state.placeholder;
      r.$fragment.insertBefore($placeholder, r.$fragment.children[0]);
      $elm.appendChild(r.$fragment);
      common$.methods.setupEventListener(elm.events);

      $elm.addEventListener("change", function (event) {
        // console.log(event.target.value);
        if (elm.events?.onChange) {
          elm.events?.onChange(event);
        }
      });

      // const r2 = common$.methods.buildChildren(elm.state.option_elements);
      // const $popper_content = document.createElement("div");
      // $popper_content.style.cssText = "padding: 0 8px; background-color: #fff;";
      // $popper_content.appendChild(r2.$fragment);
      // $elm.addEventListener("click", () => {
      //   document.body.appendChild($popper_content);
      //   setTimeout(() => {
      //     const reference_rect = $elm.getBoundingClientRect();
      //     // console.log(
      //     //   "[dom]select place floating - reference_rect",
      //     //   reference_rect,
      //     // );
      //     const popper_content_rect = $popper_content.getBoundingClientRect();
      //     $popper_content.style.cssText = `
      //       display: block;
      //       position: absolute;
      //       top: ${reference_rect.top + reference_rect.height}px;
      //       left: ${reference_rect.left}px;
      //       background-color: #fff;
      //       border-radius: 8px;
      //     `;
      //   }, 0);
      // });
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMSelect(value: any): value is DOMSelect {
  return value.t === "select";
}

export type DOMSelectOption = VNodeView<HTMLDivElement> & {
  t: "select-option";
  render(elm: TimelessElement): HTMLSelectElement;
  hydrate(elm: TimelessElement, $elm: HTMLElement): void;
};

export function DOMSelectOption(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLSelectElement>;
}) {
  let $elm: any = null;
  const t = "select-option";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view" as const;
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    select() {
      if (!$elm) {
        return;
      }
      $elm.selected = true;
      $elm.setAttribute("selected", "");
    },
    unselect() {
      if (!$elm) {
        return;
      }
      $elm.selected = false;
      $elm.removeAttribute("selected");
    },
    render(elm: TimelessElement) {
      $elm = document.createElement("option");

      if (elm.state) {
        if (elm.state.value) {
          $elm.value = elm.state.value;
        }
        if (elm.state.label) {
          $elm.innerText = elm.state.label;
        }
        if (elm.state.selected) {
          $elm.selected = true;
          $elm.setAttribute("selected", "");
        }
        if (elm.state.disabled) {
          $elm.disabled = true;
          $elm.setAttribute("disabled", "");
        }
      }

      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMSelectOptionGroup = VNodeView<HTMLDivElement> & {
  t: "select-option-group";
  render(elm: TimelessElement): HTMLSelectElement;
  hydrate(elm: TimelessElement, $elm: HTMLElement): void;
};

export function DOMSelectOptionGroup(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLSelectElement>;
}) {
  const t = "select-option-group";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view" as const;
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("optgroup");

      if (elm.state) {
        if (elm.state.label) {
          $elm.label = elm.state.label;
        }
      }

      const r = common$.methods.buildChildren(elm.children);
      $elm.appendChild(r.$fragment);

      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
    },
  };
}
