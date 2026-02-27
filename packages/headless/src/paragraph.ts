import { View } from "./view.js";
import { isRef, classnames } from "@timeless/reactive";

export function Paragraph(props: any, children?: any) {
  const class$ = classnames([]);
  const node$ = View(
    {
      type: "p",
      // class: class$.toString(),
    },
    children,
  );
  return {
    t: "view",
    append(node: any) {
      return node$.append(node);
    },
    setContent(v: any) {
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
