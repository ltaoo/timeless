import { isRef, Ref, DerivedRef } from "@timeless/inner-reactive";
import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

/** Modal surface shape. Focus management and dismissal belong to the host. */
export type ModalProps = ViewProps & {
  open?: boolean | Ref<boolean> | DerivedRef<boolean>;
  modal?: boolean;
  onClose?: () => void;
};
export function Modal(props: ModalProps = {}, children?: ViewChildren) {
  const { open = false, modal = true, onClose, ...rest } = props;
  const value = () => (isRef(open) ? open.value : open);
  const view = View(
    {
      ...rest,
      attributes: {
        role: "dialog",
        "aria-modal": modal ? "true" : undefined,
        ...rest.attributes,
      },
      onMounted(event) {
        const host = event.target as typeof event.target & {
          setOpen?: (open: boolean, modal: boolean) => void;
          bindDismiss?: (onClose?: () => void) => () => void;
        };
        const unbind = host.bindDismiss?.(onClose);
        const sync = () => host.setOpen?.(Boolean(value()), modal);
        sync();
        const unsubscribe = isRef(open)
          ? open.subscribe({ onChange: sync })
          : undefined;
        const cleanup = rest.onMounted?.(event);
        return () => {
          unsubscribe?.();
          unbind?.();
          host.setOpen?.(false, modal);
          cleanup?.();
        };
      },
    },
    children,
  );
  view.t = "modal";
  Object.defineProperty(view.state, "open", {
    enumerable: true,
    get: () => Boolean(value()),
  });
  return view;
}
export type Modal = ReturnType<typeof Modal>;
