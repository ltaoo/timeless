import { viewStyleToCssText } from "@/modules/style";
import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMImg {
  t: "img";
  $elm: HTMLImageElement;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  setSrc(v: string): void;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  render(elm: TimelessElement): HTMLDivElement;
}

export function DOMImg(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMImg {
  const $elm = document.createElement("img");

  const methods = {
    setSrc(v: string) {
      $elm.src = v;
    },
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
    t: "img",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return $elm.childNodes;
    },
    setSrc(v: string) {
      methods.setSrc(v);
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      $elm.style[key] = value;
    },
    render(elm: TimelessElement) {
      // console.log(elm);
      if (elm.value) {
        methods.setSrc(elm.value as string);
      }
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
      return $elm;
    },
  };
}

export function isDOMImg(value: any): value is DOMImg {
  return value.t === "img";
}
