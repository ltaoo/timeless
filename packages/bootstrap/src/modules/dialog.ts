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

import { Button } from "./button";

/**
 * Dialog · Bootstrap 5.3
 *
 * 类名沿用上游：.modal / .modal-backdrop / .modal-dialog / .modal-content /
 * .modal-header / .modal-title / .modal-body / .modal-footer / .btn-close。
 *
 * 结构：
 *   Root(Portal + Presence)
 *     ├─ Overlay   → .modal-backdrop
 *     └─ .modal                （全屏定位层，承载 z-index）
 *          └─ Content          （DismissableLayer，点击外部关闭）
 *               └─ .modal-dialog > .modal-content
 *                    ├─ .modal-header  (Show: store.title + .btn-close)
 *                    ├─ .modal-body
 *                    └─ .modal-footer  (Show: store.footer)
 *
 * 注意：DismissableLayer 挂在 Content 上，所以 Content 必须是“对话框盒子”
 * 而不是全屏遮罩，否则点击遮罩会被判定为“内部点击”而无法关闭。
 */

const DIALOG_BASE_Z = 1050;
const Z_INDEX_NEST_GAP = 50;

export function Dialog(
  props: ViewProps & { store: vm.DialogCore; zIndex?: number },
  children?: ViewChildren | (() => ViewChildren),
) {
  const {
    store,
    class: cls,
    style: sty,
    zIndex: manualZIndex,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const presence_state_ = refobj(store.presence.state);
  const was_exiting_ = ref(false);

  const zIndex =
    manualZIndex ??
    DIALOG_BASE_Z + vm.getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

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

  return ui.DialogPrimitive.Root(
    {
      store,
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    () => [
      ui.DialogPrimitive.Overlay({
        store,
        zIndex,
        class: computed(presence_state_, (d) => {
          const exitClass = d.exit ? "is-exit" : "";
          const keepExitClass =
            !d.mounted && was_exiting_.value ? "is-exit" : "";
          return [
            "modal-backdrop",
            d.enter ? "is-enter" : "",
            exitClass,
            keepExitClass,
          ]
            .filter(Boolean)
            .join(" ");
        }),
      }),
      View(
        {
          class: "modal",
          style: { ...(sty as any), "z-index": zIndex },
          dataset: {
            open: computed(presence_state_, (d) => (d.mounted ? "" : undefined)),
          },
        },
        [
          ui.DialogPrimitive.Content(
            {
              ...rest,
              store,
              zIndex,
              class: computed(presence_state_, (d) => {
                const exitClass = d.exit ? "is-exit" : "";
                const keepExitClass =
                  !d.mounted && was_exiting_.value ? "is-exit" : "";
                return [
                  "modal-dialog",
                  "modal-dialog-centered",
                  d.enter ? "is-enter" : "",
                  exitClass,
                  keepExitClass,
                  cls,
                ]
                  .filter(Boolean)
                  .join(" ");
              }),
            },
            [
              View({ class: "modal-content" }, [
                // Bootstrap 的 .modal-header 是 flex + space-between，标题与
                // .btn-close 必须同处其中，否则关闭按钮会变成 header 外的独立一行。
                DialogHeader({ store }, [
                  Show({
                    when: computed(state_, (d) => !!d.title),
                    ok() {
                      return [
                        DialogTitle({ store }, [
                          computed(state_, (d) => d.title || ""),
                        ]),
                      ];
                    },
                  }),
                  DialogClose({ store }),
                ]),
                DialogBody({ store }, [
                  Fragment(
                    {},
                    typeof children === "function" ? children() : children || [],
                  ),
                ]),
                Show({
                  when: computed(state_, (d) => !!d.footer),
                  ok() {
                    return [
                      DialogFooter({ store }, [
                        Button(
                          {
                            store: store.cancelBtn,
                            class: "btn-secondary",
                          },
                          ["取消"],
                        ),
                        Button({ store: store.okBtn, class: "btn-primary" }, [
                          "确认",
                        ]),
                      ]),
                    ];
                  },
                }),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
}

export function DialogHeader(
  props: ViewProps & { store?: vm.DialogCore },
  children?: ViewChildren,
) {
  const { class: cls, store, ...rest } = props;
  return ui.DialogPrimitive.Header(
    { ...rest, store: store as any, class: classNames(["modal-header", cls]) },
    children,
  );
}

export function DialogTitle(
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
  return ui.DialogPrimitive.Title(
    { ...rest, store, class: classNames(["modal-title", cls]) },
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

export function DialogBody(
  props: ViewProps & { store?: vm.DialogCore },
  children?: ViewChildren,
) {
  const { class: cls, store, ...rest } = props;
  return ui.DialogPrimitive.Body(
    { ...rest, store: store as any, class: classNames(["modal-body", cls]) },
    children,
  );
}

export function DialogFooter(
  props: ViewProps & { store?: vm.DialogCore },
  children?: ViewChildren,
) {
  const { class: cls, store, ...rest } = props;
  return ui.DialogPrimitive.Footer(
    { ...rest, store: store as any, class: classNames(["modal-footer", cls]) },
    children,
  );
}

export function DialogClose(props: ViewProps & { store: vm.DialogCore }) {
  const { store, class: cls, ...rest } = props;
  return ui.DialogPrimitive.Close(
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
