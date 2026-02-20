import { View } from "./view.js";
import { isRef, classnames } from "./core.js";

export function Paragraph(props, children) {
  const class$ = classnames();
  const node$ = View(
    {
      type: "p",
      class: class$.toString(),
    },
    children,
  );
  return {
    t: "view",
    append(node) {
      return node$.append(node);
    },
    setContent(v) {
      return node$.setContent(v);
    },
    render() {
      return node$.render();
    },
    onMounted() {
      if (node$.onMounted) {
        node$.onMounted();
      }
      if (props.onMounted) {
        props.onMounted();
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (node$.onUnmounted) {
        node$.onUnmounted();
      }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}
