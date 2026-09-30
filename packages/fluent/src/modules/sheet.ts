import { ui, vm } from "@timeless/timeless";
import { computed, ref, refobj } from "@timeless/timeless";
import {
  Fragment,
  Icon,
  Show,
  View,
  ViewChildren,
  ViewProps,
  classNames,
} from "@timeless/timeless";

/**
 * Sheet · Fluent 2（Drawer / Panel）
 *
 * 结构：
 *   Root(Portal + Presence)
 *     ├─ Overlay → .fl-sheet__scrim
 *     └─ Content → .fl-sheet.[fl-sheet--left|right|top|bottom]
 *          ├─ .fl-sheet__header（.fl-sheet__title + .fl-sheet__close）
 *          └─ .fl-sheet__body（children）
 *
 * Fluent 2 特征：--surface-1 底 + 1.5px --stroke1 描边 + --shadow-64。
 */

const SHEET_BASE_Z = 1040;
const Z_INDEX_NEST_GAP = 50;

const SIDE_CLASSES: Record<string, string> = {
  left: "fl-sheet--left",
  right: "fl-sheet--right",
  top: "fl-sheet--top",
  bottom: "fl-sheet--bottom",
};

export function Sheet(
  props: ViewProps & {
    store: vm.DialogCore;
    side?: "right" | "top" | "bottom" | "left";
    zIndex?: number;
  },
  children?: ViewChildren | (() => ViewChildren),
) {
  const {
    store,
    side = "right",
    zIndex: manualZIndex,
    class: cls,
    style: sty,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const presence_state_ = refobj(store.presence.state);
  const was_exiting_ = ref(false);

  const zIndex =
    manualZIndex ??
    SHEET_BASE_Z + vm.getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

  const unlistens = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
    store.presence.onStateChange((v) => {
      presence_state_.as(v);
      if (v.exit) {
        was_exiting_.as(true);
      }
      if (v.mounted) {
        was_exiting_.as(false);
      }
    }),
  ];

  return ui.SheetPrimitive.Root(
    {
      store,
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    () => [
      ui.SheetPrimitive.Overlay({
        store,
        zIndex,
        class: computed(presence_state_, (d) => {
          const keepExitClass =
            !d.mounted && was_exiting_.value ? "is-exit" : "";
          return [
            "fl-sheet__scrim",
            d.enter ? "is-enter" : "",
            d.exit ? "is-exit" : "",
            keepExitClass,
          ]
            .filter(Boolean)
            .join(" ");
        }),
      }),
      ui.SheetPrimitive.Content(
        {
          ...rest,
          store,
          side,
          style: { ...(sty as any), "z-index": zIndex },
          dataset: {
            open: computed(presence_state_, (d) => (d.mounted ? "" : undefined)),
          },
          class: computed(presence_state_, (d) => {
            const keepExitClass =
              !d.mounted && was_exiting_.value ? "is-exit" : "";
            return [
              "fl-sheet",
              SIDE_CLASSES[side] || "fl-sheet--right",
              d.enter ? "is-enter" : "",
              d.exit ? "is-exit" : "",
              keepExitClass,
              cls,
            ]
              .filter(Boolean)
              .join(" ");
          }),
        },
        [
          SheetHeader({ store }, [
            Show({
              when: computed(state_, (d: any) => !!d.title),
              ok() {
                return [
                  SheetTitle({ store }, [
                    computed(state_, (d: any) => d.title || ""),
                  ]),
                ];
              },
            }),
            SheetClose({ store }),
          ]),
          SheetBody({}, [
            Fragment(
              {},
              typeof children === "function" ? children() : children || [],
            ),
          ]),
        ],
      ),
    ],
  );
}

export function SheetHeader(
  props: ViewProps & { store?: vm.DialogCore },
  children?: ViewChildren,
) {
  const { class: cls, store, ...rest } = props;
  return ui.SheetPrimitive.Header(
    { ...rest, store: store as any, class: classNames(["fl-sheet__header", cls]) },
    children,
  );
}

export function SheetTitle(
  props: ViewProps & { store?: vm.DialogCore },
  children?: ViewChildren,
) {
  const { class: cls, store, ...rest } = props;
  const state_ = refobj(store ? store.state : ({} as any));
  if (store) {
    store.onStateChange((v) => {
      state_.as(v);
    });
  }
  return ui.SheetPrimitive.Title(
    { ...rest, store: store as any, class: classNames(["fl-sheet__title", cls]) },
    [
      Show({
        when: !!children,
        ok() {
          return children;
        },
        else() {
          return [computed(state_, (d: any) => d.title || "")];
        },
      }),
    ],
  );
}

export function SheetBody(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  // Sheet 没有对应的 body primitive，直接落到作用域内的 .fl-sheet__body。
  return View(
    { ...rest, class: classNames(["fl-sheet__body", cls]) },
    children,
  );
}

export function SheetClose(props: ViewProps & { store: vm.DialogCore }) {
  const { store, class: cls, ...rest } = props;
  return ui.SheetPrimitive.Close(
    {
      ...rest,
      store,
      as: "button",
      attributes: { type: "button", "aria-label": "Close" },
      class: classNames(["fl-sheet__close", cls]),
    },
    [Icon({ name: "circle-x", size: 16 })],
  );
}
