import { DerivedRef, Ref } from "@timeless/inner-reactive";
import { ViewChildren } from "../content/type";
import { styleNames } from "../style";
import { Modal, ModalProps } from "./modal";

export type DrawerSide = "top" | "right" | "bottom" | "left";
export type DrawerProps = Omit<ModalProps, "open" | "modal"> & {
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  side?: DrawerSide;
};

/** A modal panel at a viewport edge, with the host's focus and dismissal behavior. */
export function Drawer(props: DrawerProps, children?: ViewChildren) {
  const { visible, side = "right", ...rest } = props;
  const vertical = side === "left" || side === "right";
  const surface = Modal(
    {
      ...rest,
      open: visible,
      style: styleNames([
        {
          margin: "0",
          position: "fixed",
          "max-width": "100vw",
          "max-height": "100vh",
          ...(vertical
            ? {
                top: "0",
                bottom: "0",
                height: "100vh",
                [side]: "0",
                [side === "right" ? "left" : "right"]: "auto",
              }
            : {
                left: "0",
                right: "0",
                width: "100vw",
                [side]: "0",
                [side === "bottom" ? "top" : "bottom"]: "auto",
              }),
        },
        rest.style,
      ]),
    },
    children,
  );
  Object.assign(surface.state, { drawerSide: side });
  return surface;
}
export type Drawer = ReturnType<typeof Drawer>;
