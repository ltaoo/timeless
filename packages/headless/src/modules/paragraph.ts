import { View, ViewChildren, ViewProps } from "@/primitive/view";

export function Paragraph(props: ViewProps & {}, children?: ViewChildren) {
  const node$ = View({ ...props, as: "p" }, children);
  return {
    t: "view",
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
