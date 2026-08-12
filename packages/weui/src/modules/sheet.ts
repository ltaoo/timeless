import { ui, vm } from "@timeless/timeless";
import { computed, Icon, refobj } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

const SHEET_BASE_Z = 100;
const Z_INDEX_NEST_GAP = 50;

const SIDE_POS: Record<string, Record<string, string>> = {
  right: {
    top: "0",
    right: "0",
    bottom: "0",
    width: "75%",
    "max-width": "400px",
  },
  left: {
    top: "0",
    left: "0",
    bottom: "0",
    width: "75%",
    "max-width": "400px",
  },
  top: { top: "0", left: "0", right: "0" },
  bottom: { bottom: "0", left: "0", right: "0" },
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
      style: computed(state_, (d) => {
        const result: Record<string, string> = {
          position: "fixed",
          inset: "0",
          "z-index": `${zIndex}`,
          background: "var(--weui-OVERLAY)",
        };
        if (d.enter) {
          result.animation = "weui-fade-in 0.2s ease-out";
        }
        if (d.exit) {
          result.animation = "weui-fade-out 0.18s ease-in forwards";
        }
        return result;
      }),
    }),
    View(
      {
        style: {
          position: "fixed",
          "z-index": `${zIndex}`,
          ...(SIDE_POS[side] || SIDE_POS.right),
        },
      },
      [
        ui.SheetPrimitive.Content(
          {
            store,
            side,
            style: computed(state_, (d) => {
              const sideKey = SIDE_POS[side] ? side : "right";
              const result: Record<string, string> = {
                position: "relative",
                height: "100%",
                width: "100%",
                background: "var(--weui-BG-2)",
                padding: "var(--weui-CELL-GAP)",
                "box-shadow": "-2px 0 8px rgba(0,0,0,.1)",
              };
              if (d.enter) {
                result.animation = `weui-sheet-in-${sideKey} 0.2s ease-out forwards`;
              }
              if (d.exit) {
                result.animation = `weui-sheet-out-${sideKey} 0.16s ease-in forwards`;
              }
              return result;
            }),
            ...rest,
          },
          [
            ui.SheetPrimitive.Close(
              {
                store,
                style: {
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  cursor: "pointer",
                  color: "var(--weui-FG-2)",
                  "font-size": "18px",
                },
              },
              [Icon({ name: "x", size: 18 })],
            ),
            ...(typeof children === "function"
              ? (children() as any[])
              : (children as any[])),
          ],
        ),
      ],
    ),
  ]);
}
