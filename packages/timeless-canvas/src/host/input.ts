import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/primitive";

import { viewStyleToCssText } from "./style";
import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";
// import { canvas } from "./draw";

export interface CanvasInput {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  render(elm: TimelessElement): any;
}

export function CanvasInput(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
}): CanvasInput {
  const canvas = props.canvas;
  const $elm = canvas.createElement("div");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      canvas.setStyleText($elm, cssText);
    },
    setStyleSets(styleSets: string[]) {
      canvas.setClassName($elm, styleSets.join(" "));
    },
    setupEventListener(events: any) {
      if (events.onClick) {
        canvas.addEventListener($elm, "click", events.onClick);
      }
      if (events.onDoubleClick) {
        canvas.addEventListener($elm, "dblclick", events.onDoubleClick);
      }
      if (events.onPointerDown) {
        canvas.addEventListener($elm, "pointerdown", events.onPointerDown);
      }
      if (events.onFocus) {
        canvas.addEventListener($elm, "focus", events.onFocus);
      }
      if (events.onBlur) {
        canvas.addEventListener($elm, "blur", events.onBlur);
      }
      if (events.onKeyDown) {
        canvas.addEventListener($elm, "keydown", events.onKeyDown);
      }
      if (events.onContextMenu) {
        canvas.addEventListener($elm, "contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        canvas.addEventListener($elm, "mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        canvas.addEventListener($elm, "mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        canvas.addEventListener($elm, "dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        canvas.addEventListener($elm, "drag", events.onDrag);
      }
      if (events.onDragEnd) {
        canvas.addEventListener($elm, "dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        canvas.addEventListener($elm, "dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        canvas.addEventListener($elm, "dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        canvas.addEventListener($elm, "dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        canvas.addEventListener($elm, "drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        canvas.addEventListener($elm, "animationend", events.onAnimationEnd);
      }
    },
  };

  return {
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
      canvas.patchStyle?.($elm, { [key]: value });
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
            const $sub = props.build(child, canvas);
            if ($sub && $sub.$elm) {
              canvas.appendChild($elm, $sub.$elm);
            }
          } else if (typeof child === "string" || typeof child === "number") {
            // 处理文本节点
            const textNode = canvas.createTextNode(String(child));
            canvas.appendChild($elm, textNode);
          }
        }
      }
      return $elm;
    },
  };
}

export function isCanvasInput(value: any): value is CanvasInput {
  return value.t === "input";
}
