import { TimelessElement } from "@timeless/timeless";
import { DOMView } from "./view";
import { DOMPopover } from "./popover";

export function DOMTooltip(props: {
  build: (elm: TimelessElement) => any;
  elm: TimelessElement;
}) {
  const state = props.elm.state;
  const trigger = DOMView({
    ...props,
    elm: {
      ...props.elm,
      state: {
        style: { display: "inline-flex", alignSelf: "flex-start" },
        attributes: { n: `${state.attributes?.n ?? "tooltip"}-trigger` },
      },
    },
  });
  const surface = DOMPopover({
    ...props,
    elm: {
      ...props.elm,
      state: {
        ...state,
        anchor: () => trigger.get$elm(),
        attributes: { ...state.attributes, role: "tooltip" },
      },
      children: [state.content],
    },
  });
  let unbind: (() => void) | undefined;
  return {
    ...trigger,
    t: "tooltip",
    setVisible(visible: boolean) {
      if (visible && !unbind) unbind = surface.bindDismiss(state.onClose);
      surface.setOpen(visible);
      if (!visible) {
        unbind?.();
        unbind = undefined;
      }
    },
    removeChildren() {
      unbind?.();
      unbind = undefined;
      surface.removeChildren();
      trigger.removeChildren();
    },
    render() {
      const root = trigger.render();
      const popup = surface.render();
      popup.style.pointerEvents = "none";
      root.appendChild(popup);
      return root;
    },
  };
}
