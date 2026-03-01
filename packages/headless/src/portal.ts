import { View, ViewChildren, ViewProps } from "./view";

export function Portal(props: ViewProps & {}, children: ViewChildren) {
  const { onMounted, ...rest } = props;

  const view$ = View(rest, children);

  return {
    t: "view",
    $elm: view$.$elm,
    render() {
      const $elm = view$.render();
      const $fragment = document.createDocumentFragment();
      for (let i = 0; i < $elm.childNodes.length; i++) {
        $fragment.appendChild($elm.childNodes[i]);
      }
      if (props.onMounted) {
        props.onMounted($elm);
      }
      document.body.appendChild($fragment);
      return null;
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
  };
}
