import {
  SVG,
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
  G,
  Text,
} from "@timeless/primitive";

export const defaultWidth = "24";
export const defaultHeight = "24";

export type IconSize = string | number;

export type IconProps = {
  class?: string;
  className?: string;
  style?: string;
  size?: IconSize;
  onClick?: (event: MouseEvent) => void;
  id?: string;
  onMounted?: (svg: SVGSVGElement) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

type ASNNode = {
  tag: string;
  attrs?: Record<string, string>;
  children?: readonly ASNNode[];
};

function renderASN(asn: ASNNode): any {
  const { tag, attrs = {}, children } = asn;
  const props: Record<string, any> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      props.class = value;
    } else if (key.startsWith("data-")) {
      props.dataset = { ...props.dataset, [key.slice(5)]: value };
    } else {
      props[key] = value;
    }
  }

  if (!children || children.length === 0) {
    switch (tag) {
      case "svg":
        return SVG(props);
      case "path":
        return Path(props);
      case "circle":
        return Circle(props);
      case "rect":
        return Rect(props);
      case "line":
        return Line(props);
      case "polyline":
        return Polyline(props);
      case "polygon":
        return Polygon(props);
      case "g":
        return G(props);
      case "text":
        return Text(props);
      default:
        return SVG(props);
    }
  }

  const childElements = children.map((child) => renderASN(child));

  switch (tag) {
    case "svg":
      return SVG(props, childElements);
    case "g":
      return G(props, childElements);
    default:
      return SVG(props, childElements);
  }
}

export function createIcon(asn: ASNNode) {
  return function (props: IconProps = {}) {
    const mergedProps: Record<string, any> = { ...asn.attrs };

    if (props.class) {
      mergedProps.class = asn.attrs?.class
        ? `${asn.attrs.class} ${props.class}`
        : props.class;
    } else if (props.className) {
      mergedProps.class = asn.attrs?.class
        ? `${asn.attrs.class} ${props.className}`
        : props.className;
    }

    if (props.id) {
      mergedProps.id = props.id;
    }

    if (props.size) {
      mergedProps.width = String(props.size);
      mergedProps.height = String(props.size);
    }

    if (props.onClick) {
      mergedProps.onClick = props.onClick;
    }

    if (props.onMounted) {
      mergedProps.onMounted = props.onMounted;
    }

    if (props.onUnmounted) {
      mergedProps.onUnmounted = props.onUnmounted;
    }

    if (props.beforeUnmounted) {
      mergedProps.beforeUnmounted = props.beforeUnmounted;
    }

    const svgProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(mergedProps)) {
      if (key === "class") {
        svgProps.class = value;
      } else if (key.startsWith("data-")) {
        svgProps.dataset = { ...svgProps.dataset, [key.slice(5)]: value };
      } else {
        svgProps[key] = value;
      }
    }

    const children = (asn.children || []).map((child) => renderASN(child));
    return SVG(svgProps, children);
  };
}
