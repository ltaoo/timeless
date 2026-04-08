import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { DOMHostNode } from "./type";

export interface DOMView {
  t: "view";
  $elm: HTMLDivElement;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  setAttribute(key: string, value: string): void;
  getBoundingClientRect(): DOMRect;
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
  render(elm: TimelessElement): HTMLDivElement;
}

export function DOMView(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMView {
  const $elm = document.createElement("div");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      $elm.style.cssText = cssText;
    },
    setStyleSet(styleSet: string[]) {
      $elm.className = styleSet.join(" ");
    },
    setupEventListener(events: any) {
      if (events.onClick) {
        $elm.addEventListener("click", events.onClick);
      }
      if (events.onDoubleClick) {
        $elm.addEventListener("dblclick", events.onDoubleClick);
      }
      if (events.onPointerDown) {
        $elm.addEventListener("pointerdown", events.onPointerDown);
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
      if (events.onContextMenu) {
        $elm.addEventListener("contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        $elm.addEventListener("mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        $elm.addEventListener("mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        $elm.addEventListener("dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        $elm.addEventListener("drag", events.onDrag);
      }
      if (events.onDragEnd) {
        $elm.addEventListener("dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        $elm.addEventListener("dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        $elm.addEventListener("dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        $elm.addEventListener("dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        $elm.addEventListener("drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        $elm.addEventListener("animationend", events.onAnimationEnd);
      }
    },
  };

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return $elm.childNodes;
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      $elm.style[key] = value;
    },
    setStyleSet(name: string) {
      $elm.className = name;
    },
    setAttribute(key: string, value: string) {
      $elm.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      $elm.removeAttribute(key);
    },
    getBoundingClientRect() {
      return $elm.getBoundingClientRect();
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
      if (elm.state?.style) {
        methods.setStyle(elm.state.style);
      }
      if (elm.state?.styleSet) {
        methods.setStyleSet(elm.state.styleSet);
      }
      const attrs = elm.state.attributes;
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
          if (value !== undefined) {
            $elm.setAttribute(key, String(value));
          } else {
            $elm.removeAttribute(key);
          }
        }
      }
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
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
      return $elm;
    },
  };
}

export function isDOMView(value: any): value is DOMView {
  return value.t === "view";
}
