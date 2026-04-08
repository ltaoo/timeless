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
  getChildNodes(): ChildNode[];
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
  removeContent(): void;
}

export function DOMView(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMView {
  const $elm = document.createElement("div");
  // 要记 DOMXXX 实例，就是 $sub，通过它来销毁，而不是保留 ChildNode 这种宿主元素
  // 移除子内容，由于子内容可能是 Fragment、Show 等等
  // 完全可以调用 DOMFragment.removeContent、DOMShow.removeContent 来移除
  // 就不用判断 isDocumentFragment，然后把子容器的 ChildNode 放到自身上来，别扭
  // 移除子元素，让容器自己来做
  const children$: ChildNode[] = [];

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
      if (events.onMouseDown) {
        $elm.addEventListener("mousedown", events.onMouseDown);
      }
      if (events.onMouseUp) {
        $elm.addEventListener("mouseup", events.onMouseUp);
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
      return children$;
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
      try {
        if (elm.state.style) {
          methods.setStyle(elm.state.style);
        }
      } catch (e) {
        console.log(elm);
        console.error(e);
      }
      if (elm.state.styleSet) {
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
              children$.push($sub.$elm);
              $elm.appendChild($sub.$elm);
            }
          }
        }
      }
      return $elm;
    },
    removeContent() {
      for (const child of children$) {
        const $parent = child.parentElement;
        if ($parent) {
          $parent.removeChild(child);
        }
      }
      children$.length = 0;
    },
  };
}

export function isDOMView(value: any): value is DOMView {
  return value.t === "view";
}
