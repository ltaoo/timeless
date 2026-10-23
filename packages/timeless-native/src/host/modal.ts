import { TimelessElement, VNodeView } from "@timeless/timeless";
import { NativeView } from "./view";
import { requestNativeLayout } from "../stylesheet";

export function NativeModal(
  props: {
    build: (elm: TimelessElement) => VNodeView<any>;
    elm: TimelessElement;
  },
  kind = props.elm.t,
  anchor?: () => any,
) {
  const view = NativeView(props);
  function setOpen(open: boolean, modal = kind === "modal") {
    const node = view.get$elm();
    if (node.open === open && node.modal === modal) return;
    node.open = open;
    node.modal = modal;
    requestNativeLayout();
  }
  return {
    ...view,
    t: props.elm.t,
    setOpen,
    bindDismiss(onClose?: () => void) {
      const node = view.get$elm();
      const dismiss = () => (onClose ? onClose() : setOpen(false));
      node.listeners.dismiss = dismiss;
      return () => {
        if (node.listeners.dismiss === dismiss) delete node.listeners.dismiss;
      };
    },
    render() {
      const node = view.render() as any;
      Object.assign(node, {
        type: "floating",
        kind,
        open: Boolean(props.elm.state.open),
        modal:
          kind === "modal" &&
          props.elm.state.attributes?.["aria-modal"] === "true",
        side: props.elm.state.side ?? "bottom",
        align: props.elm.state.align ?? "start",
        offset: props.elm.state.offset ?? 8,
        crossOffset: props.elm.state.crossOffset ?? 0,
        drawerSide: props.elm.state.drawerSide,
      });
      Object.defineProperty(node, "anchor", {
        configurable: true,
        get: anchor ?? (() => {
          const target = props.elm.state.anchor;
          const resolved = typeof target === "function" ? target() : target?.$elm;
          return resolved?.get$elm?.() ?? resolved;
        }),
      });
      return node;
    },
  };
}
