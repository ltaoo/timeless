import { TimelessElement, ViewStyleProperties } from "@timeless/primitive";

import { viewStyleToCssText } from "./style";
import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";

export interface CanvasIcon {
  t: "icon";
  $elm: any;
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  render(elm: TimelessElement): any;
}

export function CanvasIcon(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
}): CanvasIcon {
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
    t: "icon",
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return $elm ? [] : [];
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      canvas.patchStyle?.($elm, { [key]: value });
    },
    setStyleSet(name: string) {
      canvas.setClassName($elm, name);
    },
    render(elm: TimelessElement) {
      const name = elm.value as string;
      if (!name) {
        return $elm;
      }

      // Set size
      const props = elm.props as any;
      const size = props?.size ? String(props.size) : "24";
      const sizeNum = parseFloat(size);
      canvas.setAttribute($elm, "width", size);
      canvas.setAttribute($elm, "height", size);

      // Store icon data on the element for rendering
      ($elm as any)._iconName = name;
      ($elm as any)._iconSize = sizeNum;
      ($elm as any)._iconColor = props?.color || "white";

      // console.log("[Icon.render]", { name, size, color: props?.color, $elm });

      return $elm;
    },
  };
}

export function isCanvasIcon(value: any): value is CanvasIcon {
  return value.t === "icon";
}
