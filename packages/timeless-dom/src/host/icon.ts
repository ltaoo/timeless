import { TimelessElement, VNodeView } from "@timeless/timeless";
import * as ASN from "@timeless/svg/asn";

import { HostElement } from "./box";

export type DOMIcon = VNodeView<SVGSVGElement> & {
  t: "icon";
  render(elm: TimelessElement): SVGSVGElement | null;
};

export function DOMIcon(props: {
  build: (elm: TimelessElement) => VNodeView<SVGSVGElement>;
}): DOMIcon {
  const t = "icon";
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle: common$.methods.setStyle,
    setStyleValue: common$.methods.setStyleValue,
    setStyleSet: common$.methods.setStyleSet,
    setAttribute: common$.methods.setAttribute,
    removeAttribute: common$.methods.removeAttribute,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      const name = elm.state.name as string;
      // console.log("[]icon - render name", name);
      if (!name) {
        console.warn(`Icon must have a name`);
        return null;
      }
      // Convert kebab-case to PascalCase (e.g., "check" -> "Check", "chevron-down" -> "ChevronDown")
      const pascal_name = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      const asn_node = (ASN as any)[pascal_name] as ASNNode | undefined;
      if (!asn_node) {
        console.warn(`Icon "${name}" not found in @timeless/svg/asn`);
        return null;
      }
      const $elm = render_asn_to_svg(asn_node, elm.state) as SVGSVGElement;
      return $elm;
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent() {
      // return $elm.parentElement;
      return null;
    },
  };
}

export function isDOMIcon(value: any): value is DOMIcon {
  return value.t === "icon";
}

type ASNNode = {
  tag: string;
  attrs?: Record<string, string>;
  children?: readonly ASNNode[];
};

function render_asn_to_svg(
  asn: ASNNode,
  props: { color: string; size: number },
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
    const size = props.size ? String(props.size) : "24";
    element.setAttribute("width", size);
    element.setAttribute("height", size);

    // Apply color if provided
    if (props.color) {
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
