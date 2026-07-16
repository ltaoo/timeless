import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMSwitch = VNodeView<HTMLDivElement> & {
  t: "switch";
  render(): HTMLButtonElement;
  hydrate(elm: TimelessElement, $dom: any): void;
  setChecked(checked: boolean): void;
  setLoading(loading: boolean): void;
};

export function DOMSwitch(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
}): DOMSwitch {
  const t = "switch";
  let $root: null | HTMLButtonElement = null;
  let $thumb: null | HTMLDivElement = null;
  let $loading: null | HTMLDivElement = null;
  const common$ = HostElement({ $elm: null, t, build: props.build });
  const state: { checked?: boolean; loading?: boolean } = {};

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
      $root = document.createElement("button");
      $root.style.cssText =
        "position: relative; display: inline-flex; flex-shrink: 0; width: 32px; height: 18px; padding: 0; border-width: 1px; border-color: transparent; border-radius: 3.40282e38px; background-color: buttonface; transition-property: background-color; transition-timing-function: cubic-bezier(.4,0,.2,1); transition-duration: .15s;";

      $thumb = document.createElement("div");
      $thumb.style.cssText =
        "display: block; width: 16px; height: 16px; border-radius: 3.40282e38px; background-color: CanvasText; pointer-events: none; transform: translateX(0); transition-property: transform,translate,scale,rotate; transition-timing-function: cubic-bezier(.4,0,.2,1); transition-duration: .15s;";

      $loading = document.createElement("div");
      //       $loading.innerHTML = "L";

      //       const $checkbox = document.createElement("input");
      //       $checkbox.type = "checkbox";
      //       $checkbox.style.cssText = `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;`;

      if (props.elm.state !== undefined) {
        state.checked = props.elm.state.checked;
        state.loading = props.elm.state.loading;
        if (props.elm.state.checked) {
          $root.setAttribute("checked", "checked");
        }
        if (props.elm.state.id) {
          $root.id = props.elm.state.id;
        }
      }

      $root.appendChild($thumb);

      common$.methods.set$elm($root);
      common$.methods.applyState(props.elm.state, { initial: true });
      common$.methods.setupEventListener(props.elm.events);
      const events = props.elm.events;
      $root.addEventListener("click", function (event) {
        // event.preventDefault();
        if (events && events.onChange) {
          if (event.target) {
            // @ts-ignore
            event.target.checked = !props.elm.state.checked;
          }
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
          $root.addEventListener("focus", events.onFocus);
        }
        if (events.onBlur) {
          $root.addEventListener("blur", events.onBlur);
        }
      }
      return $root;
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
      console.log("[dom]switch - setChecked", checked);
      state.checked = checked;
      if (!$root || !$thumb) {
        console.warn("DOMInput setValue: $elm is null");
        return;
      }
      if (checked) {
        $thumb.style.transform = `translateX(calc(100% - 2px))`;
        setTimeout(() => {
          $root!.style.backgroundColor = "CanvasText";
          $thumb!.style.backgroundColor = "buttonface";
          //   $thumb!.style.backgroundColor = "Canvas";
        }, 120);
      } else {
        $thumb.style.transform = `translateX(0)`;
        setTimeout(() => {
          $root!.style.backgroundColor = "buttonface";
          $thumb!.style.backgroundColor = "CanvasText";
          //   $thumb!.style.backgroundColor = "color-mix(in srgb, Canvas 50%, transparent)";
        }, 120);
      }
    },
    setLoading(loading: boolean) {
      console.log("[dom]switch - setLoading", loading);
      state.loading = loading;
      if (!$thumb || !$loading) {
        console.warn("DOMInput setValue: $elm is null");
        return;
      }
      $loading.style.color = state.checked ? "#fff" : "#000";
      if (loading) {
        $thumb.appendChild($loading);
      } else {
        $thumb.removeChild($loading);
      }
    },
  };
}

export function isDOMSwitch(value: any): value is DOMSwitch {
  return value.t === "switch";
}
