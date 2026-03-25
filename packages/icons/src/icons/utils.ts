export const defaultWidth = "1em";
export const defaultHeight = "1em";

export function createIcon(svg: string) {
  return function (props: any = {}) {
    const span = document.createElement("span");
    span.innerHTML = svg;
    span.style.display = "inline-flex";
    span.style.alignItems = "center";
    span.style.justifyContent = "center";

    if (props.class) {
      if (typeof props.class === "string") {
        span.className = props.class;
      }
    }
    if (props.style) {
      if (typeof props.style === "string") {
        span.setAttribute("style", span.style.cssText + ";" + props.style);
      }
    }
    if (props.onClick) {
      span.addEventListener("click", props.onClick);
    }
    if (props.id) {
      if (typeof props.id === "string") {
        span.id = props.id;
      }
    }

    return {
      t: "view",
      $elm: span,
      render() {
        return span;
      },
      onMounted() {
        props.onMounted?.(span);
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
