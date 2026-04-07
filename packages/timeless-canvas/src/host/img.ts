import {
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/primitive";

import { viewStyleToCssText } from "./style";
import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";

export interface CanvasImg {
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setSrc(v: string): void;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  render(elm: TimelessElement): any;
}

export function CanvasImg(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
}): CanvasImg {
  const canvas = props.canvas;
  const $elm = canvas.createElement("img");

  let imageElement: HTMLImageElement | null = null;
  let currentSrc: string = "";

  const methods = {
    setSrc(v: string) {
      if (currentSrc === v) return;
      currentSrc = v;

      // Store src as attribute for canvas rendering
      canvas.setAttribute($elm, "src", v);

      // Load image for drawing
      if (v) {
        imageElement = new Image();
        imageElement.crossOrigin = "anonymous";
        imageElement.onload = () => {
          // Store the loaded image on the element for rendering
          ($elm as any)._imageElement = imageElement;
          // Trigger redraw when image loads
          canvas.draw();
        };
        imageElement.onerror = () => {
          // Clear image on error
          ($elm as any)._imageElement = null;
        };
        imageElement.src = v;
      } else {
        ($elm as any)._imageElement = null;
      }
    },
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
      return $elm ? [] : [];
    },
    setSrc(v: string) {
      methods.setSrc(v);
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      canvas.patchStyle?.($elm, { [key]: value });
    },
    render(elm: TimelessElement) {
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

export function isCanvasImg(value: any): value is CanvasImg {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function" &&
    typeof value.setSrc === "function"
  );
}
