import { TimelessElement, ViewChildren } from "@/content/type";
import { Modal, ModalProps } from "./modal";

/** An anchored, non-modal surface. Positioning and dismissal belong to the host. */
export type PopoverProps = Omit<ModalProps, "modal"> & {
  anchor: TimelessElement | (() => unknown);
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  offset?: number;
};

export function Popover(props: PopoverProps, children?: ViewChildren) {
  const {
    anchor,
    side = "bottom",
    align = "start",
    offset = 8,
    ...rest
  } = props;
  const surface = Modal({ ...rest, modal: false }, children);
  surface.t = "popover";
  Object.assign(surface.state, { anchor, side, align, offset });
  return surface;
}
