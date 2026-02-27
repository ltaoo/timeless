import { View } from "./view.js";

export function Portal(props: any, children?: any) {
  const view$ = View(props, children);

  return {
    t: "view",
    $elm: view$.$elm,
    render() {
      const $elm = view$.render();
      document.body.appendChild($elm);
      return null;
    },
    onMounted() {
      if (view$.onMounted) {
        view$.onMounted();
      }
    },
    onUnmounted() {
      if (view$.$elm && view$.$elm.parentNode) {
        view$.$elm.parentNode.removeChild(view$.$elm);
      }
      if (view$.onUnmounted) {
        view$.onUnmounted();
      }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    append(node: any) {
      view$.append(node);
    },
    setContent(html: string) {
      view$.setContent(html);
    },
    // class$: view$.class$,
  };
}
