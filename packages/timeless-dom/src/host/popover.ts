import { TimelessElement } from "@timeless/timeless";
import { DOMView } from "./view";

export function DOMPopover(props: {
  build: (elm: TimelessElement) => any;
  elm: TimelessElement;
}) {
  const view = DOMView(props);
  let previous: HTMLElement | null = null;
  let openDisplay = "";
  function anchor(): HTMLElement | undefined {
    const source = props.elm.state.anchor;
    const target = typeof source === "function" ? source() : source?.$elm;
    return target?.get$elm?.() ?? target;
  }
  function position() {
    const element = view.get$elm() as HTMLElement;
    const reference = anchor()?.getBoundingClientRect();
    if (!reference || !element.isConnected) return;
    const rect = element.getBoundingClientRect();
    const offset = props.elm.state.offset ?? 8;
    const side = props.elm.state.side ?? "bottom";
    const align = props.elm.state.align ?? "start";
    const crossOffset = props.elm.state.crossOffset ?? 0;
    let x =
      align === "end"
        ? reference.right - rect.width
        : align === "center"
          ? reference.left + (reference.width - rect.width) / 2
          : reference.left;
    let y =
      side === "top"
        ? reference.top - rect.height - offset
        : reference.bottom + offset;
    if (side === "left" || side === "right") {
      x =
        side === "left"
          ? reference.left - rect.width - offset
          : reference.right + offset;
      y =
        align === "end"
          ? reference.bottom - rect.height
          : align === "center"
            ? reference.top + (reference.height - rect.height) / 2
            : reference.top;
    } else if (
      y + rect.height > innerHeight &&
      reference.top > rect.height + offset
    )
      y = reference.top - rect.height - offset;
    if (side === "left" || side === "right") y += crossOffset;
    else x += crossOffset;
    element.style.left = `${Math.max(8, Math.min(x, innerWidth - rect.width - 8))}px`;
    element.style.top = `${Math.max(8, Math.min(y, innerHeight - rect.height - 8))}px`;
  }
  return {
    ...view,
    t: "popover",
    setOpen(open: boolean) {
      const element = view.get$elm() as HTMLElement;
      if (open) {
        if (!element.matches(":popover-open")) {
          previous = document.activeElement as HTMLElement;
          element.style.display = openDisplay;
          element.showPopover();
        }
        position();
        if (props.elm.state.attributes?.role !== "tooltip")
          element
            .querySelector<HTMLElement>(
              "button:not(:disabled), input:not(:disabled), [tabindex='0']",
            )
            ?.focus();
      } else {
        const restore =
          element.contains(document.activeElement) ||
          (!element.isConnected && document.activeElement === document.body);
        if (element.matches(":popover-open")) element.hidePopover();
        element.style.display = "none";
        if (restore && previous?.isConnected) previous.focus();
        previous = null;
      }
    },
    bindDismiss(onClose?: () => void) {
      const element = view.get$elm() as HTMLElement;
      const pointer = (event: PointerEvent) => {
        if (!element.matches(":popover-open")) return;
        if (
          !element.contains(event.target as Node) &&
          !anchor()?.contains(event.target as Node)
        )
          onClose?.();
      };
      const key = (event: KeyboardEvent) => {
        if (event.key === "Escape" && element.matches(":popover-open")) {
          event.preventDefault();
          onClose?.();
        }
      };
      document.addEventListener("pointerdown", pointer, true);
      document.addEventListener("keydown", key, true);
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
      return () => {
        document.removeEventListener("pointerdown", pointer, true);
        document.removeEventListener("keydown", key, true);
        window.removeEventListener("resize", position);
        window.removeEventListener("scroll", position, true);
      };
    },
    render() {
      const element = view.render() as HTMLElement;
      element.popover = "manual";
      openDisplay = element.style.display;
      element.style.display = "none";
      Object.assign(element.style, {
        position: "fixed",
        inset: "auto",
        margin: "0",
        maxHeight: "calc(100vh - 16px)",
        maxWidth: "calc(100vw - 16px)",
        overflow: "auto",
      });
      return element;
    },
  };
}
