import { DangerouslyInnerHTML, getHost } from "@timeless/primitive";

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

// Simple SVG attribute parser
function parseSvgAttributes(svg: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const match = svg.match(/<svg([^>]*)>/);
  if (!match) return attrs;

  const attrStr = match[1];
  const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
  let m;
  while ((m = attrRegex.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

// Extract inner content of SVG
function extractSvgContent(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1] : "";
}

// Build SVG string with merged attributes
function buildSvgString(
  svgAttrs: Record<string, string>,
  innerContent: string,
  props: IconProps,
): string {
  const attrs = { ...svgAttrs };

  // Merge classes
  const prevClass = attrs.class || "";
  const incomingClass =
    typeof props.class === "string"
      ? props.class
      : typeof props.className === "string"
        ? props.className
        : "";
  const sizeClass =
    props.size === undefined || props.size === null || `${props.size}` === ""
      ? ""
      : `size-${props.size}`;
  const mergedClass = [prevClass, incomingClass, sizeClass]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (mergedClass) {
    attrs.class = mergedClass;
  }

  // Merge style
  if (props.style && typeof props.style === "string") {
    const prev = attrs.style || "";
    attrs.style = prev ? prev + ";" + props.style : props.style;
  }

  // Set id
  if (props.id && typeof props.id === "string") {
    attrs.id = props.id;
  }

  // Build attribute string
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

  return `<svg ${attrStr}>${innerContent}</svg>`;
}

export function createIcon(svg: string) {
  // Parse SVG attributes and content once
  const svgAttrs = parseSvgAttributes(svg);
  const innerContent = extractSvgContent(svg);

  return function (props: IconProps = {}) {
    const finalSvg = buildSvgString(svgAttrs, innerContent, props);
    const htmlNode = DangerouslyInnerHTML(finalSvg);

    return {
      t: "view",
      $elm: htmlNode.$elm,
      render() {
        const host = getHost();
        const $container = htmlNode.render();
        // Return the SVG element directly, not the wrapper div
        return host.getFirstChild($container) || $container;
      },
      onMounted() {
        htmlNode.onMounted?.();
      },
      beforeUnmounted() {
        htmlNode.beforeUnmounted?.();
      },
      onUnmounted() {
        htmlNode.onUnmounted?.();
      },
    };
  };
}
