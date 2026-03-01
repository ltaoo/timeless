import { View, ViewChildren, ViewProps } from "./view";

export function Paragraph(props: ViewProps & {}, children?: ViewChildren) {
  const node$ = View({ type: "p" }, children);
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
    // onMounted() {
    //   if (node$.onMounted) {
    //     node$.onMounted();
    //   }
    //   if (props.onMounted) {
    //     props.onMounted();
    //   }
    // },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      // if (node$.onUnmounted) {
      //   node$.onUnmounted();
      // }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}
