import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

export function Paragraph(props: ViewProps & {}, children?: ViewChildren) {
  let $elm: any = null;

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {},
    render() {},
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
