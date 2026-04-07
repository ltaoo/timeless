import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { DOMHostNode } from "./type";

export interface DOMPopper {
  t: "popper";
  $elm: HTMLDivElement;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  setAttribute(key: string, value: string): void;
  removeAttribute(key: string): void;
  getBoundingClientRect(): DOMRect;
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

export function DOMPopper(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMPopper {
  const $elm = document.createElement("div");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      $elm.style.cssText = cssText;
    },
    setStyleSets(styleSets: string[]) {
      $elm.className = styleSets.join(" ");
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
    t: "popper",
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
      //       if (elm.props?.style) {
      //         methods.setStyle(elm.props.style);
      //       }
      if (elm.value) {
        methods.setStyle({
          "z-index": elm.value.zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: elm.value.placed ? 1 : 0,
          "pointer-event": elm.value.placed ? "initial" : "none",
          transform: elm.value.placed
            ? `translate3d(${Math.round(elm.value.x)}px, ${Math.round(elm.value.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        });
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

export function isDOMPopper(value: any): value is DOMPopper {
  return value.t === "popper";
}
