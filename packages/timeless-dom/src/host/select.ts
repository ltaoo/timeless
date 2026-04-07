import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { viewStyleToCssText } from "@/modules/style";

import { DOMHostNode } from "./type";

export interface DOMSelect {
  t: "select";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  addEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  render(elm: TimelessElement): any;
}

export function DOMSelect(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMSelect {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const $elm = document.createElement("div");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      $elm.style.cssText = cssText;
      // canvas.setStyleText($elm, cssText);
    },
    setStyleSets(styleSets: string[]) {
      // canvas.setClassName($elm, styleSets.join(" "));
      $elm.className = styleSets.join(" ");
    },
    setupEventListener(events: any) {
      if (events.onClick) {
        // canvas.addEventListener($elm, "click", events.onClick);
      }
      if (events.onDoubleClick) {
        // canvas.addEventListener($elm, "dblclick", events.onDoubleClick);
      }
      if (events.onPointerDown) {
        // canvas.addEventListener($elm, "pointerdown", events.onPointerDown);
      }
      if (events.onInput) {
        $elm.addEventListener("input", events.onInput);
      }
      if (events.onChange) {
        $elm.addEventListener("change", events.onChange);
      }
      if (events.onFocus) {
        // canvas.addEventListener($elm, "focus", events.onFocus);
        $elm.addEventListener("focus", events.onFocus);
      }
      if (events.onBlur) {
        // canvas.addEventListener($elm, "blur", events.onBlur);
        $elm.addEventListener("blur", events.onBlur);
      }
      if (events.onKeyDown) {
        // canvas.addEventListener($elm, "keydown", events.onKeyDown);
        $elm.addEventListener("keydown", events.onKeyDown);
      }
      if (events.onContextMenu) {
        // canvas.addEventListener($elm, "contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        // canvas.addEventListener($elm, "mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        // canvas.addEventListener($elm, "mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        // canvas.addEventListener($elm, "dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        // canvas.addEventListener($elm, "drag", events.onDrag);
      }
      if (events.onDragEnd) {
        // canvas.addEventListener($elm, "dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        // canvas.addEventListener($elm, "dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        // canvas.addEventListener($elm, "dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        // canvas.addEventListener($elm, "dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        // canvas.addEventListener($elm, "drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        // canvas.addEventListener($elm, "animationend", events.onAnimationEnd);
      }
    },
  };

  return {
    t: "select",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return false;
    },
    getChildNodes() {
      return [];
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      // console.log("[View] setStyleValue", key, value);
      // canvas.patchStyle?.($elm, { [key]: value });
      $elm.style[key] = value;
    },
    setAttribute(key: string, value: string) {
      $elm.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      $elm.removeAttribute(key);
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $elm.addEventListener(type, handler, options);
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $elm.removeEventListener(type, handler, options);
    },
    render(elm: TimelessElement) {
      $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      if (elm.props?.style) {
        methods.setStyle(elm.props.style);
      }
      // if (elm.props?.styleSets) {
      //   if (isRef(elm.props.styleSets)) {
      //     methods.setStyleSets(elm.props.styleSets.value);
      //   } else {
      //     methods.setStyleSets(elm.props.styleSets);
      //   }
      // }
      if (elm.children) {
        for (const child of elm.children) {
          if (isElement(child)) {
            const $sub = props.build(child);
            if ($sub && $sub.$elm) {
              $elm.appendChild($sub.$elm);
            }
          }
        }
      }
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
      return $elm;
    },
  };
}

export function isDOMSelect(value: any): value is DOMSelect {
  return value.t === "select";
}
