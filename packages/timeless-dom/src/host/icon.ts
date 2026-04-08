import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
} from "@timeless/timeless";
import * as ASN from "@timeless/svg/asn";

import { viewStyleToCssText } from "./style";
import { DOMHostNode } from "./type";

type ASNNode = {
  tag: string;
  attrs?: Record<string, string>;
  children?: readonly ASNNode[];
};

function render_asn_to_svg(
  asn: ASNNode,
  props?: {
    color: string;
    size: number;
    // style?: ViewStyleProperties;
    // styleSet?: string[];
  },
): SVGElement {
  const { tag, attrs = {}, children } = asn;

  // Create SVG element
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

  // Apply attributes from ASN
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }

  // Apply size and color for SVG element
  if (tag === "svg") {
    const size = props?.size ? String(props.size) : "24";
    element.setAttribute("width", size);
    element.setAttribute("height", size);

    // Apply color if provided
    if (props?.color) {
      element.style.color = props.color;
      element.style.stroke = props.color;
    }
  }

  // Recursively render children
  if (children && children.length > 0) {
    for (const child of children) {
      const childElement = render_asn_to_svg(child, props);
      element.appendChild(childElement);
    }
  }

  return element;
}

export interface DOMIcon {
  t: "icon";
  $elm: SVGSVGElement;
  isDocumentFragment(): boolean;
  getChildNodes(): ChildNode[];
  setStyle(style: ViewStyleProperties): void;
  setStyleValue(key: string, value: string): void;
  setStyleSet(key: string): void;
  render(elm: TimelessElement): SVGSVGElement;
}

export function DOMIcon(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMIcon {
  let $elm: SVGSVGElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  // let $elm = document.createElement("svg");

  const methods = {
    setStyle(style: ViewStyleProperties) {
      const cssText = viewStyleToCssText(style);
      $elm.style.cssText = cssText;
    },
    setStyleSet(styleSet: string[]) {
      // $elm.className = styleSet.join(" ");
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
    t: "icon",
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
      $elm.style[key] = value;
    },
    setStyleSet(name: string) {
      // $elm.className = name;
    },
    render(elm: TimelessElement) {
      const name = elm.value.name as string;
      if (!name) {
        return $elm;
      }
      // Convert kebab-case to PascalCase (e.g., "check" -> "Check", "chevron-down" -> "ChevronDown")
      const pascal_name = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      // Get ASN node from @timeless/svg/asn
      const asn_node = (ASN as any)[pascal_name] as ASNNode | undefined;
      if (!asn_node) {
        console.warn(`Icon "${name}" not found in @timeless/svg/asn`);
        return $elm;
      }

      // Clear previous content
      // $elm.innerHTML = "";

      // Render ASN to SVG element
      $elm = render_asn_to_svg(asn_node, elm.value) as SVGSVGElement;
      // $elm.appendChild($svg);

      return $elm;
    },
  };
}

export function isDOMIcon(value: any): value is DOMIcon {
  return value.t === "icon";
}
