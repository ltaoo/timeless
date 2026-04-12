import { TimelessElement, VNodeView } from "@timeless/timeless";
import * as ASN from "@timeless/svg/asn";

import { HostElement } from "./box";

export type DOMIcon = VNodeView<SVGSVGElement> & {
  t: "icon";
  render(elm: TimelessElement): SVGSVGElement | null;
  hydrate(elm: TimelessElement, $dom: SVGSVGElement): void;
};

export function DOMIcon(props: {
  build: (elm: TimelessElement) => VNodeView<SVGSVGElement>;
}): DOMIcon {
  const t = "icon";
  let $elm: any = null;
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
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
      $elm = render_asn_to_svg(asn_node, elm.state) as SVGSVGElement;
      common$.methods.set$elm($elm);
      // common$.methods.applyState(elm.state);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: any) {
      common$.methods.set$elm($elm);
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
  props: { styleSet?: string[]; color: string; size: number },
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
    // console.log("render_asn_to_svg", props.styleSet);
    const size = props.size ? String(props.size) : "24";
    element.setAttribute("width", size);
    element.setAttribute("height", size);

    // Apply color if provided
    // if (props.color) {
    //   element.style.color = props.color;
    //   element.style.stroke = props.color;
    // }
    if (props.styleSet) {
      element.classList.add(...props.styleSet);
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
