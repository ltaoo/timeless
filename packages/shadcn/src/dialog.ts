import { computed, refobj } from "@timeless/reactive";
import {
  DialogPrimitive,
  View,
  ViewChildren,
  ViewProps,
  Show,
  Txt,
} from "@timeless/headless";
import { DialogCore } from "@timeless/ui";

import { Button } from "./button";

export function Dialog(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return DialogPrimitive.Root({ store }, [
    DialogPrimitive.Overlay({
      store,
      class: computed(state_, (d) => {
        const baseClass = "fixed inset-0 z-50 bg-black/80";
        const enterClass = d.enter ? "animate-in fade-in duration-300" : "";
        const exitClass = d.exit ? "animate-out fade-out duration-300" : "";
        return [baseClass, enterClass, exitClass].filter(Boolean).join(" ");
      }),
    }),
    View(
      {
        class: "fixed inset-0 z-50 flex items-center justify-center p-4",
        onClick: (e: Event) => {
          if (e.target === e.currentTarget && store.closeable) {
            store.hide();
          }
        },
      },
      [
        DialogPrimitive.Content(
          {
            store,
            class: computed(state_, (d) => {
              const baseClass =
                "relative w-full max-w-lg grid gap-4 border border-zinc-200 bg-white p-6 shadow-lg sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-950";
              const enterClass = d.enter
                ? "animate-in fade-in-0 zoom-in-95 duration-300"
                : "";
              const exitClass = d.exit
                ? "animate-out fade-out-0 zoom-out-95 duration-300"
                : "";
              return [baseClass, enterClass, exitClass]
                .filter(Boolean)
                .join(" ");
            }),
            ...rest,
          },
          [
            Show({ when: computed(state_, (d) => !!d.title) }, [
              DialogPrimitive.Header(
                {
                  store,
                  class: "flex flex-col space-y-1.5 text-center sm:text-left",
                },
                [
                  DialogPrimitive.Title(
                    {
                      store,
                      class:
                        "text-lg font-semibold leading-none tracking-tight",
                    },
                    [Txt(computed(state_, (d) => d.title || ""))],
                  ),
                ],
              ),
            ]),
            DialogPrimitive.Body({ store }, children || []),
            DialogPrimitive.Close(
              {
                store,
                class:
                  "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 cursor-pointer",
              },
              [Txt("✕")],
            ),
            Show({ when: computed(state_, (d) => !!d.footer) }, [
              DialogPrimitive.Footer(
                {
                  store,
                  class:
                    "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                },
                [
                  Button({ store: store.cancelBtn, variant: "secondary" }, [
                    "取消",
                  ]),
                  Button({ store: store.okBtn }, ["确认"]),
                ],
              ),
            ]),
          ],
        ),
      ],
    ),
  ]);
}
