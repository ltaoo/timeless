import { computed, Fragment, Icon, ref, refobj } from "@timeless/timeless";
import { View, ViewChildren, ViewProps, Show } from "@timeless/timeless";
import { DialogPrimitive } from "@timeless/ui-primitive";
import { DialogCore, getGlobalLayerManager } from "@timeless/ui-vm";

const DIALOG_BASE_Z = 200;
const Z_INDEX_NEST_GAP = 50;

import { Button } from "./button";

export function Dialog(
  props: ViewProps & { store: DialogCore; zIndex?: number },
  children?: ViewChildren | (() => ViewChildren),
) {
  const { store, class: cls, style: sty, zIndex: manualZIndex, ...rest } = props;
  const state_ = refobj(store.state);
  const presence_state_ = refobj(store.presence.state);
  const was_exiting_ = ref(false);

  const zIndex = manualZIndex ?? DIALOG_BASE_Z + getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

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

  return DialogPrimitive.Root(
    {
      store,
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    () => [
      DialogPrimitive.Overlay({
        store,
        zIndex,
        class: computed(presence_state_, (d) => {
          const baseClass =
            "fixed inset-0 isolate bg-black/10 supports-backdrop-filter:backdrop-blur-xs";
          const enterClass = d.enter
            ? "animate-in fill-mode-both fade-in-0 duration-100 ease-out"
            : "";
          const exitClass = d.exit
            ? "animate-out fill-mode-both fade-out-0 duration-100 ease-in"
            : "";
          const keepExitClass =
            !d.mounted && was_exiting_.value ? exitClass : "";
          return [baseClass, enterClass, exitClass, keepExitClass]
            .filter(Boolean)
            .join(" ");
        }),
      }),
      View(
        {
          class:
            "fixed inset-0 flex items-start justify-center p-4 pt-[10vh]",
          style: { ...(sty as any), "z-index": zIndex },
        },
        [
          View(
            {
              style: computed(state_, (s) => {
                const rect = s.viewportRect;
                if (!rect) return {};
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                return {
                  position: "fixed",
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: "translate(-50%, -50%)",
                };
              }),
            },
            [
              DialogPrimitive.Content(
                {
                  ...rest,
                  store,
                  zIndex,
                  class: computed(presence_state_, (d) => {
                    const baseClass =
                      "relative w-full flex flex-col rounded-xl bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none transform-gpu max-h-[calc(90vh-2rem)]";
                    const enterClass = d.enter
                      ? "animate-in fill-mode-both fade-in-0 zoom-in-95 slide-in-from-top-2 duration-120 ease-out"
                      : "";
                    const exitClass = d.exit
                      ? "animate-out fill-mode-both fade-out-0 zoom-out-95 slide-out-to-top-2 duration-100 ease-in"
                      : "";
                    const keepExitClass =
                      !d.mounted && was_exiting_.value ? exitClass : "";
                    return [
                      baseClass,
                      enterClass,
                      exitClass,
                      keepExitClass,
                      cls,
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }),
                },
                [
                  Show({
                    when: computed(state_, (d) => !!d.title),
                    ok() {
                      return [
                        DialogPrimitive.Header(
                          {
                            store,
                            class: "flex flex-col gap-2 px-4 pt-4",
                          },
                          [
                            DialogPrimitive.Title(
                              {
                                store,
                                class: "text-base leading-none font-medium",
                              },
                              [computed(state_, (d) => d.title || "")],
                            ),
                          ],
                        ),
                      ];
                    },
                  }),
                  // DialogPrimitive.Body(
                  //   { store },
                  // ),
                  Fragment(
                    {},
                    typeof children === "function"
                      ? children()
                      : children || [],
                  ),
                  DialogPrimitive.Close(
                    {
                      store,
                      class:
                        "absolute right-2 top-2 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    },
                    [Icon({ name: "circle-x", size: 16 })],
                  ),
                  Show({
                    when: computed(state_, (d) => !!d.footer),
                    ok() {
                      return [
                        DialogPrimitive.Footer(
                          {
                            store,
                            class:
                              "flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/50 p-4 sm:flex-row sm:justify-end",
                          },
                          [
                            Button({ store: store.cancelBtn }, ["取消"]),
                            Button({ store: store.okBtn }, ["确认"]),
                          ],
                        ),
                      ];
                    },
                  }),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
