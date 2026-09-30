import { ui, vm } from "@timeless/timeless";
import { computed, ref, refobj } from "@timeless/timeless";
import {
  Fragment,
  Show,
  View,
  ViewChildren,
  ViewProps,
  classNames,
} from "@timeless/timeless";

/**
 * Sheet · Material 3
 *
 * M3 侧边面板（navigation drawer / side sheet）：24px 圆角（贴边那侧为 0），
 * `--surface-container-low` 底色，进出场走 --easing-emphasized + --duration-medium。
 *
 * 类名（`m3-sheet` 命名空间）：
 *   .m3-sheet__scrim + .m3-sheet.[is-left|is-right|is-top|is-bottom]
 *     > .m3-sheet__header (.m3-sheet__title + .m3-sheet__close)
 *     + .m3-sheet__body(children)
 *
 * 结构：与 Dialog 一致，header（title + close）与 body 由组件自己拼，
 * 调用方只负责传正文。
 */

const SHEET_BASE_Z = 1040;
const Z_INDEX_NEST_GAP = 50;

const SIDE_CLASSES: Record<string, string> = {
  left: "m3-sheet--left",
  right: "m3-sheet--right",
  top: "m3-sheet--top",
  bottom: "m3-sheet--bottom",
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
            "m3-sheet__scrim",
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
              "m3-sheet",
              SIDE_CLASSES[side] || "m3-sheet--right",
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
    {
      ...rest,
      store: store as any,
      class: classNames(["m3-sheet__header", cls]),
    },
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
    { ...rest, store: store as any, class: classNames(["m3-sheet__title", cls]) },
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
  // Sheet 没有对应的 headless body primitive，直接落到作用域内的 .m3-sheet__body。
  return View({ ...rest, class: classNames(["m3-sheet__body", cls]) }, children);
}

export function SheetClose(props: ViewProps & { store: vm.DialogCore }) {
  const { store, class: cls, ...rest } = props;
  return ui.SheetPrimitive.Close(
    {
      ...rest,
      store,
      as: "button",
      attributes: { type: "button", "aria-label": "Close" },
      class: classNames(["m3-sheet__close", cls]),
    },
    [],
  );
}
