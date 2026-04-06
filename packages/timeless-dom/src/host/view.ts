import { viewStyleToCssText } from "@/modules/style";
import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMView {
  $elm: HTMLDivElement;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
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
    render(elm: TimelessElement) {
      if (elm.props?.style) {
        methods.setStyle(elm.props.style);
      }
      if (elm.props?.styleSets) {
        if (isRef(elm.props.styleSets)) {
          methods.setStyleSets(elm.props.styleSets.value);
        } else {
          methods.setStyleSets(elm.props.styleSets);
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
  return (
    value &&
    typeof value === "object" &&
    value.$elm instanceof HTMLDivElement &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
