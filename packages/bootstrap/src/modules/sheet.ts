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
 * Sheet · Bootstrap 5.3
 *
 * 用上游的 Offcanvas 类名表达侧边抽屉：
 *   .offcanvas / .offcanvas-start|end|top|bottom
 *   .offcanvas-backdrop / .offcanvas-header / .offcanvas-title / .offcanvas-body
 *
 * Bootstrap 的类名是 start/end，而 headless 层用 left/right，
 * 这里做一层映射：left → .offcanvas-start，right → .offcanvas-end。
 *
 * 结构：.offcanvas > .offcanvas-header(.offcanvas-title + .btn-close)
 *                   + .offcanvas-body(children)
 */

const SHEET_BASE_Z = 1040;
const Z_INDEX_NEST_GAP = 50;

const SIDE_CLASSES: Record<string, string> = {
  left: "offcanvas-start",
  right: "offcanvas-end",
  top: "offcanvas-top",
  bottom: "offcanvas-bottom",
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
            "offcanvas-backdrop",
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
              "offcanvas",
              SIDE_CLASSES[side] || "offcanvas-end",
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
          // 与 Dialog 保持一致：header（title + .btn-close）与 body 由组件自己拼，
          // 调用方只负责传正文。Bootstrap 的 .offcanvas-header 同样是 flex +
          // space-between，关闭按钮必须和标题同处一层。
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
    { ...rest, store: store as any, class: classNames(["offcanvas-header", cls]) },
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
    { ...rest, store: store as any, class: classNames(["offcanvas-title", cls]) },
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
  // Offcanvas 没有对应的 headless primitive，直接落到作用域内的 .offcanvas-body。
  return View(
    { ...rest, class: classNames(["offcanvas-body", cls]) },
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
      class: classNames(["btn-close", cls]),
    },
    [],
  );
}
