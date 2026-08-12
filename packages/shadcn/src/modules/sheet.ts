import { ui, vm } from "@timeless/timeless";
import { computed, Icon, refobj } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

const SHEET_BASE_Z = 100;
const Z_INDEX_NEST_GAP = 50;

const WRAPPER_CLASSES = {
  right: "inset-y-0 right-0 h-full w-3/4 max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

const CONTENT_CLASSES = {
  right: "border-l",
  left: "border-r",
  top: "border-b",
  bottom: "border-t",
};

const ANIMATION_IN = {
  right: "slide-in-from-right",
  left: "slide-in-from-left",
  top: "slide-in-from-top",
  bottom: "slide-in-from-bottom",
};

const ANIMATION_OUT = {
  right: "slide-out-to-right",
  left: "slide-out-to-left",
  top: "slide-out-to-top",
  bottom: "slide-out-to-bottom",
};

export function Sheet(
  props: ViewProps & {
    store: vm.DialogCore;
    side?: "right" | "top" | "bottom" | "left";
    zIndex?: number;
  },
  children: ViewChildren | (() => ViewChildren) = [],
) {
  const { store, side = "right", zIndex: manualZIndex, ...rest } = props;
  const state_ = refobj(store.state);

  const zIndex =
    manualZIndex ??
    SHEET_BASE_Z + vm.getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

  store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.SheetPrimitive.Root({ store }, () => [
    ui.SheetPrimitive.Overlay({
      store,
      zIndex,
      class: computed(state_, (d) => {
        const baseClass = "fixed inset-0 bg-black/80";
        const enterClass = d.enter ? "animate-in fade-in duration-300" : "";
        const exitClass = d.exit ? "animate-out fade-out duration-300" : "";
        return [baseClass, enterClass, exitClass].filter(Boolean).join(" ");
      }),
    }),
    View(
      {
        class: `fixed ${WRAPPER_CLASSES[side]}`,
        style: { "z-index": zIndex },
      },
      [
        ui.SheetPrimitive.Content(
          {
            store,
            side,
            class: computed(state_, (d) => {
              const baseClass =
                "relative h-full w-full gap-4 bg-white p-6 shadow-lg ease-in-out dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition";
              const borderClass = CONTENT_CLASSES[side];
              const enterClass = d.enter
                ? `animate-in ${ANIMATION_IN[side]} duration-300`
                : "";
              const exitClass = d.exit
                ? `animate-out ${ANIMATION_OUT[side]} duration-300`
                : "";
              return [baseClass, borderClass, enterClass, exitClass]
                .filter(Boolean)
                .join(" ");
            }),
            ...rest,
          },
          [
            ui.SheetPrimitive.Close(
              {
                store,
                class:
                  "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer",
              },
              [Icon({ name: "x" })],
            ),
            // @ts-ignore
            typeof children === "function" ? children() : children,
          ],
        ),
      ],
    ),
  ]);
}
