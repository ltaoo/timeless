import { viewStyleToCssText } from "@/modules/style";
import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMPortal {
  t: "portal";
  $elm: DocumentFragment;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
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
  render(elm: TimelessElement): Text;
  removeContent(): void;
}

export function DOMPortal(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMPortal {
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      //       $elm.style.cssText = cssText;
    },
    setStyleSets(styleSets: string[]) {
      //       $elm.className = styleSets.join(" ");
    },
    setupEventListener(events: any) {
      if (events.onClick) {
        $fragment.addEventListener("click", events.onClick);
      }
      if (events.onDoubleClick) {
        $fragment.addEventListener("dblclick", events.onDoubleClick);
      }
      if (events.onPointerDown) {
        $fragment.addEventListener("pointerdown", events.onPointerDown);
      }
      if (events.onFocus) {
        $fragment.addEventListener("focus", events.onFocus);
      }
      if (events.onBlur) {
        $fragment.addEventListener("blur", events.onBlur);
      }
      if (events.onKeyDown) {
        $fragment.addEventListener("keydown", events.onKeyDown);
      }
      if (events.onContextMenu) {
        $fragment.addEventListener("contextmenu", events.onContextMenu);
      }
      if (events.onMouseEnter) {
        $fragment.addEventListener("mouseenter", events.onMouseEnter);
      }
      if (events.onMouseLeave) {
        $fragment.addEventListener("mouseleave", events.onMouseLeave);
      }
      if (events.onDragStart) {
        $fragment.addEventListener("dragstart", events.onDragStart);
      }
      if (events.onDrag) {
        $fragment.addEventListener("drag", events.onDrag);
      }
      if (events.onDragEnd) {
        $fragment.addEventListener("dragend", events.onDragEnd);
      }
      if (events.onDragEnter) {
        $fragment.addEventListener("dragenter", events.onDragEnter);
      }
      if (events.onDragOver) {
        $fragment.addEventListener("dragover", events.onDragOver);
      }
      if (events.onDragLeave) {
        $fragment.addEventListener("dragleave", events.onDragLeave);
      }
      if (events.onDrop) {
        $fragment.addEventListener("drop", events.onDrop);
      }
      if (events.onAnimationEnd) {
        $fragment.addEventListener("animationend", events.onAnimationEnd);
      }
    },
  };

  let children$: ChildNode[] = [];

  return {
    t: "portal",
    get $elm() {
      return $fragment;
    },
    isDocumentFragment() {
      return true;
    },
    getChildNodes() {
      return $fragment.childNodes;
    },
    setStyle(style: ViewStyleProperties) {
      methods.setStyle(style);
    },
    setStyleValue(key: any, value: string) {
      //       $elm.style[key] = value;
    },
    setStyleSet(name: string) {
      //       $elm.className = name;
    },
    setAttribute(key: string, value: string) {
      //       $elm.setAttribute(key, value);
    },
    removeAttribute(key: string) {
      //       $elm.removeAttribute(key);
    },
    addEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $fragment.addEventListener(type, handler, options);
    },
    removeEventListener(
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      $fragment.removeEventListener(type, handler, options);
    },
    render(elm: TimelessElement) {
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
      if (elm.events) {
        methods.setupEventListener(elm.events);
      }
      const new_nodes: any[] = [];
      const new_instances: any[] = [];
      if (elm.children) {
        // console.log("[]show - in render", elm.children);
        for (let child of elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
            new_instances.push(child);
            const $sub = props.build(child);
            if (!$sub) {
              continue;
            }
            if ($sub.isDocumentFragment()) {
              const child_nodes = Array.from($sub.getChildNodes());
              new_nodes.push(...child_nodes);
              children$.push(...child_nodes);
            } else {
              new_nodes.push($sub);
              if ($sub.$elm) {
                children$.push($sub.$elm as ChildNode);
              }
            }
            if ($sub.$elm) {
              $fragment.appendChild($sub.$elm);
            }
          }
        }
        $fragment.appendChild($anchor);
      }
      document.body.appendChild($fragment);
      return $anchor;
    },
    removeContent() {
      for (const node of children$) {
        const $parent = node.parentElement;
        // console.log("[]show remove content", node, $parent);
        if ($parent) {
          $parent.removeChild(node);
        }
      }
      children$ = [];
      // @fragment 会在 appendChild 自己清空，无需手动清空
    },
  };
}

export function isDOMPortal(value: any): value is DOMPortal {
  return value.t === "portal";
}
