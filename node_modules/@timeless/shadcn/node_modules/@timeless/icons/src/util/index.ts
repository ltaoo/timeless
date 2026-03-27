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

export function createIcon(svg: string) {
  return function (props: IconProps = {}) {
    const $el = document.createElement("span");
    $el.innerHTML = svg;
    const $svg = $el.querySelector<SVGSVGElement>("svg");
    if (!$svg) {
      throw new Error("Invalid svg");
    }

    const prevClass = $svg.getAttribute("class") || "";
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
      $svg.setAttribute("class", mergedClass);
    }
    if (props.style) {
      if (typeof props.style === "string") {
        const prev = $svg.getAttribute("style") || "";
        $svg.setAttribute(
          "style",
          prev ? prev + ";" + props.style : props.style,
        );
      }
    }
    if (props.onClick) {
      $svg.addEventListener("click", props.onClick);
    }
    if (props.id) {
      if (typeof props.id === "string") {
        $svg.id = props.id;
      }
    }

    return {
      t: "view",
      $elm: $svg,
      render() {
        return $svg;
      },
      onMounted() {
        props.onMounted?.($svg);
      },
      beforeUnmounted() {
        props.beforeUnmounted?.();
      },
      onUnmounted() {
        props.onUnmounted?.();
      },
    };
  };
}
