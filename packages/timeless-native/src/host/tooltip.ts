import { TimelessElement, VNodeView } from "@timeless/timeless";
import { NativeView } from "./view";
import { NativeModal } from "./modal";
import { refreshNativeStyles } from "../stylesheet";

export function NativeTooltip(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}) {
  const state = props.elm.state;
  const trigger = NativeView({
    ...props,
    elm: {
      ...props.elm,
      state: {
        style: { alignSelf: "flex-start" },
        attributes: { n: `${state.attributes?.n ?? "tooltip"}-trigger` },
      },
    },
  });
  const surface = NativeModal(
    {
      ...props,
      elm: {
        ...props.elm,
        state: {
          ...state,
          open: state.visible,
          attributes: { ...state.attributes, role: "tooltip" },
        },
        children: [state.content],
      },
    },
    "tooltip",
    () => trigger.get$elm(),
  );
  return {
    ...surface,
    t: "tooltip",
    get$elm: trigger.get$elm,
    get $elm() {
      return trigger.get$elm();
    },
    setVisible(visible: boolean) {
      surface.setOpen(visible, false);
    },
    removeChildren() {
      surface.removeChildren();
      trigger.removeChildren();
    },
    render() {
      const root = trigger.render() as any;
      const popup = surface.render();
      popup.parentNode = root;
      root.children.push(popup);
      surface.bindDismiss(state.onClose);
      refreshNativeStyles(root);
      return root;
    },
  };
}
