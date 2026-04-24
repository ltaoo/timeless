import { TimelessElement, VNodeView } from "@timeless/timeless";
import {
  getIconRegistry,
  type ASNNode,
  type IconRegistry,
} from "@timeless/timeless";

import { HostElement } from "./box";

export { type ASNNode, type IconRegistry };

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
      const pascal_name = name;
      // const pascal_name = name
      //   .split("-")
      //   .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      //   .join("");
      const asn_node = getIconRegistry()[pascal_name];
      console.log(
        "[]icon - render pascal_name",
        pascal_name,
        getIconRegistry(),
        asn_node,
      );
      if (!asn_node) {
        $elm = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        $elm.setAttribute("width", String(elm.state.size || 24));
        $elm.setAttribute("height", String(elm.state.size || 24));
        $elm.setAttribute("viewBox", "0 0 24 24");
        $elm.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
        $elm.style.display = "inline-block";
        $elm.style.borderRadius = "4px";
        common$.methods.set$elm($elm);
        return $elm;
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
